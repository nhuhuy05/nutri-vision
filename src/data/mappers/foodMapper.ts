import { FoodItem } from '../../domain/entities/FoodItem';
import { FoodRow } from '../dto/local';

export function toFoodEntity(row: FoodRow): FoodItem {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.nameEn || undefined,
    category: row.category,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    servingUnit: row.servingUnit,
    servingWeightGrams: row.servingWeightGrams,
  };
}

