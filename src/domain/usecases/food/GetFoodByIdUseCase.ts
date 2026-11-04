import { IFoodRepository } from '../../repositories/IFoodRepository';
import { FoodItem } from '../../entities/FoodItem';

export class GetFoodByIdUseCase {
  constructor(private foodRepo: IFoodRepository) {}

  async execute(id: string): Promise<FoodItem | null> {
    return this.foodRepo.getFoodById(id);
  }
}

