import { IMealLogRepository } from '../../repositories/IMealLogRepository';

export class DeleteMealLogUseCase {
  constructor(private mealLogRepo: IMealLogRepository) {}

  async execute(id: string): Promise<void> {
    return this.mealLogRepo.deleteMealLog(id);
  }
}

