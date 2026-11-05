export interface FoodDTO {
  id: string;
  name: string;
  name_en: string | null;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_unit: string;
  serving_weight_grams: number;
}
