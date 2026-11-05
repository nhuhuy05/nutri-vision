import { IGoalRepository } from '../../repositories/IGoalRepository';
import { DailyGoals } from '../../entities/DailyGoals';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class UpdateDailyGoalsUseCase {
  constructor(private goalRepo: IGoalRepository) {}

  async execute(userId: string, goals: DailyGoals): Promise<Result<void, Failure>> {
    return this.goalRepo.saveGoals(userId, goals);
  }
}
