import { IMealLogRepository } from '../../domain/repositories/IMealLogRepository';
import { MealLog } from '../../domain/entities/MealLog';
import {
  insertOrReplaceMealLog,
  queryMealLogsByDate,
  deleteMealLogById,
  queryPendingSyncMealLogs,
  updateMealLogSyncedStatus,
} from '../datasources/local/database';
import { NutritionMapper } from '../mappers/NutritionMapper';

export class MealLogRepositoryImpl implements IMealLogRepository {
  async saveMealLog(log: MealLog): Promise<void> {
    const dto = NutritionMapper.toMealLogDTO(log);
    await insertOrReplaceMealLog(dto);
  }

  async getMealLogsByDate(date: string): Promise<MealLog[]> {
    const dtos = await queryMealLogsByDate(date);
    return dtos.map(NutritionMapper.toMealLogDomain);
  }

  async deleteMealLog(id: string): Promise<void> {
    await deleteMealLogById(id);
  }

  async getPendingSyncLogs(): Promise<MealLog[]> {
    const dtos = await queryPendingSyncMealLogs();
    return dtos.map(NutritionMapper.toMealLogDomain);
  }

  async markLogAsSynced(id: string): Promise<void> {
    await updateMealLogSyncedStatus(id, true);
  }
}

