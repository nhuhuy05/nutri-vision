import { IFoodRecognitionRepository } from '../../repositories/IFoodRecognitionRepository';
import { RecognitionResult } from '../../entities/RecognitionResult';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class RecognizeDishUseCase {
  constructor(private recognitionRepo: IFoodRecognitionRepository) {}

  async execute(imageUri: string): Promise<Result<RecognitionResult[], Failure>> {
    return this.recognitionRepo.recognizeDish(imageUri);
  }
}
