import { MealLog } from '../entities/MealLog';

export interface IMealLogRepository {
  saveMealLog(log: MealLog): Promise<void>;
  getMealLogsByDate(date: string): Promise<MealLog[]>;
  deleteMealLog(id: string): Promise<void>;
  getPendingSyncLogs(): Promise<MealLog[]>;
  markLogAsSynced(id: string): Promise<void>;
}

