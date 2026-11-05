import { FoodItem } from './FoodItem';

export interface RecognitionResult {
  food: FoodItem;
  confidence: number;
  suggestedPortion: number;
}

