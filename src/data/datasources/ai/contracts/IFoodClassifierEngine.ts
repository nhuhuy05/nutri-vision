export interface AiPrediction {
  /**
   * ID món ăn tương ứng trong cơ sở dữ liệu SQLite cục bộ (bảng foods)
   * Ví dụ: 'pho-bo', 'bun-cha', 'com-tam-suon-bi-cha', 'banh-mi-thit'
   */
  foodId: string;

  /** Tên tiếng Việt hiển thị của món ăn */
  foodName: string;

  /** Độ tin cậy nhận diện (giá trị từ 0.0 đến 1.0) */
  confidence: number;

  /** Khối lượng khẩu phần ước tính theo gam (ví dụ: 450) */
  suggestedGrams?: number;

  /** Đơn vị khẩu phần (ví dụ: 'tô', 'đĩa', 'bát', 'ổ', 'hộp') */
  servingUnit?: string;

  /** Các nguyên liệu chính phát hiện được trong món ăn */
  ingredients?: string[];

  /**
   * Dinh dưỡng ước tính (sử dụng khi món ăn chưa có trong CSDL cục bộ)
   */
  estimatedNutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };

  /** Động cơ AI đã thực hiện phân tích */
  engineUsed: 'gemini_cloud' | 'tflite_local';
}

/**
 * Hợp đồng giao diện chung cho mọi Động cơ AI phân loại món ăn (Cloud LLM hoặc On-device TFLite)
 */
export interface IFoodClassifierEngine {
  readonly name: string;
  classify(imageUri: string): Promise<AiPrediction[]>;
}

