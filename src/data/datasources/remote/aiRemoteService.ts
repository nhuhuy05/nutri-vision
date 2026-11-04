import { RecognitionResult } from '../../../domain/entities/RecognitionResult';
import { VIETNAMESE_FOODS_DATA } from '../local/vietnameseFoodsData';

export class AIRemoteService {
  private isModelLoaded = false;

  async loadModel(): Promise<boolean> {
    try {
      this.isModelLoaded = true;
      return true;
    } catch (error) {
      console.warn('AI model load fallback:', error);
      this.isModelLoaded = false;
      return false;
    }
  }

  async recognizeDish(imageUri: string): Promise<RecognitionResult[]> {
    // Simulate inference latency
    await new Promise((resolve) => setTimeout(resolve, 400));

    const candidates: { id: string; confidence: number }[] = [
      { id: 'pho-bo', confidence: 0.94 },
      { id: 'com-tam-suon-bi-cha', confidence: 0.88 },
      { id: 'bun-cha', confidence: 0.82 },
      { id: 'banh-mi-thit', confidence: 0.79 },
      { id: 'goi-cuon', confidence: 0.75 },
    ];

    const results: RecognitionResult[] = [];
    for (const cand of candidates.slice(0, 3)) {
      const food = VIETNAMESE_FOODS_DATA.find((f) => f.id === cand.id);
      if (food) {
        results.push({
          food,
          confidence: cand.confidence,
          suggestedPortion: 1.0,
        });
      }
    }

    return results;
  }
}

export const aiRemoteService = new AIRemoteService();

