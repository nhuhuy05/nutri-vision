import { IFoodRepository } from '../../repositories/IFoodRepository';
import { FoodItem } from '../../entities/FoodItem';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class GetAllFoodsUseCase {
  constructor(private foodRepo: IFoodRepository) {}

  async execute(): Promise<Result<FoodItem[], Failure>> {
    return this.foodRepo.getAllFoods();
  }
}
