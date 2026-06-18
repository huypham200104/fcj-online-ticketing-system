# Chức năng của web/app và chức năng bổ sung

## 1. Chức năng dành cho khách hàng

### 1.1 Tài khoản

- Đăng ký tài khoản.
- Đăng nhập.
- Đăng xuất.
- Quên mật khẩu.
- Cập nhật thông tin cá nhân.
- Xem trạng thái tài khoản.

### 1.2 Tìm kiếm và xem sự kiện

- Xem danh sách sự kiện.
- Tìm kiếm sự kiện theo tên.
- Lọc sự kiện theo địa điểm.
- Lọc sự kiện theo ngày tổ chức.
- Lọc sự kiện theo loại sự kiện.
- Xem chi tiết sự kiện.
- Xem thông tin địa điểm, thời gian và mô tả sự kiện.
- Xem các loại vé còn bán.

### 1.3 Đặt vé

- Chọn loại vé.
- Chọn số lượng vé.
- Kiểm tra số lượng vé còn lại.
- Tạo phiên giữ vé tạm thời.
- Hiển thị thời gian còn lại để thanh toán.
- Hủy phiên đặt vé.
- Tự động giải phóng vé nếu hết thời gian thanh toán.

### 1.4 Thanh toán

- Xem thông tin đơn hàng trước khi thanh toán.
- Chọn phương thức thanh toán.
- Thanh toán bằng mock payment hoặc cổng thanh toán thật.
- Nhận kết quả thanh toán thành công hoặc thất bại.
- Tự động tạo vé khi thanh toán thành công.
- Tự động hoàn vé về kho nếu thanh toán thất bại.

### 1.5 Vé điện tử

- Xem danh sách vé đã mua.
- Xem chi tiết từng vé.
- Nhận QR Code của vé.
- Tải vé điện tử.
- Nhận email xác nhận kèm vé.
- Xem trạng thái vé: valid, checked-in, expired hoặc cancelled.

### 1.6 Lịch sử giao dịch

- Xem lịch sử đơn hàng.
- Xem trạng thái thanh toán.
- Xem tổng tiền đã thanh toán.
- Xem chi tiết từng giao dịch.

## 2. Chức năng dành cho admin

### 2.1 Quản lý sự kiện

- Tạo sự kiện mới.
- Cập nhật thông tin sự kiện.
- Xóa hoặc ẩn sự kiện.
- Upload ảnh sự kiện.
- Thiết lập thời gian mở bán và đóng bán.
- Thiết lập địa điểm tổ chức.
- Thiết lập trạng thái sự kiện: draft, published, sold out, cancelled hoặc completed.

### 2.2 Quản lý loại vé

- Tạo loại vé mới.
- Cập nhật tên, giá và mô tả loại vé.
- Thiết lập tổng số lượng vé.
- Thiết lập số lượng vé tối đa mỗi người được mua.
- Thiết lập thời gian bán cho từng loại vé.
- Theo dõi số lượng vé đã bán và còn lại.

### 2.3 Quản lý đơn hàng

- Xem danh sách đơn hàng.
- Tìm kiếm đơn hàng theo mã đơn, email hoặc sự kiện.
- Lọc đơn hàng theo trạng thái thanh toán.
- Xem chi tiết đơn hàng.
- Hủy đơn hàng khi cần.
- Xuất danh sách đơn hàng.

### 2.4 Quản lý người dùng

- Xem danh sách người dùng.
- Xem chi tiết người dùng.
- Khóa hoặc mở khóa tài khoản.
- Phân quyền user, admin và check-in staff.

### 2.5 Báo cáo và thống kê

- Xem tổng doanh thu.
- Xem số vé đã bán.
- Xem số vé còn lại.
- Xem doanh thu theo sự kiện.
- Xem doanh thu theo ngày.
- Xem tỷ lệ thanh toán thành công/thất bại.
- Xem số lượt check-in.

### 2.6 Theo dõi hệ thống

- Xem trạng thái API.
- Xem số request.
- Xem số lỗi.
- Xem message đang chờ trong queue.
- Xem cảnh báo từ CloudWatch.

## 3. Chức năng dành cho nhân viên check-in

- Đăng nhập bằng tài khoản nhân viên.
- Mở camera để quét QR Code.
- Kiểm tra vé hợp lệ.
- Xác nhận check-in.
- Hiển thị thông tin cơ bản của vé.
- Báo lỗi nếu vé không tồn tại.
- Báo lỗi nếu vé đã được sử dụng.
- Báo lỗi nếu vé thuộc sự kiện khác.
- Báo lỗi nếu vé đã hết hạn hoặc bị hủy.
- Xem lịch sử check-in trong ca làm việc.

## 4. Chức năng backend chính

- API xác thực và phân quyền.
- API quản lý sự kiện.
- API quản lý loại vé.
- API tìm kiếm sự kiện.
- API tạo booking session.
- API xác nhận thanh toán.
- API xử lý webhook thanh toán.
- API tạo vé điện tử.
- API lấy QR Code.
- API kiểm tra và xác nhận check-in.
- API báo cáo doanh thu.
- API quản trị người dùng.

## 5. Chức năng bổ sung nên có

### 5.1 Chức năng nâng cao cho người dùng

- Lưu sự kiện yêu thích.
- Nhắc lịch sự kiện.
- Gửi thông báo trước ngày diễn ra sự kiện.
- Gợi ý sự kiện liên quan.
- Áp dụng mã giảm giá.
- Chia sẻ sự kiện qua mạng xã hội.
- Hoàn vé theo chính sách của sự kiện.
- Chuyển nhượng vé cho người khác.

### 5.2 Chức năng nâng cao cho admin

- Tạo mã khuyến mãi.
- Quản lý banner trên trang chủ.
- Quản lý danh mục sự kiện.
- Duyệt sự kiện trước khi mở bán.
- Xuất báo cáo CSV/Excel.
- Dashboard realtime doanh thu và số vé bán ra.
- Cấu hình phí dịch vụ.
- Cấu hình chính sách hoàn vé.

### 5.3 Chức năng nâng cao về kỹ thuật

- Rate limiting để chống spam API.
- CAPTCHA khi traffic bất thường.
- Waiting room cho sự kiện hot.
- Idempotency key cho thanh toán và tạo đơn.
- Dead-letter queue cho đơn hàng lỗi.
- Audit log cho thao tác admin.
- Feature flag để bật/tắt chức năng.
- Multi-region failover.
- Backup và restore database.
- Load test tự động trước khi mở bán sự kiện lớn.

## 6. Chức năng ưu tiên cho MVP

Phiên bản MVP nên tập trung vào các chức năng sau:

- Đăng ký, đăng nhập.
- Xem danh sách sự kiện.
- Xem chi tiết sự kiện.
- Chọn loại vé và số lượng vé.
- Giữ vé tạm bằng Redis.
- Thanh toán mock.
- Tạo đơn hàng sau thanh toán.
- Tạo QR Code.
- Xem vé đã mua.
- Check-in bằng QR Code.
- Trang admin tạo sự kiện và loại vé.
- Trang admin xem đơn hàng và số vé đã bán.

