import { IMealLogRepository } from '../../repositories/IMealLogRepository';
import { MealLog } from '../../entities/MealLog';

export class GetMealLogsByDateUseCase {
  constructor(private mealLogRepo: IMealLogRepository) {}

  async execute(date: string): Promise<MealLog[]> {
    return this.mealLogRepo.getMealLogsByDate(date);
  }
}

