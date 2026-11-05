import { ISyncRepository, SyncStats } from '../../domain/repositories/ISyncRepository';
import { MealLog } from '../../domain/entities/MealLog';
import { Result, ok, fail } from '../../domain/common/Result';
import { Failure } from '../../domain/common/Failure';
import { MealLogLocalDataSource } from '../datasources/local/MealLogLocalDataSource';
import { MealLogRemoteDataSource } from '../datasources/remote/MealLogRemoteDataSource';
import { SyncMetaLocalDataSource } from '../datasources/local/SyncMetaLocalDataSource';
import { MealLogDTO } from '../dto/MealLogDTO';
import { MealLogMapper } from '../mappers/MealLogMapper';
import { ErrorMapper } from '../infrastructure/ErrorMapper';

export class SyncRepositoryImpl implements ISyncRepository {
  constructor(
    private mealLogLocalDataSource: MealLogLocalDataSource,
    private mealLogRemoteDataSource: MealLogRemoteDataSource,
    private syncMetaLocalDataSource: SyncMetaLocalDataSource
  ) {}

  async syncPendingMealLogs(pending: MealLog[]): Promise<Result<SyncStats, Failure>> {
    try {
      if (pending.length === 0) {
        return ok({ syncedCount: 0, pendingCount: 0 });
      }

      // Convert to remote DTOs and upsert to Supabase
      const remoteDtos = pending.map(MealLogMapper.toRemoteDTO);
      await this.mealLogRemoteDataSource.upsertMealLogs(remoteDtos);

      // Mark locally as synced
      for (const item of pending) {
        await this.mealLogLocalDataSource.markAsSynced(item.id);
      }

      const remainingPending = await this.mealLogLocalDataSource.getPendingSync();
      return ok({
        syncedCount: pending.length,
        pendingCount: remainingPending.length,
      });
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async pullRemoteChanges(userId: string): Promise<Result<MealLog[], Failure>> {
    try {
      const lastPulledAt = (await this.syncMetaLocalDataSource.getLastPulledAt()) || '1970-01-01T00:00:00.000Z';
      const remoteChanges = await this.mealLogRemoteDataSource.fetchMealLogsSince(userId, lastPulledAt);

      const pulledLogs: MealLog[] = [];
      for (const remoteDto of remoteChanges) {
        const localDto: MealLogDTO = {
          ...remoteDto,
          photo_uri: remoteDto.photo_uri ?? null,
          updated_at: remoteDto.updated_at ?? null,
          deleted_at: null,
          synced: 1,
        };
        await this.mealLogLocalDataSource.insertOrUpdate(localDto);
        pulledLogs.push(MealLogMapper.toDomain(localDto));
      }

      const newCursor = new Date().toISOString();
      await this.syncMetaLocalDataSource.setLastPulledAt(newCursor);

      return ok(pulledLogs);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async getPendingCount(): Promise<Result<number, Failure>> {
    try {
      const pending = await this.mealLogLocalDataSource.getPendingSync();
      return ok(pending.length);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }
}
