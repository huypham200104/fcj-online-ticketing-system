# Công nghệ nên dùng

## 1. Frontend web

Các lựa chọn phù hợp:

- **React.js hoặc Next.js:** Rất phù hợp để xây dựng giao diện hiển thị sơ đồ ghế ngồi rạp phim phức tạp.
- **TypeScript:** Giúp giảm thiểu lỗi khi làm việc với object data lớn như cấu trúc Rạp -> Phòng chiếu -> Sơ đồ ghế.
- **Tailwind CSS:** Dễ thiết kế các thành phần UI như màn hình chọn ghế, chọn bắp nước, hiển thị poster phim.
- **React Query hoặc SWR:** Quản lý server state, đặc biệt hữu ích khi cần poll (gọi định kỳ) API để cập nhật trạng thái ghế trống/ghế đã bán trên sơ đồ realtime.
- **Zustand hoặc Redux Toolkit:** Quản lý giỏ hàng (ghế đang chọn, bắp nước đang chọn, đếm ngược thời gian).

## 2. Mobile app

- **Flutter hoặc React Native:** Rất phù hợp để làm app hiển thị vé QR Code cho người dùng, và app quét QR Code check-in vé cho nhân viên tại cửa rạp.

## 3. Backend

- **Node.js + NestJS:** Kiến trúc module rõ ràng, rất dễ chia các domain như Movies, Cinemas, Showtimes, Bookings, Payments.
- **AWS Lambda + Serverless Framework:** Nếu muốn tiết kiệm chi phí và xây dựng theo chuẩn Cloud-native serverless.

## 4. Database chính

- **MySQL / PostgreSQL:** Hệ thống bán vé rạp phim đòi hỏi cấu trúc dữ liệu quan hệ chặt chẽ (Phim có nhiều Suất Chiếu, Suất Chiếu diễn ra tại một Phòng Chiếu thuộc về một Rạp, Đơn Hàng chứa nhiều Ghế thuộc về một Suất Chiếu). PostgreSQL là lựa chọn tuyệt vời nhờ hỗ trợ JSON và constraint tốt.
- **Amazon RDS hoặc Aurora PostgreSQL/MySQL** cho môi trường Production.

## 5. Cache và kiểm soát ghế ngồi (Redis)

- Hệ thống **BẮT BUỘC** phải có Redis để giải quyết bài toán cốt lõi: Lock ghế tạm thời.
- Redis giúp kiểm tra và cập nhật trạng thái ghế (Trống -> Đang giữ) một cách atomic bằng Lua Script, tốc độ chỉ vài mili-giây, ngăn chặn hoàn toàn việc 2 người mua trùng 1 ghế.
- **Amazon ElastiCache Redis** khi triển khai lên AWS.

## 6. Queue và xử lý bất đồng bộ

- **Amazon SQS / RabbitMQ:** Hàng đợi xử lý đơn hàng sau khi khách thanh toán thành công để giảm tải cho Database chính.
- Việc ghi dữ liệu đơn hàng, tạo vé, trừ kho bắp nước sẽ do worker đọc từ SQS xử lý.

## 7. Lưu phiên giữ ghế tạm thời

- Khi khách chọn ghế, khách có 10 phút để thanh toán.
- Có thể dùng **Redis TTL** hoặc **Amazon DynamoDB TTL** để lưu session này. Hết 10 phút, dữ liệu tự xóa, hệ thống sẽ kích hoạt trigger nhả ghế về lại trạng thái trống.

## 8. Thanh toán

- Sử dụng Mock Payment cho MVP.
- Sau đó tích hợp **Stripe**, **VNPay**, hoặc **MoMo** để mô phỏng chính xác luồng redirect thanh toán và xử lý webhook.

## 9. QR Code và Check-in vé tại rạp

- Sử dụng thư viện tạo QR Code từ một chuỗi JWT (JSON Web Token) chứa thông tin vé.
- Thiết bị của nhân viên soát vé sẽ quét QR, gửi token lên backend để giải mã, verify chữ ký và cập nhật trạng thái vé thành `Checked-in`.

## 10. Stack đề xuất cuối cùng cho ứng dụng Đặt Vé Xem Phim

- **Frontend:** Next.js, TypeScript, Tailwind CSS, React Query (để hiển thị sơ đồ ghế realtime).
- **Backend:** NestJS (TypeScript).
- **Database:** PostgreSQL (Lưu Phim, Rạp, Phòng Chiếu, Suất Chiếu, Vé).
- **Cache & Lock ghế:** Redis (Lua Script).
- **Queue:** SQS hoặc BullMQ (xử lý đơn hàng).
- **Storage:** Amazon S3 (Lưu poster phim, QR code).
- **Monitoring:** CloudWatch / Datadog.
