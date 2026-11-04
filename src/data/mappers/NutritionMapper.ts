import { FoodItem, MealType } from '../../domain/entities/FoodItem';
import { MealLog } from '../../domain/entities/MealLog';
import { FoodDTO } from '../models/FoodDTO';
import { MealLogDTO } from '../models/MealLogDTO';

export class NutritionMapper {
  static toFoodDomain(dto: FoodDTO): FoodItem {
    return {
      id: dto.id,
      name: dto.name,
      nameEn: dto.name_en || undefined,
      category: dto.category,
      calories: dto.calories,
      protein: dto.protein,
      carbs: dto.carbs,
      fat: dto.fat,
      servingUnit: dto.serving_unit,
      servingWeightGrams: dto.serving_weight_grams,
    };
  }

  static toFoodDTO(entity: FoodItem): FoodDTO {
    return {
      id: entity.id,
      name: entity.name,
      name_en: entity.nameEn || null,
      category: entity.category,
      calories: entity.calories,
      protein: entity.protein,
      carbs: entity.carbs,
      fat: entity.fat,
      serving_unit: entity.servingUnit,
      serving_weight_grams: entity.servingWeightGrams,
    };
  }

  static toMealLogDomain(dto: MealLogDTO): MealLog {
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
      synced: Boolean(dto.synced),
    };
  }

  static toMealLogDTO(entity: MealLog): MealLogDTO {
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
      synced: entity.synced ? 1 : 0,
    };
  }
}

