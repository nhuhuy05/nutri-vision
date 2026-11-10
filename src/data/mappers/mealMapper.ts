import { MealLog } from '../../domain/entities/MealLog';
import { MealType } from '../../domain/entities/MealType';
import { MealLogRow, MealLogInsertData } from '../dto/local';
import { RemoteMealLogDTO } from '../dto/remote';

export function toMealLogEntity(row: MealLogRow): MealLog {
  return {
    id: row.id,
    userId: row.userId,
    date: row.date,
    mealType: row.mealType as MealType,
    foodId: row.foodId,
    foodName: row.foodName,
    portionMultiplier: row.portionMultiplier,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    photoUri: row.photoUri || undefined,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : undefined,
    synced: Boolean(row.synced),
  };
}

export function toMealLogInsertData(log: MealLog): MealLogInsertData {
  return {
    id: log.id,
    userId: log.userId,
    date: log.date,
    mealType: log.mealType,
    foodId: log.foodId,
    foodName: log.foodName,
    portionMultiplier: log.portionMultiplier,
    calories: log.calories,
    protein: log.protein,
    carbs: log.carbs,
    fat: log.fat,
    photoUri: log.photoUri ?? null,
    synced: log.synced,
  };
}

export function toRemoteMealLogDTO(entity: MealLog): RemoteMealLogDTO {
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
    photo_uri: entity.photoUri ?? null,
    created_at: entity.createdAt,
    updated_at: entity.updatedAt ?? null,
  };
}

export function fromRemoteToMealLogEntity(remote: RemoteMealLogDTO): MealLog {
  return {
    id: remote.id,
    userId: remote.user_id,
    date: remote.date,
    mealType: remote.meal_type as MealType,
    foodId: remote.food_id,
    foodName: remote.food_name,
    portionMultiplier: remote.portion_multiplier,
    calories: remote.calories,
    protein: remote.protein,
    carbs: remote.carbs,
    fat: remote.fat,
    photoUri: remote.photo_uri || undefined,
    createdAt: remote.created_at,
    updatedAt: remote.updated_at || undefined,
    synced: true,
  };
}

