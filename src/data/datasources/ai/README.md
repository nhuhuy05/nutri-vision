# 🧠 Module Trí Tuệ Nhân Tạo (AI Subsystem) — NutriVision

> Thư mục: `src/data/datasources/ai/`  
> Kiến trúc: **Hybrid Architecture (Cloud LLM + On-Device TFLite)**

---

## 1. Tổng quan Kiến trúc

NutriVision kết hợp 2 động cơ AI hoạt động thông qua bộ điều phối `RecognitionStrategy`:

```
                           [Ảnh món ăn]
                                │
                                ▼
                     RecognitionStrategy.ts
                     /                    \
              [Có Internet]          [Mất mạng / Lỗi API]
                   │                            │
                   ▼                            ▼
         GeminiVisionEngine.ts           TFLiteEngine.ts
       (Google Gemini 1.5 Flash)    (On-Device TensorFlow Lite)
```

1. **`GeminiVisionEngine.ts` (Cloud Vision)**:
   - Sử dụng mô hình đa phương thức **Gemini 3.5 Flash** qua Google AI Studio.
   - Nhận diện cực kỳ chính xác các món ăn Việt Nam, bóc tách nguyên liệu và ước lượng số gam thực tế.
   - Trả về Structured JSON.

2. **`TFLiteEngine.ts` (On-Device Local AI)**:
   - Chạy hoàn toàn trên thiết bị (Offline 100%).
   - Cung cấp Top-3 ứng viên từ ảnh chụp khi người dùng không có kết nối mạng.

---

## 2. Hướng dẫn tích hợp Model TFLite thật (Dành cho Developer tiếp theo)

Khi bạn muốn thay thế bộ khung mô phỏng của `TFLiteEngine.ts` bằng model đã huấn luyện:

### Bước 1: Huấn luyện model
- **Kiến trúc đề xuất**: `MobileNetV2` hoặc `MobileNetV3-Small`.
- **Kích thước đầu vào (Input)**: `[1, 224, 224, 3]` (RGB, giá trị pixel chuẩn hóa `[0, 1]` hoặc `[-1, 1]`).
- **Đầu ra (Output)**: Mảng xác suất Softmax `[1, num_classes]`.
- **Lưu ý**: Áp dụng Post-training Quantization (int8) để kích thước file model tối ưu dưới **5MB**.

### Bước 2: Đặt file vào dự án
- Copy file `.tflite` vào thư mục:  
  `assets/models/food_classifier.tflite`
- Đồng bộ danh mục nhãn tương ứng vào:  
  `src/data/datasources/ai/labels.vi.json`

### Bước 3: Cài đặt thư viện Native Bridge
Chạy lệnh trong terminal:
```bash
npx expo install react-native-fast-tflite
```

### Bước 4: Mở file `src/data/datasources/ai/engines/TFLiteEngine.ts`
Bỏ comment và gọi model native:
```ts
import { loadTensorflowModel } from 'react-native-fast-tflite';

// 1. Nạp model
const model = await loadTensorflowModel(require('../../../../../assets/models/food_classifier.tflite'));

// 2. Chạy inference
const output = await model.run([inputTensor]);

// 3. Lấy Top-K xác suất cao nhất map với labels.vi.json
```
*(Chi tiết đã được đánh dấu sẵn bằng các thẻ `// TODO:` bên trong code của `TFLiteEngine.ts`)*.

