import { IMealLogRepository } from '../../repositories/IMealLogRepository';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class DeleteMealLogUseCase {
  constructor(private mealLogRepo: IMealLogRepository) {}

  async execute(id: string): Promise<Result<void, Failure>> {
    return this.mealLogRepo.deleteMealLog(id);
  }
}
