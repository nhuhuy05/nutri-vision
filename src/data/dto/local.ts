import { schema } from '../datasources/local/db/connection';

// Raw table types inferred directly from Drizzle schema
export type FoodTableSelect = typeof schema.foods.$inferSelect;
export type FoodServingTableSelect = typeof schema.foodServings.$inferSelect;
export type NutritionGoalRow = typeof schema.nutritionGoals.$inferSelect;
export type MealTableSelect = typeof schema.meals.$inferSelect;
export type MealItemTableSelect = typeof schema.mealItems.$inferSelect;
export type SyncMetaRow = typeof schema.syncMeta.$inferSelect;

// Query output types (joins / projections) used by Local DataSources
export interface FoodRow {
  id: string;
  name: string;
  nameEn: string | null;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingUnit: string;
  servingWeightGrams: number;
}

export interface MealLogRow {
  id: string;
  userId: string;
  date: string;
  mealType: string;
  foodId: string;
  foodName: string;
  portionMultiplier: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  photoUri: string | null;
  createdAt: number;
  updatedAt: number | null;
  synced: number;
}

export interface NutritionGoalInsertData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
}

export interface MealLogInsertData {
  id: string;
  userId: string;
  date: string;
  mealType: string;
  foodId: string;
  foodName: string;
  portionMultiplier: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  photoUri?: string | null;
  synced?: boolean;
}

