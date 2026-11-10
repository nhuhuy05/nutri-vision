import { IFoodRecognitionRepository } from '../../domain/repositories/IFoodRecognitionRepository';
import { RecognitionResult } from '../../domain/entities/RecognitionResult';
import { Result, ok, fail } from '../../domain/common/Result';
import { Failure, NotFoundFailure } from '../../domain/common/Failure';
import { TFLiteClassifier } from '../datasources/ai/TFLiteClassifier';
import { FoodLocalDataSource } from '../datasources/local/FoodLocalDataSource';
import { toFoodEntity } from '../mappers/foodMapper';
import { ErrorMapper } from '../infrastructure/ErrorMapper';

export class FoodRecognitionRepositoryImpl implements IFoodRecognitionRepository {
  constructor(
    private classifier: TFLiteClassifier,
    private foodLocalDataSource: FoodLocalDataSource
  ) {}

  async recognizeDish(imageUri: string): Promise<Result<RecognitionResult[], Failure>> {
    try {
      const predictions = await this.classifier.classify(imageUri);
      const results: RecognitionResult[] = [];

      for (const pred of predictions) {
        const foodRow = await this.foodLocalDataSource.getFoodById(pred.foodId);
        if (foodRow) {
          results.push({
            food: toFoodEntity(foodRow),
            confidence: pred.confidence,
            suggestedPortion: 1.0,
          });
        }
      }

      if (results.length === 0) {
        return fail(new NotFoundFailure('Không nhận diện được món ăn nào trong ảnh'));
      }

      return ok(results);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }
}
