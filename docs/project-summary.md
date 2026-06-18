# Tóm tắt dự án

## 1. Tên dự án

**Ticket Booking System - Hệ thống đặt vé sự kiện trực tuyến trên AWS**

## 2. Mục tiêu dự án

Dự án xây dựng một hệ thống đặt vé trực tuyến cho sự kiện, rạp phim, concert hoặc hội thảo. Người dùng có thể tìm kiếm sự kiện, chọn loại vé, thanh toán, nhận vé điện tử có mã QR và dùng mã QR để check-in tại cổng sự kiện.

Mục tiêu chính không chỉ là tạo một website/app đặt vé cơ bản, mà còn mô phỏng các bài toán thực tế trong hệ thống bán vé có lượng truy cập cao:

- Nhiều người cùng đặt vé trong cùng một thời điểm.
- Tránh bán vượt số lượng vé thật.
- Xử lý thanh toán và tạo vé ổn định.
- Giảm tải cho database khi traffic tăng mạnh.
- Cho phép check-in bằng QR Code.
- Theo dõi hệ thống bằng monitoring và cảnh báo.
- Có khả năng mở rộng và phục hồi khi một vùng hạ tầng gặp sự cố.

## 3. Đối tượng sử dụng

Hệ thống phục vụ 3 nhóm người dùng chính:

- **Khách hàng:** tìm kiếm sự kiện, đặt vé, thanh toán, nhận vé và xem lịch sử mua vé.
- **Admin:** quản lý sự kiện, số lượng vé, đơn hàng, doanh thu và trạng thái hệ thống.
- **Nhân viên check-in:** quét QR Code, kiểm tra vé hợp lệ và xác nhận người dùng đã vào cổng.

## 4. Giá trị thực tế của dự án

Hệ thống đặt vé là một bài toán thực tế vì có nhiều tình huống phức tạp hơn CRUD thông thường:

- Cần xử lý race condition khi nhiều người cùng mua vé.
- Cần giữ vé tạm trong thời gian người dùng thanh toán.
- Cần hoàn vé nếu thanh toán thất bại hoặc hết thời gian.
- Cần đảm bảo thanh toán thành công thì vé phải được tạo.
- Cần chống sử dụng lại một mã QR nhiều lần.
- Cần queue để xử lý đơn hàng ổn định.
- Cần log, metric và cảnh báo để vận hành hệ thống.

## 5. Kết quả mong muốn

Sau khi hoàn thành, dự án cần có:

- Website hoặc mobile app cho người dùng đặt vé.
- Trang quản trị cho admin.
- Giao diện hoặc app check-in cho nhân viên.
- API backend xử lý đăng nhập, sự kiện, đặt vé, thanh toán và QR Code.
- Database lưu người dùng, sự kiện, vé, đơn hàng và thanh toán.
- Redis để kiểm soát số lượng vé nhanh.
- SQS/Lambda hoặc worker để xử lý đơn hàng bất đồng bộ.
- Monitoring bằng CloudWatch.
- Tài liệu kiến trúc, flow xử lý và logic nghiệp vụ.

## 6. Điểm nổi bật

Điểm mạnh của dự án là kết hợp cả web/app, backend, cloud và kiến trúc chịu tải:

- Sử dụng Redis để chống oversell vé.
- Sử dụng SQS để tách request đặt vé khỏi quá trình ghi database.
- Sử dụng DynamoDB TTL để lưu phiên giữ vé tạm thời.
- Tạo vé điện tử bằng QR Code.
- Check-in và chống dùng lại vé.
- Có monitoring, retry, dead-letter queue và cảnh báo lỗi.
- Có thể mở rộng lên multi-region bằng AWS Global Accelerator.

