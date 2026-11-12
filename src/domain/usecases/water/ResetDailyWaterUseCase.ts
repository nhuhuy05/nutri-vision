import { IWaterRepository } from '../../repositories/IWaterRepository';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class ResetDailyWaterUseCase {
  constructor(private waterRepo: IWaterRepository) {}

  async execute(userId: string, date: string): Promise<Result<void, Failure>> {
    return this.waterRepo.resetDailyWater(userId, date);
  }
}

