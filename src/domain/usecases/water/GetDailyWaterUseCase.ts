import { IWaterRepository } from '../../repositories/IWaterRepository';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class GetDailyWaterUseCase {
  constructor(private waterRepo: IWaterRepository) {}

  async execute(userId: string, date: string): Promise<Result<number, Failure>> {
    return this.waterRepo.getDailyWater(userId, date);
  }
}

