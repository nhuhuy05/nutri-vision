import { IMealLogRepository } from '../../repositories/IMealLogRepository';
import { ISyncRepository, SyncResult } from '../../repositories/ISyncRepository';

export class SyncMealLogsUseCase {
  constructor(
    private mealLogRepo: IMealLogRepository,
    private syncRepo: ISyncRepository
  ) {}

  async execute(isConnected: boolean): Promise<SyncResult> {
    const pending = await this.mealLogRepo.getPendingSyncLogs();
    if (!isConnected) {
      return {
        success: false,
        syncedCount: 0,
        pendingCount: pending.length,
        error: 'Không có kết nối mạng',
      };
    }

    if (pending.length === 0) {
      return {
        success: true,
        syncedCount: 0,
        pendingCount: 0,
      };
    }

    const result = await this.syncRepo.syncLogs(pending);

    // If items synced successfully, update remaining pending count
    const remaining = await this.mealLogRepo.getPendingSyncLogs();
    return {
      ...result,
      pendingCount: remaining.length,
    };
  }
}

