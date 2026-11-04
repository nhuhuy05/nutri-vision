import { IFoodRepository } from '../../domain/repositories/IFoodRepository';
import { FoodItem } from '../../domain/entities/FoodItem';
import { queryAllFoods, querySearchFoods, queryFoodById } from '../datasources/local/database';
import { NutritionMapper } from '../mappers/NutritionMapper';

export class FoodRepositoryImpl implements IFoodRepository {
  async getAllFoods(): Promise<FoodItem[]> {
    const dtos = await queryAllFoods();
    return dtos.map(NutritionMapper.toFoodDomain);
  }

  async searchFoods(keyword: string): Promise<FoodItem[]> {
    const dtos = await querySearchFoods(keyword);
    return dtos.map(NutritionMapper.toFoodDomain);
  }

  async getFoodById(id: string): Promise<FoodItem | null> {
    const dto = await queryFoodById(id);
    return dto ? NutritionMapper.toFoodDomain(dto) : null;
  }
}

