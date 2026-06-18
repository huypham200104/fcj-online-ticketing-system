# Chức năng của web/app và chức năng bổ sung

## 1. Chức năng dành cho khách hàng

### 1.1 Tài khoản

- Đăng ký tài khoản.
- Đăng nhập.
- Đăng xuất.
- Quên mật khẩu.
- Cập nhật thông tin cá nhân.
- Xem trạng thái tài khoản.

### 1.2 Tìm kiếm và xem phim

- Xem danh sách phim đang chiếu / sắp chiếu.
- Tìm kiếm phim theo tên.
- Lọc phim theo cụm rạp, tỉnh/thành phố.
- Lọc phim theo thể loại, định dạng (2D, 3D, IMAX).
- Lọc suất chiếu theo ngày giờ.
- Xem chi tiết phim (trailer, diễn viên, đạo diễn, tóm tắt).
- Xem danh sách suất chiếu của phim theo từng rạp.

### 1.3 Đặt vé và chọn ghế

- Chọn suất chiếu và rạp.
- Xem sơ đồ phòng chiếu và tình trạng ghế (trống, đang giữ, đã bán).
- Chọn ghế trống.
- Kiểm tra số lượng vé/ghế tối đa mỗi lần mua.
- Tạo phiên giữ ghế (lock ghế) tạm thời (VD: 5-10 phút).
- Hiển thị countdown thời gian còn lại để thanh toán.
- Hủy phiên đặt vé.
- Tự động giải phóng ghế nếu hết thời gian thanh toán.

### 1.4 Thanh toán

- Xem thông tin đơn hàng (tên phim, rạp, suất chiếu, ghế, bắp nước) trước khi thanh toán.
- Chọn phương thức thanh toán.
- Thanh toán bằng mock payment hoặc cổng thanh toán thật.
- Nhận kết quả thanh toán thành công hoặc thất bại.
- Tự động tạo vé và chốt ghế khi thanh toán thành công.
- Tự động hoàn ghế về trạng thái trống nếu thanh toán thất bại.

### 1.5 Vé điện tử

- Xem danh sách vé phim đã mua.
- Xem chi tiết từng vé (rạp, suất chiếu, số ghế).
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

### 2.1 Quản lý phim

- Tạo phim mới (thêm poster, trailer, mô tả, dàn diễn viên).
- Cập nhật thông tin phim.
- Xóa hoặc ẩn phim.
- Thiết lập trạng thái phim: sắp chiếu, đang chiếu, ngừng chiếu.

### 2.2 Quản lý rạp và phòng chiếu

- Thêm cụm rạp, rạp chiếu mới.
- Tạo sơ đồ phòng chiếu (số lượng hàng, số ghế mỗi hàng, loại ghế như VIP, Sweetbox, Standard).
- Quản lý trạng thái rạp/phòng chiếu (đang hoạt động, bảo trì).

### 2.3 Quản lý lịch chiếu (Suất chiếu)

- Tạo suất chiếu mới cho phim tại các phòng chiếu.
- Thiết lập thời gian chiếu, định dạng phim (2D, 3D).
- Cập nhật giá vé theo suất chiếu, loại ghế, khung giờ.
- Theo dõi tình trạng bán vé/ghế của từng suất chiếu.

### 2.4 Quản lý đơn hàng

- Xem danh sách đơn hàng.
- Tìm kiếm đơn hàng theo mã đơn, email hoặc tên phim.
- Lọc đơn hàng theo trạng thái thanh toán.
- Xem chi tiết đơn hàng và ghế đã đặt.
- Hủy đơn hàng khi cần.
- Xuất danh sách đơn hàng.

### 2.5 Quản lý người dùng

- Xem danh sách người dùng.
- Xem chi tiết người dùng.
- Khóa hoặc mở khóa tài khoản.
- Phân quyền user, admin rạp, admin tổng và nhân viên soát vé.

