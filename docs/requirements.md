# Ticket Booking System – Hệ Thống Đặt Vé Sự Kiện Trên AWS

## 1. Tổng quan project

Ticket Booking System là hệ thống đặt vé trực tuyến mô phỏng các nền tảng như Ticketbox, CGV, Galaxy Cinema hoặc hệ thống bán vé concert. Người dùng có thể tìm kiếm sự kiện, chọn vé, thanh toán, nhận mã QR và sử dụng mã QR để check-in tại cổng sự kiện.

Điểm nổi bật của project là hệ thống được thiết kế theo hướng chịu tải cao, chống oversell vé và có khả năng phục hồi khi một khu vực AWS gặp sự cố.

---

## 2. Bài toán cần giải quyết

Trong các hệ thống đặt vé thực tế, đặc biệt là vé concert hoặc sự kiện lớn, có thể có hàng nghìn người truy cập cùng lúc. Nếu xử lý không tốt, hệ thống dễ gặp các vấn đề như:

* Nhiều người mua trùng một vé
* Database bị quá tải
* Thanh toán thành công nhưng không tạo được vé
* Người dùng bị mất phiên đặt vé
* Hệ thống sập khi lượng truy cập tăng đột biến
* Region chính gặp lỗi khiến toàn bộ app ngừng hoạt động

Vì vậy, project này tập trung giải quyết 3 vấn đề chính:

* Chống oversell vé bằng Redis
* Giảm tải database bằng SQS và Lambda
* Tăng khả năng phục hồi bằng Global Accelerator và Multi-Region

---

## 3. Chức năng chính của hệ thống

### 3.1 Người dùng

Người dùng có thể:

* Đăng ký, đăng nhập tài khoản
* Xem danh sách sự kiện
* Tìm kiếm sự kiện theo tên, địa điểm, ngày tổ chức
* Xem chi tiết sự kiện
* Chọn loại vé
* Đặt vé
* Thanh toán
* Nhận vé điện tử kèm QR Code
* Xem lịch sử vé đã mua

### 3.2 Admin

Admin có thể:

* Tạo sự kiện mới
* Cập nhật thông tin sự kiện
* Quản lý số lượng vé
* Xem danh sách đơn hàng
* Theo dõi vé đã bán
* Kiểm tra doanh thu
* Theo dõi trạng thái hệ thống qua CloudWatch

### 3.3 Nhân viên check-in

Nhân viên tại cổng sự kiện có thể:

* Quét QR Code
* Kiểm tra vé hợp lệ hay không
* Xác nhận vé đã được sử dụng
* Ngăn việc dùng lại cùng một vé nhiều lần

---

## 4. Kiến trúc AWS đề xuất

Hệ thống sử dụng các dịch vụ AWS sau:

* Amazon CloudFront: phân phối nội dung frontend cho người dùng
* Amazon S3: lưu trữ frontend, ảnh sự kiện và QR Code
* Amazon API Gateway: tiếp nhận request từ frontend
* AWS Lambda: xử lý logic đặt vé, thanh toán, tạo QR Code
* Amazon ElastiCache Redis: kiểm tra và trừ số lượng vé tạm thời trên RAM
* Amazon SQS: đưa đơn hàng vào hàng đợi để xử lý tuần tự
* Amazon RDS MySQL hoặc Aurora MySQL: lưu dữ liệu chính thức
* Amazon DynamoDB: lưu session đặt vé tạm thời
* Amazon SNS: gửi thông báo khi đặt vé thành công
* Amazon SES: gửi email vé cho người dùng
* Amazon CloudWatch: giám sát log, metrics và cảnh báo
* AWS Global Accelerator: tối ưu truy cập toàn cầu và hỗ trợ failover đa vùng
* Application Load Balancer: phân phối request nếu backend chạy bằng EC2 hoặc ECS
* Amazon Cognito: quản lý đăng nhập và xác thực người dùng

---

## 5. Luồng hoạt động chính

### Luồng 1: Người dùng tìm kiếm sự kiện

1. Người dùng truy cập website.
2. CloudFront phân phối giao diện từ S3.
3. Người dùng tìm kiếm sự kiện.
4. Frontend gọi API Gateway.
5. Lambda truy vấn dữ liệu sự kiện từ RDS hoặc DynamoDB.
6. Kết quả được trả về cho người dùng.

---

### Luồng 2: Người dùng đặt vé

1. Người dùng chọn sự kiện và loại vé.
2. Frontend gửi request đặt vé đến API Gateway.
3. Lambda kiểm tra số lượng vé còn lại trong Redis.
4. Nếu còn vé, Redis sẽ trừ vé tạm thời ngay lập tức.
5. Thông tin đặt vé tạm được lưu vào DynamoDB với thời gian hết hạn.
6. Hệ thống tạo session thanh toán cho người dùng.

Redis được sử dụng ở bước này để xử lý nhanh trên RAM và tránh việc nhiều người cùng mua vượt quá số lượng vé thật.

---

### Luồng 3: Thanh toán

