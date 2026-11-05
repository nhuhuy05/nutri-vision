import { IGoalRepository } from '../../domain/repositories/IGoalRepository';
import { DailyGoals } from '../../domain/entities/DailyGoals';
import { Result, ok, fail } from '../../domain/common/Result';
import { Failure } from '../../domain/common/Failure';
import { DEFAULT_GOALS } from '../../domain/constants/defaultGoals';
import { GoalLocalDataSource } from '../datasources/local/GoalLocalDataSource';
import { GoalMapper } from '../mappers/GoalMapper';
import { ErrorMapper } from '../infrastructure/ErrorMapper';

export class GoalRepositoryImpl implements IGoalRepository {
  constructor(private localDataSource: GoalLocalDataSource) {}

  async getGoals(userId: string): Promise<Result<DailyGoals, Failure>> {
    try {
      const dto = await this.localDataSource.getGoals(userId);
      if (!dto) {
        return ok(DEFAULT_GOALS);
      }
      return ok(GoalMapper.toDomain(dto));
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async saveGoals(userId: string, goals: DailyGoals): Promise<Result<void, Failure>> {
    try {
      const dto = GoalMapper.toDTO(goals, userId);
      await this.localDataSource.saveGoals(dto);
      return ok(undefined);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }
}
