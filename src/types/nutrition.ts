export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  calories: number;       // kcal per standard serving
  protein: number;        // grams
  carbs: number;          // grams
  fat: number;            // grams
  servingUnit: string;    // e.g., 'bát', 'đĩa', 'ổ', 'hộp', 'khẩu phần'
  servingWeightGrams: number;
  imageUrl?: string;
}

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
  synced: boolean;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
}

export interface DailySummary {
  date: string;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  goal: DailyGoals;
  logs: MealLog[];
}

export interface RecognitionResult {
  food: FoodItem;
  confidence: number;
  suggestedPortion: number;
}

