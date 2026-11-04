import { MealLog } from '../entities/MealLog';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  pendingCount: number;
  error?: string;
}

export interface ISyncRepository {
  syncLogs(pendingLogs: MealLog[]): Promise<SyncResult>;
}

