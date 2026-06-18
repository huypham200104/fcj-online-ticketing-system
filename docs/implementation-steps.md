# Những bước cần làm

## 1. Giai đoạn phân tích yêu cầu

Các công việc cần thực hiện:

- Xác định loại hệ thống: website bán vé xem phim, mobile app hoặc cả hai.
- Xác định nhóm người dùng: khách hàng, admin (cấp rạp/cấp tổng) và nhân viên soát vé.
- Xác định chức năng bắt buộc của từng nhóm người dùng.
- Xác định cấu trúc dữ liệu cơ bản: Phim, Cụm Rạp, Rạp, Phòng Chiếu, Suất Chiếu, Sơ đồ ghế, Vé, Combo bắp nước.
- Xác định quy trình đặt vé từ lúc chọn phim, chọn suất chiếu, chọn ghế đến lúc check-in.
- Xác định yêu cầu phi chức năng: hiệu năng khi mở bán phim hot, bảo mật, khả năng realtime cập nhật ghế, logging và monitoring.

Kết quả đầu ra:

- Tài liệu yêu cầu chức năng.
- Tài liệu yêu cầu phi chức năng.
- Danh sách màn hình chính.
- Danh sách API chính.

## 2. Giai đoạn thiết kế hệ thống

Các công việc cần thực hiện:

- Thiết kế kiến trúc tổng thể frontend, backend, database và cloud.
- Thiết kế database schema (chú trọng cấu trúc Rạp - Phòng Chiếu - Ghế - Suất Chiếu).
- Thiết kế API contract.
- Thiết kế luồng đặt vé, lock ghế tạm thời, thanh toán, nhả ghế và check-in.
- Thiết kế cơ chế chống oversell (đặt trùng ghế) bằng Redis.
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
- Tạo trang danh sách phim (Đang chiếu / Sắp chiếu).
- Tạo trang chi tiết phim, xem trailer.
- Tạo trang chọn rạp và lịch chiếu.
- Tạo giao diện sơ đồ ghế ngồi (chọn ghế, hiển thị trạng thái ghế realtime).
- Tạo màn hình chọn bắp nước (nếu có).
- Tạo màn hình thanh toán và countdown giữ ghế.
- Tạo trang vé của tôi (hiển thị QR Code).
- Tạo trang lịch sử mua vé.
- Tạo trang admin quản lý phim, rạp, suất chiếu, vé và đơn hàng.
- Tạo giao diện check-in bằng QR Code cho nhân viên rạp.

Kết quả đầu ra:

- Frontend web hoặc mobile app hoạt động được với dữ liệu mock.
- UI responsive cho desktop và mobile (sơ đồ ghế cần tối ưu trên mobile).
- Luồng đặt vé cơ bản từ giao diện.

## 4. Giai đoạn xây dựng backend

Các công việc cần thực hiện:

- Xây dựng API xác thực người dùng.
- Xây dựng API quản lý phim, rạp, phòng chiếu, ghế ngồi.
- Xây dựng API quản lý suất chiếu và giá vé.
- Xây dựng API tạo booking session và lock ghế tạm thời.
- Tích hợp Redis để quản lý trạng thái ghế (trống, đang giữ, đã bán).
- Tích hợp DynamoDB hoặc database tạm để lưu phiên đặt vé có TTL.
- Xây dựng API thanh toán hoặc mock payment.
- Đưa đơn hàng đã thanh toán vào queue.
- Xây dựng worker xử lý đơn hàng từ queue, chốt ghế trong DB.
- Tạo vé điện tử và QR Code sau khi thanh toán thành công.
- Xây dựng API check-in soát vé bằng QR Code.
- Xây dựng API báo cáo doanh thu và tỷ lệ lấp đầy.

Kết quả đầu ra:

- Backend API hoàn chỉnh.
- Cơ chế đặt vé an toàn, không thể chọn trùng ghế.
- Đơn hàng được xử lý ổn định qua queue.
- QR Code được tạo và kiểm tra hợp lệ tại rạp.

## 5. Giai đoạn tích hợp cloud

Các công việc cần thực hiện:

- Deploy frontend lên Amazon S3 và CloudFront.
- Deploy backend bằng AWS Lambda hoặc ECS.
- Cấu hình API Gateway.
- Tạo RDS/Aurora MySQL cho dữ liệu chính.
- Tạo ElastiCache Redis cho kiểm soát ghế ngồi.
- Tạo SQS queue và dead-letter queue.
- Tạo S3 bucket lưu ảnh poster phim và QR Code.
- Tạo CloudWatch log group, metric và alarm.
- Cấu hình SES hoặc SNS để gửi email/thông báo vé.
- Cấu hình IAM role đúng quyền tối thiểu.

Kết quả đầu ra:

- Hệ thống chạy trên AWS.
- Có log và monitoring.
- Có cảnh báo khi lỗi tăng hoặc queue bị tồn đọng.

## 6. Giai đoạn kiểm thử

Các công việc cần thực hiện:

- Test API bằng Postman hoặc automated test.
- Test luồng đăng ký, đăng nhập.
- Test quản lý rạp, phòng chiếu, suất chiếu.
- Test đặt vé và lock ghế thành công.
- Test thanh toán thất bại và hệ thống nhả ghế tự động.
- Test race condition: nhiều user cùng click chọn 1 ghế cùng thời điểm.
- Test QR Code hợp lệ, không hợp lệ, sai suất chiếu và đã sử dụng.
- Test quyền truy cập giữa user, admin rạp, admin tổng.
- Test retry khi worker xử lý đơn hàng lỗi.
- Load test các API quan trọng (đặc biệt API lấy sơ đồ ghế và lock ghế).

Kết quả đầu ra:

- Báo cáo test case.
- Báo cáo lỗi đã sửa.
- Kết quả load test phòng hờ khi mở bán vé Avengers/phim bom tấn.

## 7. Giai đoạn hoàn thiện và bàn giao

Các công việc cần thực hiện:

- Hoàn thiện README.
- Viết tài liệu cài đặt local.
- Viết tài liệu deploy lên AWS.
- Viết tài liệu API.
- Viết tài liệu kiến trúc.
- Chuẩn bị hình ảnh demo giao diện sơ đồ ghế.
- Chuẩn bị nội dung mô tả dự án cho CV hoặc portfolio.

Kết quả đầu ra:

- Source code hoàn chỉnh.
- Tài liệu hướng dẫn sử dụng.
- Tài liệu vận hành.
- Demo video hoặc screenshot.
