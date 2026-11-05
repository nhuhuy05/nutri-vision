import { IGoalRepository } from '../../repositories/IGoalRepository';
import { DailyGoals } from '../../entities/DailyGoals';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class GetDailyGoalsUseCase {
  constructor(private goalRepo: IGoalRepository) {}

  async execute(userId: string): Promise<Result<DailyGoals, Failure>> {
    return this.goalRepo.getGoals(userId);
  }
}
