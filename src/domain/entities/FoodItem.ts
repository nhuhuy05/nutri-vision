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
