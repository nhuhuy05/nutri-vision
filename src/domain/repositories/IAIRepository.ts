import { RecognitionResult } from '../entities/RecognitionResult';

export interface IAIRepository {
  recognizeDish(imageUri: string): Promise<RecognitionResult[]>;
}

