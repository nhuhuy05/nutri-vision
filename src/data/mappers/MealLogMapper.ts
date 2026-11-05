import { MealLog } from '../../domain/entities/MealLog';
import { MealType } from '../../domain/entities/MealType';
import { MealLogDTO } from '../dto/MealLogDTO';
import { RemoteMealLogDTO } from '../dto/RemoteMealLogDTO';

export class MealLogMapper {
  static toDomain(dto: MealLogDTO): MealLog {
    return {
      id: dto.id,
      userId: dto.user_id,
      date: dto.date,
      mealType: dto.meal_type as MealType,
      foodId: dto.food_id,
      foodName: dto.food_name,
      portionMultiplier: dto.portion_multiplier,
      calories: dto.calories,
      protein: dto.protein,
      carbs: dto.carbs,
      fat: dto.fat,
      photoUri: dto.photo_uri || undefined,
      createdAt: dto.created_at,
      updatedAt: dto.updated_at || undefined,
      synced: Boolean(dto.synced),
    };
  }

  static toDTO(entity: MealLog): MealLogDTO {
    return {
      id: entity.id,
      user_id: entity.userId,
      date: entity.date,
      meal_type: entity.mealType,
      food_id: entity.foodId,
      food_name: entity.foodName,
      portion_multiplier: entity.portionMultiplier,
      calories: entity.calories,
      protein: entity.protein,
      carbs: entity.carbs,
      fat: entity.fat,
      photo_uri: entity.photoUri || null,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt || null,
      deleted_at: null,
      synced: entity.synced ? 1 : 0,
    };
  }

  static toRemoteDTO(entity: MealLog): RemoteMealLogDTO {
    return {
      id: entity.id,
      user_id: entity.userId,
      date: entity.date,
      meal_type: entity.mealType,
      food_id: entity.foodId,
      food_name: entity.foodName,
      portion_multiplier: entity.portionMultiplier,
      calories: entity.calories,
      protein: entity.protein,
      carbs: entity.carbs,
      fat: entity.fat,
      photo_uri: entity.photoUri || null,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt || null,
    };
  }
}
