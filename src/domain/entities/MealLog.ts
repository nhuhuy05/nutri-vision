import { MealType } from './MealType';

export interface MealLog {
  id: string;             // UUID
  userId: string;
  date: string;           // ISO YYYY-MM-DD
  mealType: MealType;
  foodId: string;
  foodName: string;
  portionMultiplier: number; // 1.0 = standard serving, 0.5 = half, 2.0 = double
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  photoUri?: string;
  createdAt: string;
  updatedAt?: string;
  synced: boolean;
}
