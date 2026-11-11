import { IFoodClassifierEngine, AiPrediction } from '../contracts/IFoodClassifierEngine';
import { ImagePreprocessor } from '../ImagePreprocessor';

interface GeminiFoodResponse {
  foodId: string;
  foodName: string;
  confidence: number;
  suggestedGrams?: number;
  servingUnit?: string;
  ingredients?: string[];
  estimatedNutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  topCandidates?: {
    foodId: string;
    foodName: string;
    confidence: number;
    suggestedGrams?: number;
    servingUnit?: string;
  }[];
}

export class GeminiVisionEngine implements IFoodClassifierEngine {
  readonly name = 'Gemini 2.5 Flash Vision (Cloud)';
  private preprocessor: ImagePreprocessor;

  constructor(preprocessor: ImagePreprocessor = new ImagePreprocessor()) {
    this.preprocessor = preprocessor;
  }

  async classify(imageUri: string): Promise<AiPrediction[]> {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your-gemini-api-key')) {
      throw new Error(
        'Gemini API Key chưa được thiết lập trong .env (EXPO_PUBLIC_GEMINI_API_KEY). Chuyển sang động cơ dự phòng.'
      );
    }

    const base64Image = await this.preprocessor.toBase64(imageUri);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;

    const promptText = `
Bạn là chuyên gia dinh dưỡng và chuyên gia thị giác máy tính hàng đầu về ẩm thực Việt Nam.
Hãy phân tích bức ảnh món ăn này và nhận diện chính xác món ăn Việt Nam.

Yêu cầu xuất ra JSON duy nhất theo schema:
{
  "foodId": "slug-tieng-viet-khong-dau-ngan-gon (ví dụ: pho-bo, com-tam-suon-bi-cha, bun-cha, banh-mi-thit, goi-cuon, bun-bo-hue, hu-tieu, banh-xeo, che-dau-den)",
  "foodName": "Tên món ăn tiếng Việt chính xác (ví dụ: Phở bò, Cơm tấm sườn nướng)",
  "confidence": 0.95,
  "suggestedGrams": 450,
  "servingUnit": "tô",
  "ingredients": ["Bánh phở", "Thịt bò tái", "Hành hoa", "Nước hầm xương"],
  "estimatedNutrition": {
    "calories": 480,
    "protein": 28,
    "carbs": 65,
    "fat": 12
  },
  "topCandidates": [
    {
      "foodId": "bun-bo-hue",
      "foodName": "Bún bò Huế",
      "confidence": 0.72,
      "suggestedGrams": 450,
      "servingUnit": "tô"
    }
  ]
}
`.trim();

    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.1,
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Không nhận được phản hồi phân tích hình ảnh từ Gemini.');
    }

    let cleanJson = candidateText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed: GeminiFoodResponse = JSON.parse(cleanJson);
    const predictions: AiPrediction[] = [];

    // 1. Ứng viên chính (Primary Candidate)
    predictions.push({
      foodId: parsed.foodId,
      foodName: parsed.foodName,
      confidence: Math.min(Math.max(parsed.confidence, 0.5), 0.99),
      suggestedGrams: parsed.suggestedGrams ?? 100,
      servingUnit: parsed.servingUnit ?? 'khẩu phần',
      ingredients: parsed.ingredients ?? [],
      estimatedNutrition: parsed.estimatedNutrition,
      engineUsed: 'gemini_cloud',
    });

    // 2. Các ứng viên đề xuất phụ (Top Candidates)
    if (Array.isArray(parsed.topCandidates)) {
      for (const alt of parsed.topCandidates) {
        if (alt.foodId !== parsed.foodId) {
          predictions.push({
            foodId: alt.foodId,
            foodName: alt.foodName,
            confidence: Math.min(Math.max(alt.confidence, 0.1), 0.95),
            suggestedGrams: alt.suggestedGrams ?? parsed.suggestedGrams ?? 100,
            servingUnit: alt.servingUnit ?? parsed.servingUnit ?? 'khẩu phần',
            engineUsed: 'gemini_cloud',
          });
        }
      }
    }

    return predictions;
  }
}

