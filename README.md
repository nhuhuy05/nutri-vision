# NutriVision: AI-Powered Food Recognition & Personal Nutrition Tracker
**Ứng dụng Nhận diện Món ăn bằng AI và Theo dõi Dinh dưỡng Cá nhân**

> Học phần: Cross-Platform Mobile App Development  
> Học kỳ 1 (2026–2027)

---

## 📱 Giới thiệu dự án

**NutriVision** là ứng dụng di động đa nền tảng (Android & iOS) hỗ trợ người dùng theo dõi chế độ dinh dưỡng hàng ngày một cách thông minh, chính xác và nhanh chóng:
- 📸 **Nhận diện món ăn bằng AI:** Chụp ảnh bữa ăn, AI (TensorFlow Lite) nhận diện và đề xuất món ăn phù hợp trong danh mục món ăn Việt Nam.
- 🥗 **Điều chỉnh khẩu phần linh hoạt:** Tự động tính toán Calo, Protein, Carbohydrate và Chất béo theo khối lượng thực tế.
- 📖 **Nhật ký bữa ăn (Food Diary):** Phân loại theo Bữa sáng, Bữa trưa, Bữa tối, Bữa phụ; tổng hợp dinh dưỡng tức thì.
- ⚡ **Offline-First & Dual-Sync:** Lưu trữ ngoại tuyến an toàn với SQLite (`expo-sqlite`), tự động đồng bộ hóa lên đám mây (Supabase PostgreSQL) ngay khi có kết nối mạng.
- 📊 **Báo cáo & Mục tiêu cá nhân:** Đặt mục tiêu calo & macro đa lượng, theo dõi tiến độ theo ngày và tuần trực quan.

---

## 🛠️ Công nghệ cốt lõi (Tech Stack)

| Thành phần | Công nghệ / Thư viện | Vai trò |
|---|---|---|
| **Framework** | **React Native (Expo SDK 58)** | Nền tảng di động đa nền tảng tối ưu hiệu năng |
| **Architecture** | **Clean Architecture (3 Layers + DI)** | Kiến trúc sạch phân tách Domain, Data, Presentation, Composition Root |
| **Routing** | **Expo Router v58** | File-based routing với root `app/` mỏng chỉ re-export |
| **Local Database** | **Expo SQLite (`expo-sqlite`)** | Lưu trữ danh mục món ăn & nhật ký ngoại tuyến với chế độ WAL |
| **State Management**| **Zustand** | Quản lý UI state, phiên đăng nhập (auth) và hàng đợi đồng bộ |
| **Data Fetching** | **TanStack Query** | Quản lý cache và truy vấn máy chủ / repository |
| **Cloud Backend** | **Supabase** | Xác thực người dùng (Auth) & cơ sở dữ liệu PostgreSQL |
| **Secure Storage** | **Expo SecureStore** | Lưu trữ session token Supabase đã mã hóa |
| **AI Engine** | **TensorFlow Lite Interface** | Module phân tích hình ảnh và nhận diện món ăn on-device |
| **Media / Camera** | **Expo Image Picker** | Chụp ảnh camera & chọn ảnh từ thư viện |

---

## 📂 Cấu trúc dự án (Clean Architecture — Cách A)

```
NutriVision/
├── app/                                       # 📱 Expo Router Shell (CHỈ re-export)
│   ├── _layout.tsx                            # Root Providers (QueryClient, DB, StatusBar)
│   ├── (tabs)/
│   │   ├── _layout.tsx                        # Bottom Tabs Navigator 5 màn hình
│   │   ├── index.tsx                          # -> DashboardScreen
│   │   ├── diary.tsx                          # -> DiaryScreen
│   │   ├── scan.tsx                           # -> ScanScreen
│   │   ├── reports.tsx                        # -> ReportsScreen
│   │   └── profile.tsx                        # -> ProfileScreen
│   ├── (auth)/
│   │   └── sign-in.tsx                        # -> SignInScreen
│   └── modal/
│       ├── food-review.tsx                    # -> FoodReviewScreen
│       └── manual-entry.tsx                   # -> ManualEntryScreen
│
├── docs/
│   ├── architecture.md                        # Đặc tả kiến trúc Clean Architecture
│   ├── overview.md                            # Tổng quan và mục tiêu dự án
│   └── standard.md                            # 5 tiêu chuẩn Capstone VKU
│
└── src/
    ├── domain/                                # 🟢 ZERO DEPENDENCY (Pure TypeScript)
    │   ├── common/ (Result.ts, Failure.ts)
    │   ├── constants/ (defaultGoals.ts)
    │   ├── entities/ (FoodItem, MealLog, DailyGoals, DailySummary, Session, ...)
    │   ├── repositories/ (IFoodRepository, IMealLogRepository, IGoalRepository, ...)
    │   ├── services/ (NutritionCalculator.ts, ReportAggregator.ts)
    │   └── usecases/ (food, meal, summary, report, recognition, goals, auth, sync)
    │
    ├── data/                                  # 🔵 DATA IMPLEMENTATION
    │   ├── datasources/
    │   │   ├── local/ (db/connection, db/migrations, *LocalDataSource, seed/)
    │   │   ├── remote/ (supabaseClient, *RemoteDataSource)
    │   │   └── ai/ (TFLiteClassifier, ImagePreprocessor, labels.vi.json)
    │   ├── dto/ (FoodDTO, MealLogDTO, GoalDTO, RemoteMealLogDTO)
    │   ├── mappers/ (FoodMapper, MealLogMapper, GoalMapper, RecognitionMapper)
    │   ├── infrastructure/ (NetworkInfo, SecureSessionStorage, ErrorMapper)
    │   └── repositories/ (*RepositoryImpl trả về Result<T, Failure>)
    │
    ├── presentation/                          # 🟠 UI & STATE MANAGEMENT
    │   ├── screens/ (DashboardScreen, DiaryScreen, ScanScreen, ...)
    │   ├── components/ (MacroBar, MealSection, OfflineBanner)
    │   ├── hooks/ (useDiary, useDailySummary, useWeeklyReport, useSync, useRecognize)
    │   ├── store/ (uiStore, authStore, syncStore, goalStore)
    │   ├── theme/ (colors, spacing, typography)
    │   └── query/ (queryClient, queryKeys)
    │
    └── di/                                    # 🧩 COMPOSITION ROOT
        └── container.ts                       # Nằm ngoài 3 lớp, ráp nối DataSource -> Repo -> UseCase
```

---

## 🚀 Hướng dẫn khởi chạy

### 1. Cài đặt các gói phụ thuộc:
```bash
npm install
```

### 2. Khởi chạy máy chủ phát triển (Expo Dev Server):
```bash
npx expo start
```
- Nhấn `a` để mở trên Android Emulator / Thiết bị Android kết nối ADB.
- Nhấn `i` để mở trên iOS Simulator (yêu cầu macOS).
- Hoặc quét mã QR bằng ứng dụng **Expo Go** trên điện thoại.

### 3. Kiểm tra chất lượng mã nguồn:
```bash
npx tsc --noEmit        # Kiểm tra kiểu dữ liệu TypeScript (0 errors)
npm run lint            # Kiểm tra quy chuẩn mã nguồn ESLint (0 errors, 0 warnings)
npx expo-doctor         # Chẩn đoán tương thích hệ sinh thái Expo (20/20 checks passed)
```
