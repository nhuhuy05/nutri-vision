import { IWaterRepository } from '../../domain/repositories/IWaterRepository';
import { WaterLocalDataSource } from '../datasources/local/WaterLocalDataSource';
import { Result, ok, fail } from '../../domain/common/Result';
import { Failure } from '../../domain/common/Failure';
import { ErrorMapper } from '../infrastructure/ErrorMapper';

export class WaterRepositoryImpl implements IWaterRepository {
  constructor(private localDataSource: WaterLocalDataSource) {}

  async getDailyWater(userId: string, date: string): Promise<Result<number, Failure>> {
    try {
      const total = await this.localDataSource.getDailyWater(userId, date);
      return ok(total);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async logWater(userId: string, date: string, amountMl: number): Promise<Result<number, Failure>> {
    try {
      const total = await this.localDataSource.logWater(userId, date, amountMl);
      return ok(total);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async resetDailyWater(userId: string, date: string): Promise<Result<void, Failure>> {
    try {
      await this.localDataSource.resetDailyWater(userId, date);
      return ok(undefined);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }
}

