import { checkNetworkStatus } from './network';
import { getPendingSyncLogs, markLogAsSynced } from './database';
import { supabase } from './supabase';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  pendingCount: number;
  error?: string;
}

export async function syncMealLogs(): Promise<SyncResult> {
  const network = await checkNetworkStatus();
  if (!network.isConnected) {
    const pending = await getPendingSyncLogs();
    return {
      success: false,
      syncedCount: 0,
      pendingCount: pending.length,
      error: 'Không có kết nối mạng',
    };
  }

  const pending = await getPendingSyncLogs();
  if (pending.length === 0) {
    return {
      success: true,
      syncedCount: 0,
      pendingCount: 0,
    };
  }

  let syncedCount = 0;

  for (const log of pending) {
    try {
      // Attempt to upsert to Supabase
      const { error } = await supabase.from('meal_logs').upsert({
        id: log.id,
        user_id: log.userId,
        date: log.date,
        meal_type: log.mealType,
        food_id: log.foodId,
        food_name: log.foodName,
        portion_multiplier: log.portionMultiplier,
        calories: log.calories,
        protein: log.protein,
        carbs: log.carbs,
        fat: log.fat,
        created_at: log.createdAt,
      });

      if (!error) {
        await markLogAsSynced(log.id);
        syncedCount++;
      }
    } catch (err) {
      console.warn('Sync failed for item', log.id, err);
    }
  }

  const remaining = await getPendingSyncLogs();
  return {
    success: syncedCount > 0,
    syncedCount,
    pendingCount: remaining.length,
  };
}