### 2.6 Báo cáo và thống kê

- Xem tổng doanh thu.
- Xem số vé đã bán.
- Xem doanh thu theo phim.
- Xem doanh thu theo rạp/cụm rạp.
- Xem tỷ lệ lấp đầy phòng chiếu.
- Xem tỷ lệ thanh toán thành công/thất bại.

### 2.7 Theo dõi hệ thống

- Xem trạng thái API.
- Xem số request.
- Xem số lỗi.
- Xem message đang chờ trong queue.
- Xem cảnh báo từ CloudWatch.

## 3. Chức năng dành cho nhân viên soát vé (Check-in)

- Đăng nhập bằng tài khoản nhân viên.
- Mở camera để quét QR Code của khách hàng.
- Kiểm tra vé hợp lệ cho đúng suất chiếu hiện tại.
- Xác nhận check-in (cho phép khách vào rạp).
- Hiển thị số lượng vé, số ghế và bắp nước đi kèm.
- Báo lỗi nếu vé không tồn tại hoặc suất chiếu đã kết thúc.
- Báo lỗi nếu vé đã được sử dụng.
- Báo lỗi nếu vé thuộc rạp hoặc suất chiếu khác.
- Xem lịch sử check-in trong ca làm việc.

## 4. Chức năng backend chính

- API xác thực và phân quyền.
- API quản lý phim, rạp, phòng chiếu.
- API quản lý suất chiếu và giá vé.
- API tìm kiếm phim và suất chiếu.
- API lấy sơ đồ ghế và tình trạng ghế realtime.
- API tạo booking session và lock ghế.
- API xác nhận thanh toán.
- API xử lý webhook thanh toán.
- API tạo vé điện tử.
- API lấy QR Code.
- API kiểm tra và xác nhận check-in tại rạp.
- API báo cáo doanh thu.
- API quản trị người dùng.

## 5. Chức năng bổ sung nên có

### 5.1 Chức năng nâng cao cho người dùng

- Bán kèm dịch vụ phụ (bắp, nước, combo).
- Lưu rạp yêu thích, phim yêu thích.
- Đánh giá và bình luận phim.
- Nhắc lịch xem phim.
- Áp dụng mã giảm giá, voucher.
- Tích điểm thành viên (Membership point).

### 5.2 Chức năng nâng cao cho admin

- Tạo mã khuyến mãi.
- Quản lý banner trên trang chủ.
- Duyệt phim trước khi mở bán.
- Xuất báo cáo CSV/Excel.
- Dashboard realtime doanh thu và số vé bán ra.
- Cấu hình phí dịch vụ.
- Quản lý combo bắp nước.

### 5.3 Chức năng nâng cao về kỹ thuật

- Rate limiting để chống spam API.
- CAPTCHA khi traffic bất thường.
- Waiting room cho các phim bom tấn hot.
- Idempotency key cho thanh toán và tạo đơn.
- Dead-letter queue cho đơn hàng lỗi.
- Audit log cho thao tác admin.
- Feature flag để bật/tắt chức năng.
- WebSockets để cập nhật tình trạng ghế trống theo realtime cho nhiều người đang cùng xem sơ đồ.

## 6. Chức năng ưu tiên cho MVP

Phiên bản MVP nên tập trung vào các chức năng sau:

- Đăng ký, đăng nhập.
- Xem danh sách phim đang chiếu.
- Xem chi tiết phim và lịch chiếu.
- Hiển thị sơ đồ ghế và chọn ghế.
- Lock ghế tạm bằng Redis.
- Mua thêm bắp nước (tùy chọn đơn giản).
- Thanh toán mock.
- Tạo đơn hàng sau thanh toán.
- Tạo QR Code.
- Xem vé đã mua.
- Check-in soát vé bằng QR Code.
- Trang admin quản lý phim, phòng chiếu, suất chiếu.
- Trang admin xem đơn hàng và doanh thu.