1. Người dùng thực hiện thanh toán.
2. Cổng thanh toán trả kết quả về hệ thống.
3. Lambda nhận kết quả thanh toán.
4. Nếu thanh toán thành công, đơn hàng được đưa vào SQS.
5. Lambda Worker đọc message từ SQS.
6. Lambda Worker ghi đơn hàng chính thức vào RDS.
7. Hệ thống tạo QR Code cho vé.
8. QR Code được lưu vào S3.
9. Người dùng nhận thông báo qua SNS hoặc email qua SES.

---

### Luồng 4: Xử lý khi thanh toán thất bại

1. Nếu người dùng không thanh toán hoặc thanh toán thất bại, session trong DynamoDB hết hạn.
2. Hệ thống hoàn lại số lượng vé trong Redis.
3. Vé được mở lại cho người dùng khác mua.
4. Không ghi đơn hàng vào RDS.

---

### Luồng 5: Check-in bằng QR Code

1. Người dùng đưa QR Code tại cổng sự kiện.
2. Nhân viên dùng app check-in để quét mã.
3. API Gateway gửi request kiểm tra vé.
4. Lambda kiểm tra trạng thái vé trong RDS.
5. Nếu vé hợp lệ và chưa dùng, hệ thống cập nhật trạng thái thành “Checked-in”.
6. Nếu vé đã dùng, hệ thống báo lỗi để tránh gian lận.

---

## 6. Cơ chế chống oversell vé

Oversell xảy ra khi hệ thống bán nhiều vé hơn số lượng thật. Ví dụ sự kiện chỉ còn 1 vé nhưng có 100 người cùng bấm mua.

Để xử lý, hệ thống dùng Redis làm lớp kiểm soát vé nhanh:

* Số lượng vé còn lại được lưu trong Redis
* Khi người dùng đặt vé, hệ thống trừ vé trong Redis trước
* Redis xử lý rất nhanh trên RAM nên phù hợp với lượng truy cập lớn
* Nếu Redis trả về kết quả còn vé, người dùng mới được tiếp tục thanh toán
* Nếu hết vé, hệ thống từ chối ngay, không cần truy vấn database

Nhờ vậy, database không bị quá tải và hệ thống hạn chế tình trạng bán trùng vé.

---

## 7. Vai trò của SQS trong hệ thống

SQS được dùng để tách quá trình đặt vé và quá trình ghi dữ liệu vào database.

Thay vì để mỗi request ghi trực tiếp vào RDS, hệ thống đưa đơn hàng vào hàng đợi SQS. Sau đó Lambda Worker xử lý từng đơn một cách ổn định.

Lợi ích:

* Giảm tải cho database
* Tránh mất đơn khi traffic tăng cao
* Có thể retry nếu xử lý thất bại
* Có thể kết hợp Dead Letter Queue để lưu các đơn lỗi
* Giúp hệ thống hoạt động ổn định hơn khi có nhiều người đặt vé cùng lúc

---

## 8. Vai trò của DynamoDB

DynamoDB dùng để lưu phiên đặt vé tạm thời.

Ví dụ: Người dùng chọn 2 vé và có 10 phút để thanh toán. Trong thời gian đó, thông tin giữ vé được lưu trong DynamoDB.

DynamoDB phù hợp vì:

* Tốc độ cao
* Hỗ trợ TTL để tự động xóa session hết hạn
* Không cần quản lý server
* Phù hợp với dữ liệu tạm thời

---

## 9. Vai trò của Global Accelerator

Global Accelerator giúp người dùng truy cập hệ thống nhanh hơn và hỗ trợ failover giữa nhiều Region.

Ví dụ:

* Region chính: Singapore
* Region dự phòng: Tokyo

Khi hệ thống hoạt động bình thường, phần lớn traffic đi vào Region Singapore. Nếu Region Singapore gặp sự cố, Global Accelerator tự động chuyển traffic sang Region Tokyo.

Lợi ích:

* Giảm độ trễ cho người dùng
* Dùng IP tĩnh toàn cầu
* Failover nhanh hơn DNS truyền thống
* Tăng độ sẵn sàng cho hệ thống

---

## 10. Monitoring và Alert

CloudWatch được dùng để theo dõi:

* Số lượng request API
* Thời gian phản hồi
* Lỗi Lambda
* Số message trong SQS
* CPU và connection của RDS
* Redis memory usage
* Số lượng đơn hàng lỗi
* Trạng thái health check của ALB

Khi có lỗi, CloudWatch Alarm có thể gửi cảnh báo qua SNS cho team vận hành.

---

## 11. Điểm nổi bật để ghi vào CV

Project này có thể ghi vào CV như sau:

Developed a cloud-based Ticket Booking System on AWS with high availability and high traffic handling. Designed a booking flow using Redis to prevent ticket overselling, SQS and Lambda for asynchronous order processing, DynamoDB for temporary booking sessions, RDS for transactional data, and CloudWatch for monitoring. Integrated QR Code ticket generation, notification service, and multi-region failover using AWS Global Accelerator.

---

## 12. Vì sao project này đẹp CV?
Project này đẹp vì nó không chỉ là một app CRUD thông thường. Nó có các bài toán thực tế như:

* High traffic
* Race condition
* Overselling
* Queue-based processing
* Payment workflow
* QR Code check-in
* Monitoring
* Failover
* Multi-Region architecture

Đây là những điểm rất phù hợp với vị trí Cloud Engineer Intern, DevOps Intern hoặc Backend Intern.