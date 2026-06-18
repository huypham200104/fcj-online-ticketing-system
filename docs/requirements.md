# Movie Ticket Booking System – Hệ Thống Đặt Vé Xem Phim Trên AWS

## 1. Tổng quan project

Movie Ticket Booking System là hệ thống đặt vé xem phim trực tuyến mô phỏng các nền tảng như CGV, Galaxy Cinema, Lotte Cinema. Người dùng có thể tìm kiếm phim đang chiếu, xem rạp, chọn suất chiếu, chọn ghế trên sơ đồ, thanh toán, nhận vé điện tử kèm mã QR và sử dụng mã QR để check-in tại rạp phim.

Điểm nổi bật của project là hệ thống được thiết kế theo hướng chịu tải cao, chống oversell (đặt trùng ghế) và có khả năng phục hồi khi một khu vực AWS gặp sự cố, đặc biệt hữu ích vào các dịp mở bán vé phim bom tấn.

---

## 2. Bài toán cần giải quyết

Trong các hệ thống đặt vé xem phim thực tế, khi có phim bom tấn mở bán sớm (như Avengers), lượng truy cập sẽ cực lớn trong một thời điểm ngắn. Hệ thống dễ gặp các vấn đề:

* Nhiều người cùng lúc bấm chọn một ghế ngồi.
* Database bị quá tải khi xử lý sơ đồ ghế cho hàng vạn người cùng xem.
* Giữ ghế tạm thời quá lâu khiến người khác không mua được.
* Thanh toán thành công nhưng bị lỗi hệ thống nên không xuất được vé.

Vì vậy, project này tập trung giải quyết 3 vấn đề chính:

* Chống oversell ghế ngồi và lock ghế realtime bằng Redis.
* Giảm tải database bằng SQS và Lambda Worker.
* Tăng khả năng phục hồi bằng Global Accelerator và Multi-Region.

---

## 3. Chức năng chính của hệ thống

### 3.1 Người dùng

Người dùng có thể:

* Xem danh sách phim (Đang chiếu, Sắp chiếu).
* Tìm rạp chiếu phim gần nhất.
* Xem chi tiết phim, lịch chiếu.
* Chọn rạp, suất chiếu.
* Mở sơ đồ phòng chiếu và chọn ghế ngồi.
* Mua kèm bắp nước.
* Đặt vé và Thanh toán.
* Nhận vé điện tử kèm QR Code (chứa thông tin Phim, Rạp, Phòng, Số ghế).
* Xem lịch sử vé đã mua.

### 3.2 Admin

Admin có thể:

* Quản lý danh mục phim, diễn viên, trailer.
* Quản lý cụm rạp, rạp, phòng chiếu và sơ đồ ghế.
* Quản lý lịch chiếu (suất chiếu) và giá vé theo khung giờ.
* Xem danh sách đơn hàng.
* Theo dõi số vé đã bán và tỷ lệ lấp đầy rạp.
* Theo dõi doanh thu.

### 3.3 Nhân viên soát vé

Nhân viên tại cửa rạp phim có thể:

* Quét QR Code trên điện thoại khách hàng.
* Kiểm tra vé có đúng suất chiếu, đúng phòng và còn hợp lệ không.
* Xác nhận check-in để cho khách vào rạp.
* Ngăn việc dùng lại cùng một mã QR.

---

## 4. Kiến trúc AWS đề xuất

Hệ thống sử dụng các dịch vụ AWS sau:

* Amazon CloudFront: phân phối nội dung frontend.
* Amazon S3: lưu trữ frontend, poster phim, ảnh rạp và QR Code.
* Amazon API Gateway: tiếp nhận request từ frontend.
* AWS Lambda: xử lý logic đặt vé, thanh toán, tạo QR Code.
* Amazon ElastiCache Redis: quản lý trạng thái ghế (lock ghế tạm thời) và chống oversell trên RAM.
* Amazon SQS: đưa đơn hàng vào hàng đợi để xử lý tuần tự sau khi thanh toán.
* Amazon RDS MySQL hoặc Aurora MySQL: lưu dữ liệu chính thức (Phim, Rạp, Ghế, Đơn hàng).
* Amazon DynamoDB: lưu session đặt vé/lock ghế tạm thời.
* Amazon SNS: gửi thông báo đặt vé thành công.
* Amazon SES: gửi email vé cho người dùng.
* Amazon CloudWatch: giám sát log, metrics và cảnh báo.
* AWS Global Accelerator: tối ưu truy cập toàn cầu và hỗ trợ failover.
* Amazon Cognito: quản lý xác thực người dùng.

---

## 5. Luồng hoạt động chính

### Luồng 1: Người dùng chọn ghế và lock ghế

1. Người dùng chọn ghế trên sơ đồ của một suất chiếu.
2. Frontend gửi request lock ghế đến API.
3. Lambda kiểm tra trạng thái ghế trong Redis.
4. Nếu ghế còn trống, Redis dùng thao tác atomic cập nhật trạng thái thành `LOCKED`.
5. Tạo session giữ ghế (ví dụ 10 phút) trong DynamoDB.
6. Hệ thống bắt đầu đếm ngược thời gian thanh toán.

### Luồng 2: Thanh toán và xuất vé

1. Người dùng thanh toán.
2. Cổng thanh toán trả webhook về hệ thống.
3. Lambda đổi trạng thái ghế trong Redis thành `SOLD`.
4. Lambda gửi đơn hàng vào SQS.
5. Lambda Worker đọc SQS và ghi đơn hàng, thông tin ghế vào RDS.
6. Worker tạo QR Code và lưu vào S3.
7. Worker gửi email vé qua SES.

---

## 6. Cơ chế chống oversell (Đặt trùng ghế)

Để tránh việc 2 người cùng chọn 1 ghế, hệ thống dùng Redis làm lớp kiểm soát ghế nhanh:

* Trạng thái ghế của mỗi suất chiếu được lưu trên Redis (VD: A1: AVAILABLE, A2: LOCKED).
* Khi 2 người cùng bấm chọn A1, Redis dùng Lua Script để kiểm tra và cập nhật một cách atomic.
* Chỉ request nào đến trước 1 mili-giây mới nhận được kết quả thành công và đổi trạng thái thành LOCKED. Request còn lại sẽ nhận lỗi "Ghế đã có người chọn".
* Database SQL (RDS) không bị dội bom bằng hàng ngàn truy vấn kiểm tra ghế cùng lúc.

---

## 7. Vai trò của SQS trong hệ thống

Thay vì để mỗi request thanh toán ghi trực tiếp vào RDS (chèn dữ liệu vào bảng Đơn hàng, Vé, cập nhật bảng Ghế, Giao dịch), hệ thống đưa tác vụ này vào SQS.

Lợi ích:

* Database không bị treo khi có hàng ngàn đơn hàng dồn về cùng một phút.
* Tránh mất đơn nếu DB đang bị nghẽn.
* Đảm bảo tính nhất quán của dữ liệu.

---

## 8. Điểm nổi bật để ghi vào CV

Dự án này rất phù hợp để ghi vào CV:

Developed a cloud-based Movie Ticket Booking System on AWS handling high-concurrency seat reservations. Implemented an atomic seat-locking mechanism using Redis Lua scripts to prevent overselling and double-booking during peak blockbusters. Utilized SQS and Lambda for asynchronous order processing to reduce database load. Designed DynamoDB TTL for booking session timeouts and Amazon Aurora for transactional data. Integrated QR code check-in flows and setup CloudWatch monitoring.