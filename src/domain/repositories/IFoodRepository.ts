import { FoodItem } from '../entities/FoodItem';
import { Result } from '../common/Result';
import { Failure } from '../common/Failure';

export interface IFoodRepository {
  getAllFoods(): Promise<Result<FoodItem[], Failure>>;
  searchFoods(keyword: string): Promise<Result<FoodItem[], Failure>>;
  getFoodById(id: string): Promise<Result<FoodItem | null, Failure>>;
  createCustomFood(food: Omit<FoodItem, 'id'>, userId?: string): Promise<Result<FoodItem, Failure>>;
}
