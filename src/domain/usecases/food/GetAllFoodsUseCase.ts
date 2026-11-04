import { IFoodRepository } from '../../repositories/IFoodRepository';
import { FoodItem } from '../../entities/FoodItem';

export class GetAllFoodsUseCase {
  constructor(private foodRepo: IFoodRepository) {}

  async execute(): Promise<FoodItem[]> {
    return this.foodRepo.getAllFoods();
  }
}

