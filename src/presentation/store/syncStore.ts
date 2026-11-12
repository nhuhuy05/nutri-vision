import { create } from 'zustand';
import { AppState, type AppStateStatus } from 'react-native';
import * as Network from 'expo-network';
import {
  syncPendingMealLogsUseCase,
  getPendingSyncCountUseCase,
  pullRemoteChangesUseCase,
  networkInfo,
} from '../../di/container';
import { queryClient } from '../query/queryClient';
import { queryKeys } from '../query/queryKeys';
import { useAuthStore } from './authStore';
import { GUEST_USER_ID } from '../../domain/constants/defaultGoals';

interface SyncState {
  pendingCount: number;
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  refreshPendingCount: () => Promise<void>;
  checkOnlineStatus: () => Promise<boolean>;
  syncNow: () => Promise<boolean>;
  autoSyncIfOnline: () => Promise<boolean>;
  initAutoSync: () => void;
}

let isAutoSyncInitialized = false;

export const useSyncStore = create<SyncState>((set, get) => ({
  pendingCount: 0,
  isSyncing: false,
  isOnline: true,
  lastSyncedAt: null,
  error: null,

  checkOnlineStatus: async () => {
    try {
      const online = await networkInfo.isConnected();
      set({ isOnline: online });
      return online;
    } catch {
      set({ isOnline: false });
      return false;
    }
  },

  refreshPendingCount: async () => {
    try {
      const result = await getPendingSyncCountUseCase.execute();
      if (result.success) {
        set({ pendingCount: result.data });
      }
    } catch (e) {
      console.warn('Error refreshing pending sync count:', e);
    }
  },

  syncNow: async () => {
    if (get().isSyncing) return false;
    set({ isSyncing: true, error: null });

    try {
      // 1. Đẩy dữ liệu nhật ký đang chờ từ SQLite cục bộ lên Supabase
      const pushResult = await syncPendingMealLogsUseCase.execute();

      // 2. Kéo dữ liệu mới nhất từ Supabase về SQLite nếu đã đăng nhập tài khoản
      const currentUserId = useAuthStore.getState().user?.id;
      if (currentUserId && currentUserId !== GUEST_USER_ID) {
        try {
          await pullRemoteChangesUseCase.execute(currentUserId);
        } catch (pullErr) {
          console.warn('[Sync] Pull remote changes error:', pullErr);
        }
      }

      if (pushResult.success) {
        set({
          isSyncing: false,
          pendingCount: pushResult.data.pendingCount,
          lastSyncedAt: new Date().toISOString(),
        });

        // Invalidate React Query cache để cập nhật giao diện tự động
        await queryClient.invalidateQueries({ queryKey: queryKeys.mealLogs.all });
        await queryClient.invalidateQueries({ queryKey: ['summary'] });
        await queryClient.invalidateQueries({ queryKey: ['report'] });
        return true;
      } else {
        set({
          isSyncing: false,
          error: pushResult.error.message,
        });
        return false;
      }
    } catch (e) {
      set({
        isSyncing: false,
        error: e instanceof Error ? e.message : 'Lỗi đồng bộ dữ liệu',
      });
      return false;
    }
  },

  autoSyncIfOnline: async () => {
    const isOnline = await get().checkOnlineStatus();
    if (isOnline && !get().isSyncing) {
      await get().refreshPendingCount();
      if (get().pendingCount > 0) {
        return get().syncNow();
      }
    }
    return false;
  },

  initAutoSync: () => {
    if (isAutoSyncInitialized) return;
    isAutoSyncInitialized = true;

    // 1. Kiểm tra và tự động đồng bộ ngay khi ứng dụng khởi chạy
    void (async () => {
      const isOnline = await get().checkOnlineStatus();
      await get().refreshPendingCount();
      if (isOnline && (get().pendingCount > 0 || useAuthStore.getState().isAuthenticated)) {
        console.log('[AutoSync] Tự động đồng bộ khi khởi chạy ứng dụng...');
        void get().syncNow();
      }
    })();

    // 2. Tự động đồng bộ ngay khi thiết bị có kết nối mạng (Internet reconnected)
    try {
      Network.addNetworkStateListener(async (state) => {
        const isConnected = Boolean(state.isConnected && state.isInternetReachable !== false);
        const wasOffline = !get().isOnline;
        set({ isOnline: isConnected });

        if (isConnected && wasOffline) {
          console.log('[AutoSync] Phát hiện có kết nối Internet -> Tự động đồng bộ ngay!');
          await get().refreshPendingCount();
          void get().syncNow();
        }
      });
    } catch (e) {
      console.warn('[AutoSync] Không thể đăng ký listener mạng:', e);
    }

    // 3. Tự động đồng bộ khi người dùng mở lại app (Foreground / Active)
    AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const isOnline = await get().checkOnlineStatus();
        if (isOnline) {
          await get().refreshPendingCount();
          if (get().pendingCount > 0 && !get().isSyncing) {
            console.log('[AutoSync] Ứng dụng hoạt động trở lại -> Tự động đồng bộ!');
            void get().syncNow();
          }
        }
      }
    });

    // 4. Kiểm tra định kỳ ngầm mỗi 45 giây để đảm bảo không bỏ sót dữ liệu
    setInterval(async () => {
      const isOnline = await get().checkOnlineStatus();
      if (isOnline && !get().isSyncing) {
        await get().refreshPendingCount();
        if (get().pendingCount > 0) {
          console.log('[AutoSync] Kiểm tra định kỳ: Có dữ liệu mới -> Tự động đồng bộ!');
          void get().syncNow();
        }
      }
    }, 45000);
  },
}));
