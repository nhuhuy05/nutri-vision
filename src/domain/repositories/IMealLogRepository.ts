import { MealLog } from '../entities/MealLog';
import { Result } from '../common/Result';
import { Failure } from '../common/Failure';

export interface IMealLogRepository {
  saveMealLog(log: MealLog): Promise<Result<void, Failure>>;
  getMealLogsByDate(date: string): Promise<Result<MealLog[], Failure>>;
  getAllMealLogs(): Promise<Result<MealLog[], Failure>>;
  deleteMealLog(id: string): Promise<Result<void, Failure>>;
  getPendingSyncLogs(): Promise<Result<MealLog[], Failure>>;
  markLogAsSynced(id: string): Promise<Result<void, Failure>>;
}
