import { FoodItem } from '../entities/FoodItem';
import { MealLog } from '../entities/MealLog';

export interface CalculatedNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export class NutritionCalculator {
  static calculateFromFood(food: FoodItem, multiplier: number): CalculatedNutrition {
    return {
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10,
    };
  }

  static sumMealLogs(logs: MealLog[]): CalculatedNutrition {
    return logs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fat: acc.fat + log.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }
}
