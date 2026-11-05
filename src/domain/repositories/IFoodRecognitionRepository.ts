import { RecognitionResult } from '../entities/RecognitionResult';
import { Result } from '../common/Result';
import { Failure } from '../common/Failure';

export interface IFoodRecognitionRepository {
  recognizeDish(imageUri: string): Promise<Result<RecognitionResult[], Failure>>;
}
