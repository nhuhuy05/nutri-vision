export interface RemoteMealLogDTO {
  id: string;
  user_id: string;
  date: string;
  meal_type: string;
  food_id: string;
  food_name: string;
  portion_multiplier: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  photo_uri?: string | null;
  created_at: string;
  updated_at?: string | null;
}

