import { Result } from '../common/Result';
import { Failure } from '../common/Failure';

export interface IWaterRepository {
  getDailyWater(userId: string, date: string): Promise<Result<number, Failure>>;
  logWater(userId: string, date: string, amountMl: number): Promise<Result<number, Failure>>;
  resetDailyWater(userId: string, date: string): Promise<Result<void, Failure>>;
}

