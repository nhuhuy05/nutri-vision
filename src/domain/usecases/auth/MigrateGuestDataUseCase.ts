import { IMealLogRepository } from '../../repositories/IMealLogRepository';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class MigrateGuestDataUseCase {
  constructor(private mealLogRepo: IMealLogRepository) {}

  async execute(targetUserId: string): Promise<Result<number, Failure>> {
    return this.mealLogRepo.migrateGuestLogs(targetUserId);
  }
}

