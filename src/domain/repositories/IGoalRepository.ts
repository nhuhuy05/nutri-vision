import { DailyGoals } from '../entities/DailyGoals';
import { Result } from '../common/Result';
import { Failure } from '../common/Failure';

export interface IGoalRepository {
  getGoals(userId: string): Promise<Result<DailyGoals, Failure>>;
  saveGoals(userId: string, goals: DailyGoals): Promise<Result<void, Failure>>;
}
