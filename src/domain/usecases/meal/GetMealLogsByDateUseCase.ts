import { IMealLogRepository } from '../../repositories/IMealLogRepository';
import { MealLog } from '../../entities/MealLog';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class GetMealLogsByDateUseCase {
  constructor(private mealLogRepo: IMealLogRepository) {}

  async execute(date: string): Promise<Result<MealLog[], Failure>> {
    return this.mealLogRepo.getMealLogsByDate(date);
  }
}
