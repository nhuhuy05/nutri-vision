import { IFoodRepository } from '../../repositories/IFoodRepository';
import { FoodItem } from '../../entities/FoodItem';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class GetFoodByIdUseCase {
  constructor(private foodRepo: IFoodRepository) {}

  async execute(id: string): Promise<Result<FoodItem | null, Failure>> {
    return this.foodRepo.getFoodById(id);
  }
}
