import { IFoodRepository } from '../../repositories/IFoodRepository';
import { FoodItem } from '../../entities/FoodItem';
import { Result, fail } from '../../common/Result';
import { Failure, ValidationFailure } from '../../common/Failure';

export class CreateCustomFoodUseCase {
  constructor(private foodRepo: IFoodRepository) {}

  async execute(
    food: Omit<FoodItem, 'id'>,
    userId?: string
  ): Promise<Result<FoodItem, Failure>> {
    if (!food.name || !food.name.trim()) {
      return fail(new ValidationFailure('Tên món ăn không được để trống'));
    }

    if (typeof food.calories !== 'number' || isNaN(food.calories) || food.calories < 0) {
      return fail(new ValidationFailure('Lượng calo không hợp lệ'));
    }

    return this.foodRepo.createCustomFood(food, userId);
  }
}

