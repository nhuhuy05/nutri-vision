import { IFoodRecognitionRepository } from '../../domain/repositories/IFoodRecognitionRepository';
import { RecognitionResult } from '../../domain/entities/RecognitionResult';
import { FoodItem } from '../../domain/entities/FoodItem';
import { Result, ok, fail } from '../../domain/common/Result';
import { Failure, NotFoundFailure } from '../../domain/common/Failure';
import { RecognitionStrategy } from '../datasources/ai/RecognitionStrategy';
import { FoodLocalDataSource } from '../datasources/local/FoodLocalDataSource';
import { toFoodEntity } from '../mappers/foodMapper';
import { ErrorMapper } from '../infrastructure/ErrorMapper';

export class FoodRecognitionRepositoryImpl implements IFoodRecognitionRepository {
  constructor(
    private strategy: RecognitionStrategy,
    private foodLocalDataSource: FoodLocalDataSource
  ) {}

  async recognizeDish(imageUri: string): Promise<Result<RecognitionResult[], Failure>> {
    try {
      const predictions = await this.strategy.recognize(imageUri);
      const results: RecognitionResult[] = [];

      for (const pred of predictions) {
        // 1. Cố gắng tra cứu món ăn trong CSDL SQLite cục bộ (chuẩn Viện Dinh Dưỡng)
        const foodRow = await this.foodLocalDataSource.getFoodById(pred.foodId);

        let foodEntity: FoodItem;
        if (foodRow) {
          foodEntity = toFoodEntity(foodRow);
        } else {
          // 2. Món ăn chưa có trong CSDL hạt giống (Seed) -> dùng ước tính dinh dưỡng từ AI
          const est = pred.estimatedNutrition ?? {
            calories: 350,
            protein: 15,
            carbs: 45,
            fat: 10,
          };

          foodEntity = {
            id: pred.foodId,
            name: pred.foodName,
            category: 'main_dish',
            calories: est.calories,
            protein: est.protein,
            carbs: est.carbs,
            fat: est.fat,
            servingUnit: pred.servingUnit || 'khẩu phần',
            servingWeightGrams: pred.suggestedGrams || 100,
          };
        }

        const standardWeight = foodEntity.servingWeightGrams || 100;
        const suggestedGrams = pred.suggestedGrams || standardWeight;
        const portionMultiplier = Number((suggestedGrams / standardWeight).toFixed(2));

        results.push({
          food: foodEntity,
          confidence: pred.confidence,
          suggestedPortion: portionMultiplier > 0 ? portionMultiplier : 1.0,
        });
      }

      if (results.length === 0) {
        return fail(new NotFoundFailure('Không nhận diện được món ăn nào trong ảnh.'));
      }

      return ok(results);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }
}
