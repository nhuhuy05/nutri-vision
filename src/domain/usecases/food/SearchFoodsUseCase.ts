import { IFoodRepository } from '../../repositories/IFoodRepository';
import { FoodItem } from '../../entities/FoodItem';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class SearchFoodsUseCase {
  constructor(private foodRepo: IFoodRepository) {}

  async execute(keyword: string): Promise<Result<FoodItem[], Failure>> {
    if (!keyword || keyword.trim().length === 0) {
      return this.foodRepo.getAllFoods();
    }
    return this.foodRepo.searchFoods(keyword.trim());
  }
}
