import { IMealLogRepository } from '../../domain/repositories/IMealLogRepository';
import { MealLog } from '../../domain/entities/MealLog';
import { Result, ok, fail } from '../../domain/common/Result';
import { Failure } from '../../domain/common/Failure';
import { MealLogLocalDataSource } from '../datasources/local/MealLogLocalDataSource';
import { MealLogMapper } from '../mappers/MealLogMapper';
import { ErrorMapper } from '../infrastructure/ErrorMapper';

export class MealLogRepositoryImpl implements IMealLogRepository {
  constructor(private localDataSource: MealLogLocalDataSource) {}

  async saveMealLog(log: MealLog): Promise<Result<void, Failure>> {
    try {
      const dto = MealLogMapper.toDTO(log);
      await this.localDataSource.insertOrUpdate(dto);
      return ok(undefined);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async getMealLogsByDate(date: string): Promise<Result<MealLog[], Failure>> {
    try {
      const dtos = await this.localDataSource.getByDate(date);
      return ok(dtos.map(MealLogMapper.toDomain));
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async getAllMealLogs(): Promise<Result<MealLog[], Failure>> {
    try {
      const dtos = await this.localDataSource.getAll();
      return ok(dtos.map(MealLogMapper.toDomain));
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async deleteMealLog(id: string): Promise<Result<void, Failure>> {
    try {
      await this.localDataSource.softDelete(id);
      return ok(undefined);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async getPendingSyncLogs(): Promise<Result<MealLog[], Failure>> {
    try {
      const dtos = await this.localDataSource.getPendingSync();
      return ok(dtos.map(MealLogMapper.toDomain));
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async markLogAsSynced(id: string): Promise<Result<void, Failure>> {
    try {
      await this.localDataSource.markAsSynced(id);
      return ok(undefined);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }
}
