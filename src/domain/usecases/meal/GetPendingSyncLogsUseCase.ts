import { IMealLogRepository } from '../../repositories/IMealLogRepository';
import { MealLog } from '../../entities/MealLog';

export class GetPendingSyncLogsUseCase {
  constructor(private mealLogRepo: IMealLogRepository) {}

  async execute(): Promise<MealLog[]> {
    return this.mealLogRepo.getPendingSyncLogs();
  }
}

