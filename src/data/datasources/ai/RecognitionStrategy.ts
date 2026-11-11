import { AiPrediction } from './contracts/IFoodClassifierEngine';
import { GeminiVisionEngine } from './engines/GeminiVisionEngine';
import { TFLiteEngine } from './engines/TFLiteEngine';
import { NetworkInfo } from '../../infrastructure/NetworkInfo';

/**
 * Bộ điều phối Hybrid Strategy cho nhận diện món ăn:
 * - Khi CÓ MẠNG: Ưu tiên gọi Gemini 1.5 Flash Vision (Cloud) để nhận diện sâu & bóc tách nguyên liệu.
 * - Khi MẤT MẠNG hoặc API gặp sự cố: Tự động chuyển mạch sang TFLite Engine (On-Device).
 */
export class RecognitionStrategy {
  constructor(
    private geminiEngine: GeminiVisionEngine = new GeminiVisionEngine(),
    private tfliteEngine: TFLiteEngine = new TFLiteEngine(),
    private networkInfo: NetworkInfo = new NetworkInfo()
  ) {}

  async recognize(imageUri: string): Promise<AiPrediction[]> {
    const isOnline = await this.networkInfo.isConnected();

    if (isOnline) {
      try {
        return await this.geminiEngine.classify(imageUri);
      } catch (err) {
        console.warn(
          '[RecognitionStrategy] Cloud AI (Gemini) không khả dụng, tự động chuyển sang On-Device TFLite:',
          err
        );
        return await this.tfliteEngine.classify(imageUri);
      }
    }

    console.log('[RecognitionStrategy] Thiết bị đang Offline. Sử dụng On-Device TFLite Engine.');
    return await this.tfliteEngine.classify(imageUri);
  }
}
