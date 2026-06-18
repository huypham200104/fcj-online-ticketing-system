# Những bước cần làm

## 1. Giai đoạn phân tích yêu cầu

Các công việc cần thực hiện:

- Xác định loại hệ thống: website, mobile app hoặc cả hai.
- Xác định nhóm người dùng: khách hàng, admin và nhân viên check-in.
- Xác định chức năng bắt buộc của từng nhóm người dùng.
- Xác định loại sự kiện cần hỗ trợ: concert, rạp phim, hội thảo, workshop hoặc sự kiện tổng quát.
- Xác định quy trình đặt vé từ lúc chọn sự kiện đến lúc check-in.
- Xác định yêu cầu phi chức năng: hiệu năng, bảo mật, khả năng mở rộng, logging và monitoring.

Kết quả đầu ra:

- Tài liệu yêu cầu chức năng.
- Tài liệu yêu cầu phi chức năng.
- Danh sách màn hình chính.
- Danh sách API chính.

## 2. Giai đoạn thiết kế hệ thống

Các công việc cần thực hiện:

- Thiết kế kiến trúc tổng thể frontend, backend, database và cloud.
- Thiết kế database schema.
- Thiết kế API contract.
- Thiết kế luồng đặt vé, thanh toán, hoàn vé và check-in.
- Thiết kế cơ chế chống oversell bằng Redis.
- Thiết kế queue xử lý đơn hàng bằng SQS.
- Thiết kế cơ chế retry và xử lý lỗi.
- Thiết kế phân quyền người dùng.

Kết quả đầu ra:

- Sơ đồ kiến trúc hệ thống.
- ERD database.
- API specification.
- Sequence diagram cho các luồng chính.
- Tài liệu phân quyền.

## 3. Giai đoạn xây dựng frontend

Các công việc cần thực hiện:

- Tạo giao diện đăng ký, đăng nhập.
- Tạo trang danh sách sự kiện.
- Tạo trang tìm kiếm và lọc sự kiện.
- Tạo trang chi tiết sự kiện.
- Tạo màn hình chọn loại vé và số lượng vé.
- Tạo màn hình thanh toán.
- Tạo trang vé của tôi.
- Tạo trang lịch sử mua vé.
- Tạo trang admin quản lý sự kiện, vé và đơn hàng.
- Tạo giao diện check-in bằng QR Code.

Kết quả đầu ra:

- Frontend web hoặc mobile app hoạt động được với dữ liệu mock.
- UI responsive cho desktop và mobile.
- Luồng đặt vé cơ bản từ giao diện.

## 4. Giai đoạn xây dựng backend

Các công việc cần thực hiện:

- Xây dựng API xác thực người dùng.
- Xây dựng API quản lý sự kiện.
- Xây dựng API quản lý loại vé.
- Xây dựng API tạo booking session.
- Tích hợp Redis để giữ vé tạm.
- Tích hợp DynamoDB hoặc database tạm để lưu phiên đặt vé.
- Xây dựng API thanh toán hoặc mock payment.
- Đưa đơn hàng đã thanh toán vào queue.
- Xây dựng worker xử lý đơn hàng từ queue.
- Tạo vé và QR Code sau khi thanh toán thành công.
- Xây dựng API check-in bằng QR Code.
- Xây dựng API báo cáo doanh thu và số vé đã bán.

Kết quả đầu ra:

- Backend API hoàn chỉnh.
- Cơ chế đặt vé không bị oversell.
- Đơn hàng được xử lý ổn định qua queue.
- QR Code được tạo và kiểm tra hợp lệ.

## 5. Giai đoạn tích hợp cloud

Các công việc cần thực hiện:

- Deploy frontend lên Amazon S3 và CloudFront.
- Deploy backend bằng AWS Lambda hoặc ECS.
- Cấu hình API Gateway.
- Tạo RDS/Aurora MySQL cho dữ liệu chính.
- Tạo ElastiCache Redis cho kiểm soát số lượng vé.
- Tạo SQS queue và dead-letter queue.
- Tạo S3 bucket lưu ảnh sự kiện và QR Code.
- Tạo CloudWatch log group, metric và alarm.
- Cấu hình SES hoặc SNS để gửi email/thông báo.
- Cấu hình IAM role đúng quyền tối thiểu.

Kết quả đầu ra:

- Hệ thống chạy trên AWS.
- Có log và monitoring.
- Có cảnh báo khi lỗi tăng hoặc queue bị tồn đọng.

## 6. Giai đoạn kiểm thử

Các công việc cần thực hiện:

- Test API bằng Postman hoặc automated test.
- Test luồng đăng ký, đăng nhập.
- Test tạo sự kiện và loại vé.
- Test đặt vé thành công.
- Test thanh toán thất bại và hoàn vé.
- Test nhiều người đặt cùng lúc để kiểm tra oversell.
- Test QR Code hợp lệ, không hợp lệ và đã sử dụng.
- Test quyền truy cập giữa user, admin và check-in staff.
- Test retry khi worker xử lý đơn hàng lỗi.
- Load test các API quan trọng.

Kết quả đầu ra:

- Báo cáo test case.
- Báo cáo lỗi đã sửa.
- Kết quả load test.

## 7. Giai đoạn hoàn thiện và bàn giao

Các công việc cần thực hiện:

- Hoàn thiện README.
- Viết tài liệu cài đặt local.
- Viết tài liệu deploy lên AWS.
- Viết tài liệu API.
- Viết tài liệu kiến trúc.
- Chuẩn bị hình ảnh demo.
- Chuẩn bị nội dung mô tả dự án cho CV hoặc portfolio.

Kết quả đầu ra:

- Source code hoàn chỉnh.
- Tài liệu hướng dẫn sử dụng.
- Tài liệu vận hành.
- Demo video hoặc screenshot.

