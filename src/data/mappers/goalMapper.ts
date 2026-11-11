import { DailyGoals } from '../../domain/entities/DailyGoals';
import { NutritionGoalRow, NutritionGoalInsertData } from '../dto/local';

export function toDailyGoalsEntity(row: NutritionGoalRow): DailyGoals {
  return {
    calories: row.calories,
    protein: row.proteinG,
    carbs: row.carbsG,
    fat: row.fatG,
    waterMl: row.waterMl,
  };
}

export function toNutritionGoalInsertData(goals: DailyGoals): NutritionGoalInsertData {
  return {
    calories: goals.calories,
    protein: goals.protein,
    carbs: goals.carbs,
    fat: goals.fat,
    waterMl: goals.waterMl,
  };
}

