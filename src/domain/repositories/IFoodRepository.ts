import { FoodItem } from '../entities/FoodItem';

export interface IFoodRepository {
  getAllFoods(): Promise<FoodItem[]>;
  searchFoods(keyword: string): Promise<FoodItem[]>;
  getFoodById(id: string): Promise<FoodItem | null>;
}

