import { ISyncRepository, SyncResult } from '../../domain/repositories/ISyncRepository';
import { MealLog } from '../../domain/entities/MealLog';
import { supabase } from '../datasources/remote/supabaseClient';
import { updateMealLogSyncedStatus } from '../datasources/local/database';

export class SyncRepositoryImpl implements ISyncRepository {
  async syncLogs(pendingLogs: MealLog[]): Promise<SyncResult> {
    let syncedCount = 0;

    for (const log of pendingLogs) {
      try {
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
          await updateMealLogSyncedStatus(log.id, true);
          syncedCount++;
        }
      } catch (err) {
        console.warn('Sync failed for item', log.id, err);
      }
    }

    return {
      success: syncedCount > 0,
      syncedCount,
      pendingCount: pendingLogs.length - syncedCount,
    };
  }
}

