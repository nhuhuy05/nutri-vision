import { FoodItem } from '../../domain/entities/FoodItem';
import { RecognitionResult } from '../../domain/entities/RecognitionResult';

export interface RawPrediction {
  foodId: string;
  confidence: number;
  suggestedPortion?: number;
}

export class RecognitionMapper {
  static toDomain(prediction: RawPrediction, food: FoodItem): RecognitionResult {
    return {
      food,
      confidence: prediction.confidence,
      suggestedPortion: prediction.suggestedPortion ?? 1.0,
    };
  }
}
