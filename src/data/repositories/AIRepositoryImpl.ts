import { IAIRepository } from '../../domain/repositories/IAIRepository';
import { RecognitionResult } from '../../domain/entities/RecognitionResult';
import { aiRemoteService } from '../datasources/remote/aiRemoteService';

export class AIRepositoryImpl implements IAIRepository {
  async recognizeDish(imageUri: string): Promise<RecognitionResult[]> {
    return aiRemoteService.recognizeDish(imageUri);
  }
}

