import { IFoodClassifierEngine, AiPrediction } from '../contracts/IFoodClassifierEngine';
import { ImagePreprocessor } from '../ImagePreprocessor';
import labelsData from '../labels.vi.json';

/**
 * ============================================================================
 * ĐỘNG CƠ ON-DEVICE TENSORFLOW LITE (TFLiteEngine)
 * ============================================================================
 * 
 * Động cơ này đảm nhiệm phân loại món ăn ngoại tuyến (Offline) ngay trên chip
 * của thiết bị di động mà không cần kết nối mạng Internet.
 * 
 * HƯỚNG DẪN CHO LẬP TRÌNH VIÊN TIẾP THEO (DEVELOPER GUIDE):
 * ----------------------------------------------------------------------------
 * 1. Đặt file model đã huấn luyện:
 *    - Thư mục đích: `assets/models/food_classifier.tflite`
 *    - Kích thước đề xuất: 3MB - 10MB (MobileNetV2 / MobileNetV3 Quantized int8).
 * 
 * 2. Cài đặt thư viện Native Bridge (Khi chạy Development Build):
 *    - Lệnh: `npx expo install react-native-fast-tflite`
 *    - Khởi tạo model:
 *      ```ts
 *      import { loadTensorflowModel } from 'react-native-fast-tflite';
 *      const model = await loadTensorflowModel(require('@/assets/models/food_classifier.tflite'));
 *      ```
 * 
 * 3. Chạy Inference:
 *    - Chuyển đổi ảnh 224x224x3 thành TypedArray (Float32Array hoặc Uint8Array).
 *    - Gọi `const output = await model.run([inputTensor]);`
 *    - Map mảng output probabilities với `this.labels` để lấy Top-3 món cao điểm nhất.
 * ============================================================================
 */
export class TFLiteEngine implements IFoodClassifierEngine {
  readonly name = 'TensorFlow Lite (On-Device)';
  private labels: Record<string, string>;
  private isLoaded: boolean = false;
  private preprocessor: ImagePreprocessor;

  constructor(preprocessor: ImagePreprocessor = new ImagePreprocessor()) {
    this.preprocessor = preprocessor;
    this.labels = labelsData;
  }

  /**
   * Khởi tạo và nạp model TFLite vào bộ nhớ thiết bị.
   */
  async loadModel(): Promise<boolean> {
    try {
      // TODO: Khi nhúng react-native-fast-tflite:
      // this.model = await loadTensorflowModel(require('../../../../../assets/models/food_classifier.tflite'));
      this.isLoaded = true;
      return true;
    } catch (e) {
      console.warn('[TFLiteEngine] Không thể nạp model TFLite:', e);
      this.isLoaded = false;
      return false;
    }
  }

  /**
   * Phân loại hình ảnh món ăn:
   * Trả về danh sách ứng viên Top-K (xếp theo độ tin cậy giảm dần).
   */
  async classify(imageUri: string): Promise<AiPrediction[]> {
    if (!this.isLoaded) {
      await this.loadModel();
    }

    // 1. Tiền xử lý ảnh (Resize 224x224x3 chuẩn MobileNet)
    await this.preprocessor.preprocess(imageUri);

    // 2. Chạy inference
    // TODO: Khi có file .tflite, thay thế đoạn mô phỏng độ trễ dưới đây bằng:
    // const output = await this.model.run([inputTensor]);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 3. Trích xuất Top-3 ứng viên món Việt phù hợp nhất
    const topCandidates: AiPrediction[] = [
      {
        foodId: this.labels['0'] || 'pho-bo',
        foodName: 'Phở bò',
        confidence: 0.88,
        suggestedGrams: 450,
        servingUnit: 'tô',
        engineUsed: 'tflite_local',
      },
      {
        foodId: this.labels['3'] || 'com-tam-suon-bi-cha',
        foodName: 'Cơm tấm sườn bì chả',
        confidence: 0.78,
        suggestedGrams: 350,
        servingUnit: 'đĩa',
        engineUsed: 'tflite_local',
      },
      {
        foodId: this.labels['5'] || 'bun-cha',
        foodName: 'Bún chả',
        confidence: 0.65,
        suggestedGrams: 350,
        servingUnit: 'suất',
        engineUsed: 'tflite_local',
      },
    ];

    return topCandidates;
  }
}

