# Tổng quan và mục tiêu dự án NutriVision

## 1. Tổng quan dự án

**NutriVision (Nutrilens AI)** là ứng dụng di động hỗ trợ nhận diện món ăn bằng trí tuệ nhân tạo và ước tính giá trị dinh dưỡng. Ứng dụng giúp người dùng ghi lại bữa ăn, theo dõi lượng calo và các chất dinh dưỡng đa lượng như protein, carbohydrate và chất béo, từ đó điều chỉnh chế độ ăn theo mục tiêu cá nhân.

Người dùng có thể sử dụng camera điện thoại để nhận diện món ăn, kiểm tra kết quả và điều chỉnh khẩu phần trước khi lưu vào nhật ký. Dữ liệu được tổng hợp thành thống kê để theo dõi tình hình ăn uống theo thời gian, giảm sự phụ thuộc vào việc ghi chép và tính toán thủ công.

## 2. Vấn đề cần giải quyết

Việc theo dõi dinh dưỡng hằng ngày thường gặp một số khó khăn:

- **Nhập liệu mất thời gian:** Người dùng phải tìm kiếm tên món ăn và nhập khẩu phần cho từng bữa, khiến việc ghi chép trở nên lặp lại và khó duy trì.
- **Khó ước lượng dinh dưỡng:** Người dùng thường không biết chính xác khối lượng thực phẩm hoặc lượng calo và chất dinh dưỡng trong món ăn, đặc biệt khi ăn ngoài.
- **Thông tin thiếu tập trung:** Nếu không có nhật ký và thống kê, người dùng khó nắm được tổng lượng dinh dưỡng đã tiêu thụ.
- **Khó điều chỉnh thói quen:** Các con số riêng lẻ chưa giúp người dùng dễ dàng nhận biết chế độ ăn hiện tại và những điểm cần cải thiện.

NutriVision hướng đến việc đơn giản hóa quá trình ghi nhận bữa ăn và cung cấp thông tin dễ theo dõi để hỗ trợ người dùng chủ động quản lý chế độ ăn.

## 3. Đối tượng sử dụng

- Người quan tâm đến sức khỏe và muốn xây dựng thói quen ăn uống lành mạnh.
- Người đang theo dõi cân nặng và cần kiểm soát lượng calo tiêu thụ.
- Người tập gym hoặc chơi thể thao có nhu cầu theo dõi dinh dưỡng.
- Người bận rộn, thường xuyên ăn ngoài và muốn ghi lại bữa ăn nhanh chóng.

Ứng dụng được sử dụng chủ yếu trong các bữa ăn hằng ngày, tại nhà hoặc nhà hàng.

## 4. Mục tiêu dự án

### 4.1. Mục tiêu tổng quát

Xây dựng ứng dụng hỗ trợ nhận diện món ăn, ước tính giá trị dinh dưỡng và quản lý nhật ký ăn uống, giúp người dùng hiểu rõ hơn về chế độ ăn của bản thân và duy trì thói quen chăm sóc sức khỏe lâu dài.

### 4.2. Mục tiêu cụ thể

- **Đơn giản hóa việc ghi nhận bữa ăn:** Hỗ trợ nhận diện món ăn qua camera, giảm thao tác tìm kiếm và nhập liệu thủ công.
- **Hỗ trợ ước tính dinh dưỡng:** Cung cấp lượng calo, protein, carbohydrate và chất béo dựa trên món ăn và khẩu phần. Người dùng có thể kiểm tra, điều chỉnh thông tin trước khi lưu.
- **Quản lý lịch sử ăn uống:** Cho phép thêm, xem, chỉnh sửa và xóa bữa ăn trong nhật ký cá nhân.
- **Theo dõi dinh dưỡng theo thời gian:** Tổng hợp dữ liệu thành biểu đồ và báo cáo, giúp người dùng nhận biết lượng dinh dưỡng đã tiêu thụ và sự thay đổi trong thói quen ăn uống.
- **Hỗ trợ điều chỉnh chế độ ăn:** Cung cấp cơ sở để người dùng lựa chọn khẩu phần và cân đối các bữa ăn phù hợp với mục tiêu cá nhân.
- **Duy trì việc theo dõi lâu dài:** Giảm công sức ghi chép và trình bày thông tin rõ ràng để việc quản lý dinh dưỡng dễ thực hiện mỗi ngày.

## 5. Các chức năng chính

| Nhóm chức năng | Nội dung |
|---|---|
| Tài khoản và hồ sơ | Đăng nhập, quản lý thông tin cá nhân |
| Nhận diện món ăn | Sử dụng camera để nhận diện và đề xuất tên món ăn |
| Ước tính dinh dưỡng | Hiển thị calo và các chất dinh dưỡng, hỗ trợ điều chỉnh khẩu phần |
| Nhật ký ăn uống | Lưu, xem, chỉnh sửa và xóa các bữa ăn |
| Thống kê và báo cáo | Tổng hợp lượng calo và dinh dưỡng đã tiêu thụ theo thời gian |

**Luồng sử dụng chính:** Quét món ăn → Kiểm tra kết quả nhận diện → Điều chỉnh khẩu phần → Xem dinh dưỡng ước tính → Lưu bữa ăn → Theo dõi nhật ký và thống kê.

## 6. Định hướng phát triển

- Mở rộng dữ liệu món ăn địa phương để tăng mức độ phù hợp với người dùng.
- Kết nối thiết bị đeo thông minh để bổ sung thông tin phục vụ theo dõi sức khỏe.
- Phát triển tính năng cộng đồng để chia sẻ bữa ăn và kinh nghiệm duy trì chế độ ăn lành mạnh.