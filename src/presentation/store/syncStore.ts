import { create } from 'zustand';
import {
  syncPendingMealLogsUseCase,
  getPendingSyncCountUseCase,
  networkInfo,
} from '../../di/container';
import { queryClient } from '../query/queryClient';
import { queryKeys } from '../query/queryKeys';

interface SyncState {
  pendingCount: number;
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  refreshPendingCount: () => Promise<void>;
  checkOnlineStatus: () => Promise<boolean>;
  syncNow: () => Promise<boolean>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  pendingCount: 0,
  isSyncing: false,
  isOnline: true,
  lastSyncedAt: null,
  error: null,

  checkOnlineStatus: async () => {
    const online = await networkInfo.isConnected();
    set({ isOnline: online });
    return online;
  },

  refreshPendingCount: async () => {
    const result = await getPendingSyncCountUseCase.execute();
    if (result.success) {
      set({ pendingCount: result.data });
    }
  },

  syncNow: async () => {
    if (get().isSyncing) return false;
    set({ isSyncing: true, error: null });

    const result = await syncPendingMealLogsUseCase.execute();
    if (result.success) {
      set({
        isSyncing: false,
        pendingCount: result.data.pendingCount,
        lastSyncedAt: new Date().toISOString(),
      });

      // Invalidate relevant server/local queries to refresh UI
      await queryClient.invalidateQueries({ queryKey: queryKeys.mealLogs.all });
      return true;
    } else {
      set({
        isSyncing: false,
        error: result.error.message,
      });
      return false;
    }
  },
}));
