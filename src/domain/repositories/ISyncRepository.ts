import { MealLog } from '../entities/MealLog';
import { Result } from '../common/Result';
import { Failure } from '../common/Failure';

export interface SyncStats {
  syncedCount: number;
  pendingCount: number;
}

export interface ISyncRepository {
  syncPendingMealLogs(pending: MealLog[]): Promise<Result<SyncStats, Failure>>;
  pullRemoteChanges(userId: string): Promise<Result<MealLog[], Failure>>;
  getPendingCount(): Promise<Result<number, Failure>>;
}
