import { IAIRepository } from '../../repositories/IAIRepository';
import { RecognitionResult } from '../../entities/RecognitionResult';

export class RecognizeDishUseCase {
  constructor(private aiRepo: IAIRepository) {}

  async execute(imageUri: string): Promise<RecognitionResult[]> {
    return this.aiRepo.recognizeDish(imageUri);
  }
}

