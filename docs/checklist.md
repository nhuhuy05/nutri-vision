# 📱 DANH SÁCH TÍNH NĂNG ỨNG DỤNG (FEATURE CHECKLIST) — NUTRIVISION

> **Ứng dụng:** NutriVision (Nutrilens AI) — Trợ lý Dinh dưỡng Thông minh & Nhận diện Món ăn  
> **Cập nhật ngày:** 12/11/2026  
> **Tài liệu tham chiếu:** [docs/overview.md](file:///D:/Code/nutri-vision/docs/overview.md)  

---

## 📊 TỔNG QUAN TIẾN ĐỘ THEO TÍNH NĂNG (FEATURES)

| Phân hệ tính năng | Tổng số chức năng | Đã xong [x] | Đang làm [/] | Chưa có [ ] | Tiến độ |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Xác thực & Tài khoản cá nhân** | 8 | 8 | 0 | 0 | **100%** |
| **2. Khảo sát ban đầu & Tính toán TDEE (Onboarding)** | 5 | 4 | 1 | 0 | **85%** |
| **3. Nhận diện Món ăn bằng AI qua Camera** | 6 | 4 | 2 | 0 | **75%** |
| **4. Đánh giá & Điều chỉnh Dinh dưỡng (Food Review)** | 5 | 5 | 0 | 0 | **100%** |
| **5. Nhật ký Ăn uống (Food Diary)** | 7 | 7 | 0 | 0 | **100%** |
| **6. Tra cứu & Nhập món Thủ công (Manual Entry)** | 5 | 3 | 1 | 1 | **60%** |
| **7. Trang chủ Bảng điều khiển (Home Dashboard)** | 6 | 5 | 1 | 0 | **85%** |
| **8. Báo cáo & Thống kê Dinh dưỡng (Reports)** | 6 | 6 | 0 | 0 | **100%** |
| **9. Đồng bộ Đám mây & Ngoại tuyến (Dual-Sync)** | 6 | 4 | 0 | 2 | **65%** |
| **10. Theo dõi Nước uống & Cân nặng (Bổ trợ)** | 4 | 1 | 0 | 3 | **25%** |
| **11. Cài đặt, Theme & Trải nghiệm (Settings & UX)** | 5 | 4 | 1 | 0 | **80%** |
| **12. Đóng gói Phát hành Tự động (Release & CI/CD)** | 4 | 4 | 0 | 0 | **100%** |

---

## 1. 👤 PHÂN HỆ XÁC THỰC & TÀI KHOẢN (AUTHENTICATION & PROFILE)

Mục tiêu: Đảm bảo người dùng có thể sử dụng app ngay lập tức (chế độ Khách) và đăng nhập/đăng ký tài khoản để sao lưu dữ liệu cá nhân.

- [x] **1.1. Chế độ Khách (Guest Mode / Offline-First):**
  - Mở ứng dụng là dùng được ngay, không ép buộc người dùng phải đăng ký/đăng nhập.
  - Toàn bộ bữa ăn, mục tiêu calo được lưu trữ cục bộ an toàn trong SQLite dưới mã `guest_user_id`.
  - File liên quan: [authStore.ts](file:///D:/Code/nutri-vision/src/presentation/store/authStore.ts), [defaultGoals.ts](file:///D:/Code/nutri-vision/src/domain/constants/defaultGoals.ts).
- [x] **1.2. Đăng ký tài khoản mới (Sign Up):**
  - Đăng ký bằng Email + Mật khẩu + Tên hiển thị qua Supabase Auth.
  - Tự động tạo bản ghi trong bảng `user_profiles` trên đám mây.
  - File liên quan: [SignUpUseCase.ts](file:///D:/Code/nutri-vision/src/domain/usecases/auth/SignUpUseCase.ts), [SignInScreen.tsx](file:///D:/Code/nutri-vision/src/presentation/screens/SignInScreen.tsx).
- [x] **1.3. Đăng nhập tài khoản (Sign In):**
  - Xác thực Email/Password, lưu Access Token và Session vào Secure Store.
  - File liên quan: [SignInUseCase.ts](file:///D:/Code/nutri-vision/src/domain/usecases/auth/SignInUseCase.ts).
- [x] **1.4. Ghi nhớ phiên đăng nhập (Remember Me / Auto Session):**
  - Checkbox "Ghi nhớ đăng nhập", tự động khôi phục phiên làm việc khi mở lại app không cần đăng nhập lại.
  - File liên quan: [SecureSessionStorage.ts](file:///D:/Code/nutri-vision/src/data/infrastructure/SecureSessionStorage.ts), [app/_layout.tsx](file:///D:/Code/nutri-vision/app/_layout.tsx).
- [x] **1.5. Quên mật khẩu (Reset Password):**
  - Gửi email hướng dẫn khôi phục mật khẩu từ Supabase.
  - File liên quan: [ResetPasswordUseCase.ts](file:///D:/Code/nutri-vision/src/domain/usecases/auth/ResetPasswordUseCase.ts).
- [x] **1.6. Chuyển đổi dữ liệu Khách sang Tài khoản thật (Guest Data Migration):**
  - Khi người dùng đang dùng chế độ Khách rồi bấm Đăng nhập/Đăng ký: toàn bộ món ăn đã lưu trước đó sẽ tự động đổi `userId` sang mã tài khoản thật và đẩy ngay lên Supabase.
  - File liên quan: [MigrateGuestDataUseCase.ts](file:///D:/Code/nutri-vision/src/domain/usecases/auth/MigrateGuestDataUseCase.ts), [authStore.ts](file:///D:/Code/nutri-vision/src/presentation/store/authStore.ts).
- [x] **1.7. Xem & Chỉnh sửa hồ sơ cá nhân:**
  - Hiển thị Avatar tròn (viết tắt tên), Email, Tên hiển thị.
  - Hỗ trợ đổi tên hiển thị trực tiếp ngay trên trang cá nhân kèm nút lưu/hủy.
  - File liên quan: [ProfileScreen.tsx](file:///D:/Code/nutri-vision/src/presentation/screens/ProfileScreen.tsx).
- [x] **1.8. Đăng xuất an toàn (Sign Out):**
  - Hộp thoại xác nhận trước khi đăng xuất, xóa session cục bộ và đưa về trạng thái khách/đăng nhập.
  - File liên quan: [SignOutUseCase.ts](file:///D:/Code/nutri-vision/src/domain/usecases/auth/SignOutUseCase.ts).

---

## 2. 🎯 PHÂN HỆ KHẢO SÁT BAN ĐẦU & TÍNH TOÁN TDEE (ONBOARDING)

Mục tiêu: Thu thập thông tin thể trạng và áp dụng công thức y khoa để cá nhân hóa chỉ số calo & chất dinh dưỡng cho từng người.

- [x] **2.1. Màn hình giới thiệu khởi động (Intro Carousel):**
  - Trình chiếu các điểm nổi bật của app: Quét món ăn bằng AI, Quản lý Calo, Theo dõi sức khỏe.
  - File liên quan: [OnboardingIntroScreen.tsx](file:///D:/Code/nutri-vision/src/presentation/screens/OnboardingIntroScreen.tsx).
- [x] **2.2. Khảo sát chỉ số sinh học (Bước 1):**
  - Thu thập: Giới tính, Tuổi, Chiều cao (hỗ trợ cm/ft), Cân nặng hiện tại (kg/lbs).
  - Tự động tính chỉ số BMI và phân loại thể trạng (Gầy, Bình thường, Tiền thừa cân, Béo phì).
- [x] **2.3. Khảo sát cường độ vận động (Bước 2):**
  - 4 mức độ: Ít vận động (Sedentary), Vận động nhẹ (Light), Vừa phải (Moderate), Cường độ cao (Very Active).
- [x] **2.4. Thiết lập mục tiêu & Sở thích ăn uống (Bước 3):**
  - Mục tiêu: Giảm mỡ (Fat loss), Giữ cân (Maintenance), Tăng cơ (Muscle gain).
  - Cân nặng mục tiêu và chế độ ăn kiêng / dị ứng thực phẩm.
- [/] **2.5. Tính toán tự động theo công thức khoa học Mifflin-St Jeor & Lưu mục tiêu (Bước 4):**
  - [x] Tính tự động BMR, TDEE, Calorie mục tiêu hàng ngày và phân bổ Macronutrients (Protein, Carbs, Fat).
  - [/] Đảm bảo cập nhật đồng bộ các chỉ số tính toán này vào cả `user_profiles` và `nutrition_goals` trong SQLite.
  - File liên quan: [OnboardingScreen.tsx](file:///D:/Code/nutri-vision/src/presentation/screens/OnboardingScreen.tsx).

---

## 3. 📸 PHÂN HỆ QUÉT ẢNH & NHẬN DIỆN MÓN ĂN BẰNG AI (AI FOOD SCANNER)

Mục tiêu: Tự động hóa quá trình ghi nhận món ăn bằng thị giác máy tính thay vì phải gõ tay.

- [x] **3.1. Chụp ảnh từ Camera & Chọn ảnh từ Thư viện:**
  - Xin quyền Camera / Thư viện ảnh, hỗ trợ chụp trực tiếp hoặc tải ảnh có sẵn từ máy.
  - File liên quan: [ScanScreen.tsx](file:///D:/Code/nutri-vision/src/presentation/screens/ScanScreen.tsx).
- [x] **3.2. Tiền xử lý & Nén ảnh (Image Preprocessing):**
  - Nén ảnh, định cỡ chuẩn hóa và mã hóa Base64 trước khi gửi đi phân tích.
  - File liên quan: [ImagePreprocessor.ts](file:///D:/Code/nutri-vision/src/data/datasources/ai/ImagePreprocessor.ts).
- [x] **3.3. Nhận diện Món ăn Việt Nam bằng Cloud AI (Gemini 2.5 Flash Vision):**
  - Gửi ảnh qua API nhận diện cấu trúc JSON nghiêm ngặt: tên món tiếng Việt, slug món, nguyên liệu, calo và dinh dưỡng ước tính.
  - File liên quan: [GeminiVisionEngine.ts](file:///D:/Code/nutri-vision/src/data/datasources/ai/engines/GeminiVisionEngine.ts).
- [x] **3.4. Cơ chế chuyển mạch thông minh (Hybrid AI Fallback Strategy):**
  - Tự động kiểm tra mạng: có Internet gọi Cloud AI; mất mạng hoặc lỗi API tự động chuyển mạch sang mô hình On-Device mà không gây crash app.
  - File liên quan: [RecognitionStrategy.ts](file:///D:/Code/nutri-vision/src/data/datasources/ai/RecognitionStrategy.ts).
- [x] **3.5. Danh sách ứng viên đề xuất thay thế (Top Candidates Selection):**
  - Hiển thị danh sách các món ăn dự phòng (nếu AI phân vân hoặc đĩa có nhiều món) để người dùng chạm vào chọn lại món chính xác nhất.
  - File liên quan: [ScanScreen.tsx](file:///D:/Code/nutri-vision/src/presentation/screens/ScanScreen.tsx).
- [/] **3.6. Động cơ ngoại tuyến On-Device TFLite:**
  - [x] Cấu trúc khung (scaffold), mapping nhãn tiếng Việt [labels.vi.json](file:///D:/Code/nutri-vision/src/data/datasources/ai/labels.vi.json).
  - [ ] Nạp file model nhúng thực tế `.tflite` trong `assets/models/` khi chạy Development Build native.
  - File liên quan: [TFLiteEngine.ts](file:///D:/Code/nutri-vision/src/data/datasources/ai/engines/TFLiteEngine.ts).

---

## 4. ⚖️ PHÂN HỆ ĐÁNH GIÁ & ĐIỀU CHỈNH DINH DƯỠNG (FOOD REVIEW & PORTION)

Mục tiêu: Cho phép người dùng kiểm tra lại thông tin AI nhận diện, chỉnh khẩu phần trước khi ghi vào nhật ký.

- [x] **4.1. Hiển thị thông tin món ăn & ảnh chụp:**
  - Hiển thị ảnh chụp thực tế của món, tên món ăn tiếng Việt rõ ràng.
  - File liên quan: [FoodReviewScreen.tsx](file:///D:/Code/nutri-vision/src/presentation/screens/FoodReviewScreen.tsx).
- [x] **4.2. Thanh trượt điều chỉnh khẩu phần (Portion Slider):**
  - Cho phép kéo thanh trượt từ 0.25x đến 3.0x hoặc nhập số gram thực tế tiêu thụ.
  - File liên quan: [PortionSlider.tsx](file:///D:/Code/nutri-vision/src/presentation/components/PortionSlider.tsx).
- [x] **4.3. Tính toán lại dinh dưỡng theo thời gian thực (Real-time Macro Calculation):**
  - Các chỉ số: Calo, Protein, Carbs, Fat tự động nhảy số theo tỷ lệ khẩu phần người dùng điều chỉnh.
- [x] **4.4. Phân loại bữa ăn:**
  - Cho phép gán món vào 1 trong 4 bữa: Bữa sáng, Bữa trưa, Bữa tối, Bữa phụ.
- [x] **4.5. Lưu vào nhật ký & Điều hướng mượt mà:**
  - Lưu vào SQLite, hiển thị thông báo Toast thành công và tự động đóng modal chuyển về màn hình Nhật ký.

---

## 5. 📖 PHÂN HỆ NHẬT KÝ ĂN UỐNG (FOOD DIARY)

Mục tiêu: Không gian quản lý toàn bộ các món đã ăn trong ngày, cho phép theo dõi, sửa và xóa.

- [x] **5.1. Chọn và chuyển đổi ngày linh hoạt:**
  - Nút chuyển ngày hôm trước / hôm sau, chọn ngày bất kỳ trong lịch hoặc quay về ngày hôm nay.
  - File liên quan: [DiaryScreen.tsx](file:///D:/Code/nutri-vision/src/presentation/screens/DiaryScreen.tsx).
- [x] **5.2. Gom nhóm theo từng bữa ăn (Meal Sections):**
  - Tách biệt rõ ràng 4 mục: Bữa sáng, Bữa trưa, Bữa tối, Bữa phụ kèm tổng calo của từng bữa.
  - File liên quan: [MealSection.tsx](file:///D:/Code/nutri-vision/src/presentation/components/MealSection.tsx).
- [x] **5.3. Thẻ tóm tắt năng lượng ngày (Daily Nutrition Summary):**
  - Tổng calo nạp vào so với mục tiêu và chi tiết 3 chất đa lượng (P - C - F).
  - File liên quan: [DailyNutritionSummary.tsx](file:///D:/Code/nutri-vision/src/presentation/components/DailyNutritionSummary.tsx).
- [x] **5.4. Thêm món ăn nhanh tại từng bữa:**
  - Bấm nút "+" ở từng nhóm bữa ăn để mở modal thêm món ăn nhanh.
  - File liên quan: [FoodForm.tsx](file:///D:/Code/nutri-vision/src/presentation/components/FoodForm.tsx).
- [x] **5.5. Chỉnh sửa món ăn đã ghi:**
  - Chạm vào món ăn để chỉnh sửa tên món, số lượng, calo hoặc chuyển sang bữa khác.
- [x] **5.6. Xóa món ăn khỏi nhật ký:**
  - Xóa món ăn kèm hộp thoại xác nhận an toàn, tự động trừ calo tức thì.
- [x] **5.7. Kéo để tải lại (Pull-to-refresh):**
  - Vuốt màn hình từ trên xuống để làm mới dữ liệu từ SQLite.

---

## 6. 🔍 PHÂN HỆ TRA CỨU & NHẬP MÓN THỦ CÔNG (MANUAL ENTRY)

Mục tiêu: Giúp người dùng ghi lại món ăn khi không có ảnh chụp hoặc muốn tự tìm trong thư viện món ăn.

- [x] **6.1. Kho dữ liệu món ăn mẫu (Vietnamese Foods Library):**
  - Tích hợp sẵn 14 món ăn Việt Nam phổ biến kèm đầy đủ bảng thành phần dinh dưỡng chuẩn 100g.
  - File liên quan: [seed.ts](file:///D:/Code/nutri-vision/src/data/datasources/local/db/seed.ts).
- [x] **6.2. Thanh tìm kiếm món ăn tức thì (Live Search):**
  - Lọc món ăn theo từ khóa nhập vào ô tìm kiếm.
  - File liên quan: [ManualEntryScreen.tsx](file:///D:/Code/nutri-vision/src/presentation/screens/ManualEntryScreen.tsx).
- [/] **6.3. Tìm kiếm tiếng Việt không dấu (Accent-insensitive Search):**
  - [x] CSDL SQLite đã có cột `name_normalized` (ví dụ: "pho bo tai nam").
  - [/] Áp dụng hàm `normalizeVietnameseText()` khi tìm kiếm để người dùng gõ "pho bo" hay "phở bò" đều ra kết quả.
- [x] **6.4. Chọn món để chuyển sang màn hình Review:**
  - Bấm vào món trong danh sách kết quả để chuyển sang màn hình Review chỉnh khẩu phần.
- [ ] **6.5. Tạo món ăn hoàn toàn mới (Custom Food Creator):**
  - Màn hình cho phép người dùng tự tạo món riêng của mình (nhập tên món, calo, protein, carbs, fat theo ý muốn) và lưu vào CSDL để tái sử dụng sau này.

---

## 7. 🏠 PHÂN HỆ TRANG CHỦ BẢNG ĐIỀU KHIỂN (HOME DASHBOARD)

Mục tiêu: Giúp người dùng nắm bắt nhanh tình trạng dinh dưỡng trong ngày ngay khi mở app.

- [x] **7.1. Lời chào cá nhân hóa:**
  - Chào theo tên người dùng, thay đổi linh hoạt theo thời gian trong ngày.
  - File liên quan: [DashboardScreen.tsx](file:///D:/Code/nutri-vision/src/presentation/screens/DashboardScreen.tsx).
- [x] **7.2. Vòng tròn tiến độ Calo trực quan (Calorie Ring Widget):**
  - Vòng tiến độ SVG hiển thị số Calo còn lại được phép ăn, Calo đã nạp và Mục tiêu hàng ngày.
  - File liên quan: [CalorieRing.tsx](file:///D:/Code/nutri-vision/src/presentation/components/CalorieRing.tsx).
- [x] **7.3. Thanh tiến độ 3 chất đa lượng (Macronutrient Bars):**
  - 3 thanh tiến độ màu sắc trực quan: Protein (Xanh dương), Carbs (Cam), Chất béo (Đỏ) kèm gam đã nạp / mục tiêu.
  - File liên quan: [MacroBar.tsx](file:///D:/Code/nutri-vision/src/presentation/components/MacroBar.tsx).
- [x] **7.4. Thanh cảnh báo trạng thái mạng (Offline Banner):**
  - Tự động hiện banner khi mất kết nối Internet để người dùng yên tâm dữ liệu vẫn đang được lưu an toàn trên máy.
  - File liên quan: [OfflineBanner.tsx](file:///D:/Code/nutri-vision/src/presentation/components/OfflineBanner.tsx).
- [x] **7.5. Nút thao tác nhanh (Quick Action Buttons):**
  - Nút bấm trực tiếp mở Camera quét món hoặc Tra cứu nhanh món ăn.
- [/] **7.6. Widget Lượng nước uống trong ngày (Water Quick Tracker):**
  - Hiển thị lượng nước đã uống hôm nay và nút bấm nhanh (+250ml, +500ml) trực tiếp tại trang chủ.

---

## 8. 📊 PHÂN HỆ BÁO CÁO & THỐNG KÊ (REPORTS & ANALYTICS)

Mục tiêu: Đưa ra cái nhìn tổng quan và phân tích chuyên sâu về thói quen ăn uống theo thời gian.

- [x] **8.1. Chuyển đổi chu kỳ xem báo cáo (Tuần / Tháng):**
  - Hỗ trợ xem thống kê 7 ngày gần nhất hoặc cả tháng kèm nút chuyển tuần trước/sau.
  - File liên quan: [ReportsScreen.tsx](file:///D:/Code/nutri-vision/src/presentation/screens/ReportsScreen.tsx).
- [x] **8.2. Biểu đồ cột Calo tiêu thụ so với mục tiêu (Calories Bar Chart):**
  - Cột calo từng ngày, vạch kẻ mục tiêu calo, tô màu nổi bật khi vượt quá hoặc đạt chuẩn mục tiêu.
  - File liên quan: [NutritionCharts.tsx](file:///D:/Code/nutri-vision/src/presentation/components/NutritionCharts.tsx).
- [x] **8.3. Biểu đồ Donut tỷ lệ phân bổ năng lượng Macro (Macro Distribution):**
  - Biểu đồ tròn hiển thị tỷ lệ % calo đến từ Protein, Carbs và Fat trong cả giai đoạn.
- [x] **8.4. Thẻ tóm tắt chỉ số quan trọng (Key Metric Cards):**
  - Tổng calo tiêu thụ, Calo trung bình mỗi ngày, Tỷ lệ hoàn thành so với mục tiêu.
- [x] **8.5. Nhận diện ngày ăn uống cao nhất / thấp nhất:**
  - Tự động chỉ ra ngày nào ăn nhiều calo nhất và ngày nào ăn ít calo nhất trong tuần để người dùng điều chỉnh.
- [x] **8.6. Đồng bộ chỉ số theo ngày được chọn:**
  - Bấm vào một ngày cụ thể trên biểu đồ để xem chi tiết dinh dưỡng riêng của ngày đó.

---

## 9. ☁️ PHÂN HỆ ĐỒNG BỘ ĐÁM MÂY (DUAL-SYNC & OFFLINE-FIRST)

Mục tiêu: Dữ liệu luôn an toàn, không bao giờ mất khi mất mạng hoặc đổi điện thoại.

- [x] **9.1. Lưu trữ cục bộ SQLite ưu tiên (Local-First):**
  - Mọi thao tác thêm/sửa/xóa đều ghi thành công vào SQLite ngay lập tức không cần chờ mạng.
- [x] **9.2. Đồng bộ đẩy (Push Sync) lên Supabase:**
  - Tự động gửi các bản ghi mới/chưa sync lên Supabase khi có mạng.
  - Trigger `handle_meal_logs_upsert()` trên Supabase tự động bóc tách bản ghi vào `meals` và `meal_items`.
  - File liên quan: [MealLogRemoteDataSource.ts](file:///D:/Code/nutri-vision/src/data/datasources/remote/MealLogRemoteDataSource.ts), [SyncPendingMealLogsUseCase.ts](file:///D:/Code/nutri-vision/src/domain/usecases/sync/SyncPendingMealLogsUseCase.ts).
- [x] **9.3. Nút kích hoạt đồng bộ chủ động ("Đồng bộ ngay"):**
  - Tích hợp tại trang Cá nhân, hiển thị trạng thái "Đang đồng bộ..." và báo kết quả tức thì.
- [x] **9.4. Tự động đồng bộ khi mở lại ứng dụng (Foreground Sync):**
  - Lắng nghe sự kiện `AppState` khi người dùng quay lại app sẽ tự động kiểm tra mạng và sync ngầm.
  - File liên quan: [useSync.ts](file:///D:/Code/nutri-vision/src/presentation/hooks/useSync.ts).
- [ ] **9.5. Đồng bộ kéo 2 chiều (Pull Sync từ Supabase về SQLite):**
  - Khi người dùng đăng nhập tài khoản trên thiết bị mới, tự động kéo lịch sử bữa ăn từ Supabase về SQLite trên máy.
- [ ] **9.6. Đồng bộ thao tác xóa (Soft Delete Sync):**
  - Khi xóa bữa ăn trên máy, đánh dấu `deleted_at` và đồng bộ xóa tương ứng trên Supabase.

---

## 10. 💧 PHÂN HỆ BỔ TRỢ SỨC KHỎE (WATER & WEIGHT TRACKER)

Mục tiêu: Mở rộng tính năng theo dõi toàn diện ngoài chế độ ăn uống.

- [x] **10.1. Cấu trúc CSDL sẵn sàng (Database Schema):**
  - Bảng `water_logs` và `weight_logs` đã có sẵn cả trong SQLite cục bộ lẫn trên Supabase.
- [ ] **10.2. Tính năng Theo dõi Lượng nước uống (Water Tracker UI):**
  - Mục tiêu nước hàng ngày (mặc định 2.000ml).
  - Nút bấm ghi nhanh (+250ml nước lọc, +500ml).
  - Thanh tiến độ nước uống trên Dashboard.
- [ ] **10.3. Tính năng Nhật ký Cân nặng (Weight Tracker UI):**
  - Ghi nhận cân nặng theo từng tuần/tháng.
  - So sánh với cân nặng khởi điểm và cân nặng mục tiêu đã cài đặt ở Onboarding.
- [ ] **10.4. Biểu đồ tiến độ giảm/tăng cân:**
  - Biểu đồ đường (Line Chart) thể hiện sự thay đổi cân nặng theo thời gian trên tab Báo cáo.

---

## 11. ⚙️ PHÂN HỆ CÀI ĐẶT & TRẢI NGHIỆM NGƯỜI DÙNG (SETTINGS & UX)

Mục tiêu: Đem lại trải nghiệm mượt mà, trực quan, thẩm mỹ theo tiêu chuẩn di động hiện đại.

- [x] **11.1. Chế độ Giao diện Sáng / Tối (Light & Dark Theme Engine):**
  - Hook `useAppTheme()` tự động nhận diện chế độ giao diện của hệ điều hành.
  - Đã hỗ trợ hoàn chỉnh trên Dashboard, Diary, Reports, Profile.
  - File liên quan: [theme/colors.ts](file:///D:/Code/nutri-vision/src/presentation/theme/colors.ts).
- [/] **11.2. Chuẩn hóa màu sắc toàn bộ các màn hình còn lại:**
  - [/] Chuyển đổi `ScanScreen.tsx` và `ManualEntryScreen.tsx` từ mã màu tĩnh sang `useAppTheme()`.
- [x] **11.3. Cài đặt Mục tiêu Calo nhanh:**
  - Bấm vào mục tiêu calo ở trang Profile để mở modal chỉnh sửa calo mục tiêu mà không cần làm lại Onboarding.
- [x] **11.4. Hệ thống thông báo thân thiện (Custom Toast & Custom Alert):**
  - Toast thông báo không gây che khuất màn hình; Alert xác nhận với thiết kế bo góc hiện đại.
  - File liên quan: [CustomToast.tsx](file:///D:/Code/nutri-vision/src/presentation/components/CustomToast.tsx), [CustomAlertModal.tsx](file:///D:/Code/nutri-vision/src/presentation/components/CustomAlertModal.tsx).
- [x] **11.5. Tối ưu bàn phím & Vùng an toàn (Keyboard & Safe Area):**
  - Sử dụng `KeyboardAvoidingView` và `useSafeAreaInsets` chống tràn tai thỏ / thanh điều hướng trên cả iOS và Android.

---

## 12. 📦 PHÂN HỆ ĐÓNG GÓI PHÁT HÀNH TỰ ĐỘNG (RELEASE & CI/CD PIPELINE)

Mục tiêu: Tự động hóa kiểm tra chất lượng code và đóng gói ứng dụng độc lập (APK / AAB) theo Tiêu chuẩn Capstone.

- [x] **12.1. Cấu hình định danh & quyền hạn ứng dụng ([app.json](file:///D:/Code/nutri-vision/app.json)):**
  - Khai báo Package name Android: `com.nutrivision.app` và iOS Bundle Identifier: `com.nutrivision.app`.
  - Khai báo đầy đủ quyền hạn Camera, Thư viện ảnh, và plugin `expo-image-picker`.
- [x] **12.2. Hồ sơ Build EAS đa môi trường ([eas.json](file:///D:/Code/nutri-vision/eas.json)):**
  - Profile `preview`: Đóng gói file APK độc lập (`buildType: "apk"`) để cài trực tiếp lên điện thoại Android kiểm thử / nộp bài.
  - Profile `production`: Tự động ký số Release Android App Bundle (`.aab`) với cơ chế `autoIncrement`.
  - Profile `development`: Hỗ trợ build Development Client native.
- [x] **12.3. Scripts kiểm tra tự động trước khi build ([package.json](file:///D:/Code/nutri-vision/package.json)):**
  - `npm run check`: Chạy tuần tự `typecheck` $\rightarrow$ `lint`.
  - `npm run build:preview`: Kiểm tra code sạch 100% rồi tự động gọi EAS Build đóng gói APK.
  - `npm run build:production`: Kiểm tra code rồi tự động gọi EAS Build đóng gói bản Production.
- [x] **12.4. CI/CD Pipeline tự động ([.github/workflows/ci.yml](file:///D:/Code/nutri-vision/.github/workflows/ci.yml)):**
  - Tự động kích hoạt khi push code hoặc mở Pull Request vào branch `main` và `develop` để kiểm tra TypeScript và Linting trên máy chủ GitHub.

---

## 🎯 BẢNG TẬP TRUNG: CÁC CHỨC NĂNG CẦN LÀM TIẾP (REMAINING FEATURES ROADMAP)

Dưới đây là các tính năng cụ thể cần bổ sung hoặc hoàn thiện theo thứ tự ưu tiên sản phẩm:

| STT | Tính năng cụ thể | Vị trí / Màn hình | Mức độ ưu tiên | Độ phức tạp |
| :---: | :--- | :--- | :---: | :---: |
| **1** | **Tìm kiếm tiếng Việt không dấu** (Gõ "pho bo" ra "Phở bò") | [ManualEntryScreen.tsx](file:///D:/Code/nutri-vision/src/presentation/screens/ManualEntryScreen.tsx) | 🔴 Cao | Thấp |
| **2** | **Dark Mode toàn diện** cho màn Quét ảnh và Tra cứu món | [ScanScreen.tsx](file:///D:/Code/nutri-vision/src/presentation/screens/ScanScreen.tsx), [ManualEntryScreen.tsx](file:///D:/Code/nutri-vision/src/presentation/screens/ManualEntryScreen.tsx) | 🔴 Cao | Thấp |
| **3** | **Đồng bộ kéo 2 chiều (Pull Sync)** (Tải dữ liệu từ Supabase về máy khi đăng nhập máy mới) | `SyncRepositoryImpl.ts`, [useSync.ts](file:///D:/Code/nutri-vision/src/presentation/hooks/useSync.ts) | 🟡 Trung bình | Trung bình |
| **4** | **Thêm món ăn tùy chỉnh thủ công** (Tự tạo món mới ngoài danh mục 14 món có sẵn) | `ManualEntryScreen.tsx` / Modal tạo món | 🟡 Trung bình | Trung bình |
| **5** | **Widget Theo dõi Lượng nước uống** (Quick Water Log +250ml) | [DashboardScreen.tsx](file:///D:/Code/nutri-vision/src/presentation/screens/DashboardScreen.tsx) | 🟢 Tiện ích | Thấp |
| **6** | **Theo dõi Cân nặng & Biểu đồ tiến độ** (Weight Tracker) | [ReportsScreen.tsx](file:///D:/Code/nutri-vision/src/presentation/screens/ReportsScreen.tsx) | 🟢 Tiện ích | Trung bình |
| **7** | **Nhúng Model On-Device `.tflite` thật** | [TFLiteEngine.ts](file:///D:/Code/nutri-vision/src/data/datasources/ai/engines/TFLiteEngine.ts) | 🔵 Mở rộng (Cần native build) | Cao |
