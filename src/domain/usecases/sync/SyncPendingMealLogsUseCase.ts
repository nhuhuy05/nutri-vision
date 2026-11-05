import { IMealLogRepository } from '../../repositories/IMealLogRepository';
import { ISyncRepository, SyncStats } from '../../repositories/ISyncRepository';
import { INetworkInfo } from '../../repositories/INetworkInfo';
import { Result, ok, fail } from '../../common/Result';
import { Failure, NetworkFailure } from '../../common/Failure';

export class SyncPendingMealLogsUseCase {
  constructor(
    private mealLogRepo: IMealLogRepository,
    private syncRepo: ISyncRepository,
    private networkInfo: INetworkInfo
  ) {}

  async execute(): Promise<Result<SyncStats, Failure>> {
    const isOnline = await this.networkInfo.isConnected();
    if (!isOnline) {
      return fail(new NetworkFailure('Không có kết nối mạng'));
    }

    const pendingResult = await this.mealLogRepo.getPendingSyncLogs();
    if (!pendingResult.success) {
      return fail(pendingResult.error);
    }

    const pending = pendingResult.data;
    if (pending.length === 0) {
      return ok({ syncedCount: 0, pendingCount: 0 });
    }

    return this.syncRepo.syncPendingMealLogs(pending);
  }
}
