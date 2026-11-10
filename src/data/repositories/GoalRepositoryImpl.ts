import { IGoalRepository } from '../../domain/repositories/IGoalRepository';
import { DailyGoals } from '../../domain/entities/DailyGoals';
import { Result, ok, fail } from '../../domain/common/Result';
import { Failure } from '../../domain/common/Failure';
import { DEFAULT_GOALS } from '../../domain/constants/defaultGoals';
import { GoalLocalDataSource } from '../datasources/local/GoalLocalDataSource';
import { toDailyGoalsEntity, toNutritionGoalInsertData } from '../mappers/goalMapper';
import { ErrorMapper } from '../infrastructure/ErrorMapper';

export class GoalRepositoryImpl implements IGoalRepository {
  constructor(private localDataSource: GoalLocalDataSource) {}

  async getGoals(userId: string): Promise<Result<DailyGoals, Failure>> {
    try {
      const row = await this.localDataSource.getGoals(userId);
      if (!row) {
        return ok(DEFAULT_GOALS);
      }
      return ok(toDailyGoalsEntity(row));
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async saveGoals(userId: string, goals: DailyGoals): Promise<Result<void, Failure>> {
    try {
      const insertData = toNutritionGoalInsertData(goals);
      await this.localDataSource.saveGoals(userId, insertData);
      return ok(undefined);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }
}
