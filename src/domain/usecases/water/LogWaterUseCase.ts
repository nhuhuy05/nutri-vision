import { IWaterRepository } from '../../repositories/IWaterRepository';
import { Result, fail } from '../../common/Result';
import { Failure, ValidationFailure } from '../../common/Failure';

export class LogWaterUseCase {
  constructor(private waterRepo: IWaterRepository) {}

  async execute(userId: string, date: string, amountMl: number): Promise<Result<number, Failure>> {
    if (typeof amountMl !== 'number' || isNaN(amountMl) || amountMl <= 0) {
      return fail(new ValidationFailure('Lượng nước uống phải lớn hơn 0'));
    }
    return this.waterRepo.logWater(userId, date, amountMl);
  }
}

