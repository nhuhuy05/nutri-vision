# 📋 TIÊU CHUẨN ĐỒ ÁN CAPSTONE — NUTRIVISION

> **Học phần:** Cross-Platform Mobile App Development · HK1 (2026–2027)  
> **Stack:** React Native · Expo SDK 58 · TypeScript · Expo Router

---

## 1. Clean Architecture 3 Lớp

Kiến trúc bắt buộc chia thành **3 layer nghiêm ngặt**:

```
Presentation  →  Domain  ←  Data
```

| Layer | Chứa | Được import | KHÔNG được import |
|-------|------|------------|-------------------|
| **Domain** | Entities, Use Cases, Repository Interfaces | Không gì cả (pure TS) | Presentation, Data, React, Expo |
| **Data** | Repository Impl, Data Sources, DTOs, Mappers | Domain | Presentation |
| **Presentation** | Screens, Components, Hooks, Stores | Domain | Data trực tiếp (phải qua Use Case) |

**Quy tắc:**
- Mọi phụ thuộc hướng VÀO Domain (Dependency Inversion).
- Domain layer **tuyệt đối không import** UI, database, hay bất kỳ thư viện ngoài nào.
- Store / Hook chỉ gọi **Use Case**, không gọi thẳng database hay API.

---

## 2. Tích Hợp AI Thực Sự

Bắt buộc tích hợp **ít nhất 01** phương thức AI thật:

| Phương thức | Công nghệ chấp nhận |
|------------|---------------------|
| On-Device Inference | TensorFlow Lite · ML Kit · Core ML |
| Cloud LLM | Streaming LLM API (Gemini, OpenAI…) |

**Quy tắc:**
- AI phải **inference trên input thật** (ảnh, text), không hardcode kết quả.
- Nếu dùng on-device: model `.tflite` / `.mlmodel` phải có trong assets.
- Nếu dùng cloud API: phải có streaming response, không block UI.
- Phải xử lý fallback khi model load fail hoặc mất mạng.

---

## 3. Offline-First & Dual-Sync

| Thành phần | Yêu cầu |
|-----------|---------|
| **CSDL cục bộ** | WatermelonDB / SQLite / Isar / Drift |
| **Cloud BaaS** | Supabase / Firebase |

**Quy tắc:**
- Mọi thao tác ghi **luôn lưu local trước**, không phụ thuộc mạng.
- App phải **hoạt động đầy đủ khi offline** (đọc, ghi, xem lịch sử).
- Tự động đồng bộ lên cloud khi có kết nối mạng.
- Hiển thị trạng thái offline / pending sync cho người dùng.

---

## 4. Chuẩn Công Thái Học Di Động

| Hạng mục | Yêu cầu |
|---------|---------|
| **Design System** | Tuân thủ Google Material 3 hoặc Apple HIG |
| **Dark Mode** | Bắt buộc hỗ trợ cả Light & Dark |
| **Hiệu năng** | 60fps mượt mà, không jank |

**Quy tắc:**
- Typography, color, spacing, elevation phải theo hệ thống nhất quán.
- `useColorScheme()` để detect system theme, cung cấp dynamic colors.
- Dùng `React.memo`, `useMemo`, `useCallback` cho performance-critical components.
- FlatList phải có `keyExtractor`, `getItemLayout` khi danh sách dài.

---

## 5. Đóng Gói Phát Hành Tự Động

| Hạng mục | Yêu cầu |
|---------|---------|
| **Build** | Tự động ký số Release APK/AAB hoặc IPA |
| **Pipeline** | CI/CD qua Fastlane, EAS Build, hoặc GitHub Actions |

**Quy tắc:**
- Phải có ít nhất 2 build profile: `preview` (testing) và `production` (release).
- Production build phải tự động ký số (code signing).
- Có script hoặc pipeline chạy được: typecheck → build → (submit).
- Expo project dùng **EAS Build** (`eas.json`) thay cho Fastlane.
