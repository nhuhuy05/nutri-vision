import { useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSyncStore } from '../store/syncStore';

export function useSync() {
  const {
    pendingCount,
    isSyncing,
    isOnline,
    lastSyncedAt,
    error,
    refreshPendingCount,
    checkOnlineStatus,
    syncNow,
  } = useSyncStore();

  const handleTriggerSync = useCallback(async () => {
    const online = await checkOnlineStatus();
    if (online) {
      await syncNow();
    }
  }, [checkOnlineStatus, syncNow]);

  useEffect(() => {
    checkOnlineStatus();
    refreshPendingCount();

    // Trigger sync on foreground state change
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkOnlineStatus();
        refreshPendingCount();
        handleTriggerSync();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkOnlineStatus, refreshPendingCount, handleTriggerSync]);

  return {
    pendingCount,
    isSyncing,
    isOnline,
    lastSyncedAt,
    error,
    syncNow: handleTriggerSync,
    refreshPendingCount,
    checkOnlineStatus,
  };
}
