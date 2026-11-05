import { IMealLogRepository } from '../../repositories/IMealLogRepository';
import { MealLog } from '../../entities/MealLog';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class SaveMealLogUseCase {
  constructor(private mealLogRepo: IMealLogRepository) {}

  async execute(log: MealLog): Promise<Result<void, Failure>> {
    return this.mealLogRepo.saveMealLog(log);
  }
}
