# NutriVision Project Rules

## 1. Không tự ý Commit (No Auto-Commit)
- **TUYỆT ĐỐI KHÔNG** tự động chạy `git commit` hoặc `git push` sau khi sửa code hay hoàn tất tác vụ.
- Chỉ thực hiện commit khi người dùng yêu cầu rõ ràng (ví dụ: *"commit đi"*, *"hãy commit"*).
- Sau khi hoàn tất sửa code, chỉ chạy `git status` và báo cáo danh sách file đã thay đổi để người dùng tự review.

## 2. Tiêu chuẩn kiểm tra bắt buộc (Verification)
- Trước khi báo cáo hoàn tất tác vụ, bắt buộc phải vượt qua:
  ```bash
  npx tsc --noEmit   # Đảm bảo 0 lỗi TypeScript
  npx expo lint      # Đảm bảo 0 lỗi ESLint
  ```

## 3. Cấu trúc & Điều hướng
- **Expo Router**: Các route/màn hình đặt trong `app/`.
- **Clean Architecture**: Toàn bộ UI components, screens, stores, usecases, repositories đặt trong `src/` (tách biệt hoàn toàn khỏi routing).
- **Cài đặt thư viện**: Luôn sử dụng `npx expo install <package>` để đảm bảo tương thích với phiên bản Expo SDK của dự án.
