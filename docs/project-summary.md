# Tóm tắt dự án

## 1. Tên dự án

**Movie Ticket Booking System - Hệ thống đặt vé xem phim trực tuyến trên AWS**

## 2. Mục tiêu dự án

Dự án xây dựng một hệ thống đặt vé xem phim trực tuyến cho các rạp chiếu phim. Người dùng có thể tìm kiếm phim đang chiếu, chọn suất chiếu, chọn ghế, thanh toán, nhận vé điện tử có mã QR và dùng mã QR để check-in tại rạp phim.

Mục tiêu chính không chỉ là tạo một website/app đặt vé cơ bản, mà còn mô phỏng các bài toán thực tế trong hệ thống bán vé rạp phim có lượng truy cập cao:

- Nhiều người cùng đặt vé và chọn ghế trong cùng một thời điểm.
- Tránh việc đặt trùng ghế (oversell).
- Xử lý thanh toán và tạo vé ổn định.
- Giảm tải cho database khi traffic tăng mạnh (như khi mở bán vé các phim bom tấn MCU).
- Cho phép check-in bằng QR Code tại rạp.
- Theo dõi hệ thống bằng monitoring và cảnh báo.
- Có khả năng mở rộng và phục hồi khi một vùng hạ tầng gặp sự cố.

## 3. Đối tượng sử dụng

Hệ thống phục vụ 3 nhóm người dùng chính:

- **Khách hàng:** tìm kiếm phim, chọn rạp, chọn suất chiếu, đặt ghế, thanh toán, nhận vé và xem lịch sử xem phim.
- **Admin:** quản lý phim, cụm rạp, phòng chiếu, lịch chiếu, giá vé, đơn hàng, doanh thu và trạng thái hệ thống.
- **Nhân viên rạp (Check-in):** quét QR Code, kiểm tra vé hợp lệ và xác nhận người dùng đã vào rạp.

## 4. Giá trị thực tế của dự án

Hệ thống đặt vé xem phim là một bài toán thực tế vì có nhiều tình huống phức tạp hơn CRUD thông thường:

- Cần xử lý race condition khi nhiều người cùng chọn một ghế.
- Cần giữ ghế tạm trong thời gian người dùng thanh toán (thường là 5-10 phút).
- Cần nhả ghế nếu thanh toán thất bại hoặc hết thời gian.
- Cần đảm bảo thanh toán thành công thì vé và ghế phải được chốt.
- Cần chống sử dụng lại một mã QR nhiều lần để vào rạp.
- Cần queue để xử lý đơn hàng ổn định.
- Cần log, metric và cảnh báo để vận hành hệ thống.

## 5. Kết quả mong muốn

Sau khi hoàn thành, dự án cần có:

- Website hoặc mobile app cho người dùng đặt vé phim.
- Trang quản trị cho admin rạp phim.
- Giao diện hoặc app check-in cho nhân viên soát vé.
- API backend xử lý đăng nhập, quản lý phim/rạp, đặt vé, thanh toán và QR Code.
- Database lưu người dùng, phim, rạp chiếu, phòng chiếu, suất chiếu, ghế ngồi, đơn hàng và thanh toán.
- Redis để kiểm soát trạng thái ghế và số lượng vé nhanh.
- SQS/Lambda hoặc worker để xử lý đơn hàng bất đồng bộ.
- Monitoring bằng CloudWatch.
- Tài liệu kiến trúc, flow xử lý và logic nghiệp vụ.

## 6. Điểm nổi bật

Điểm mạnh của dự án là kết hợp cả web/app, backend, cloud và kiến trúc chịu tải:

- Sử dụng Redis để lock ghế và chống oversell vé.
- Sử dụng SQS để tách request đặt vé khỏi quá trình ghi database.
- Sử dụng DynamoDB TTL để lưu phiên giữ ghế tạm thời.
- Tạo vé điện tử bằng QR Code.
- Check-in và chống dùng lại vé.
- Có monitoring, retry, dead-letter queue và cảnh báo lỗi.
- Có thể mở rộng lên multi-region bằng AWS Global Accelerator.
