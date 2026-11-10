import { IMealLogRepository } from '../../domain/repositories/IMealLogRepository';
import { MealLog } from '../../domain/entities/MealLog';
import { Result, ok, fail } from '../../domain/common/Result';
import { Failure } from '../../domain/common/Failure';
import { MealLogLocalDataSource } from '../datasources/local/MealLogLocalDataSource';
import { toMealLogEntity, toMealLogInsertData } from '../mappers/mealMapper';
import { ErrorMapper } from '../infrastructure/ErrorMapper';

export class MealLogRepositoryImpl implements IMealLogRepository {
  constructor(private localDataSource: MealLogLocalDataSource) {}

  async saveMealLog(log: MealLog): Promise<Result<void, Failure>> {
    try {
      const data = toMealLogInsertData(log);
      await this.localDataSource.insertOrUpdate(data);
      return ok(undefined);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async getMealLogsByDate(date: string): Promise<Result<MealLog[], Failure>> {
    try {
      const rows = await this.localDataSource.getByDate(date);
      return ok(rows.map(toMealLogEntity));
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async getAllMealLogs(): Promise<Result<MealLog[], Failure>> {
    try {
      const rows = await this.localDataSource.getAll();
      return ok(rows.map(toMealLogEntity));
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
      const rows = await this.localDataSource.getPendingSync();
      return ok(rows.map(toMealLogEntity));
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
