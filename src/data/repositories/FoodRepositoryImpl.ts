import { IFoodRepository } from '../../domain/repositories/IFoodRepository';
import { FoodItem } from '../../domain/entities/FoodItem';
import { Result, ok, fail } from '../../domain/common/Result';
import { Failure } from '../../domain/common/Failure';
import { FoodLocalDataSource } from '../datasources/local/FoodLocalDataSource';
import { toFoodEntity } from '../mappers/foodMapper';
import { ErrorMapper } from '../infrastructure/ErrorMapper';

export class FoodRepositoryImpl implements IFoodRepository {
  constructor(private localDataSource: FoodLocalDataSource) {}

  async getAllFoods(): Promise<Result<FoodItem[], Failure>> {
    try {
      const rows = await this.localDataSource.getAllFoods();
      return ok(rows.map(toFoodEntity));
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async searchFoods(query: string): Promise<Result<FoodItem[], Failure>> {
    try {
      const rows = await this.localDataSource.searchFoods(query);
      return ok(rows.map(toFoodEntity));
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async getFoodById(id: string): Promise<Result<FoodItem | null, Failure>> {
    try {
      const row = await this.localDataSource.getFoodById(id);
      return ok(row ? toFoodEntity(row) : null);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async createCustomFood(food: Omit<FoodItem, 'id'>, userId?: string): Promise<Result<FoodItem, Failure>> {
    try {
      const row = await this.localDataSource.createCustomFood(food, userId);
      return ok(toFoodEntity(row));
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }
}
