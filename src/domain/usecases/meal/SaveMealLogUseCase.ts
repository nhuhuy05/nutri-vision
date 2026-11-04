import { IMealLogRepository } from '../../repositories/IMealLogRepository';
import { MealLog } from '../../entities/MealLog';

export class SaveMealLogUseCase {
  constructor(private mealLogRepo: IMealLogRepository) {}

  async execute(log: MealLog): Promise<void> {
    return this.mealLogRepo.saveMealLog(log);
  }
}

