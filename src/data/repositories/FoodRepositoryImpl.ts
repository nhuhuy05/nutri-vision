import { IFoodRepository } from '../../domain/repositories/IFoodRepository';
import { FoodItem } from '../../domain/entities/FoodItem';
import { Result, ok, fail } from '../../domain/common/Result';
import { Failure } from '../../domain/common/Failure';
import { FoodLocalDataSource } from '../datasources/local/FoodLocalDataSource';
import { FoodMapper } from '../mappers/FoodMapper';
import { ErrorMapper } from '../infrastructure/ErrorMapper';

export class FoodRepositoryImpl implements IFoodRepository {
  constructor(private localDataSource: FoodLocalDataSource) {}

  async getAllFoods(): Promise<Result<FoodItem[], Failure>> {
    try {
      const dtos = await this.localDataSource.getAllFoods();
      const foods = dtos.map(FoodMapper.toDomain);
      return ok(foods);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async searchFoods(query: string): Promise<Result<FoodItem[], Failure>> {
    try {
      const dtos = await this.localDataSource.searchFoods(query);
      const foods = dtos.map(FoodMapper.toDomain);
      return ok(foods);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async getFoodById(id: string): Promise<Result<FoodItem | null, Failure>> {
    try {
      const dto = await this.localDataSource.getFoodById(id);
      return ok(dto ? FoodMapper.toDomain(dto) : null);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }
}
