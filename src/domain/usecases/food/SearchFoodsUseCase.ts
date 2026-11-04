import { IFoodRepository } from '../../repositories/IFoodRepository';
import { FoodItem } from '../../entities/FoodItem';

export class SearchFoodsUseCase {
  constructor(private foodRepo: IFoodRepository) {}

  async execute(keyword: string): Promise<FoodItem[]> {
    return this.foodRepo.searchFoods(keyword);
  }
}

