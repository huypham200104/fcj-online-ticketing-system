# Logic trong chương trình

## 1. Logic phân quyền

Hệ thống có 3 nhóm quyền chính:

- **User:** xem phim, chọn rạp, chọn ghế, thanh toán, xem vé đã mua.
- **Admin:** quản lý phim, cụm rạp, phòng chiếu, suất chiếu, giá vé, người dùng và báo cáo. (Có thể chia thêm Admin rạp và Admin hệ thống).
- **Check-in staff:** soát vé, quét QR Code và cho khách vào rạp.

Logic kiểm tra quyền:

1. Người dùng đăng nhập và nhận access token.
2. Frontend gửi token trong mỗi request cần xác thực.
3. Backend kiểm tra token.
4. Backend lấy role của người dùng.
5. Backend chỉ cho phép truy cập API nếu role phù hợp.

## 2. Logic tạo booking session (Lock ghế)

Booking session là phiên giữ ghế tạm thời trong lúc người dùng thanh toán (VD: 5-10 phút).

Luồng xử lý:

1. Người dùng chọn suất chiếu và chọn ghế trên sơ đồ.
2. Backend kiểm tra suất chiếu có đang mở bán không và chưa bắt đầu chiếu không.
3. Backend gọi Redis để kiểm tra trạng thái của các ghế vừa chọn.
4. Nếu ghế đã bị người khác chọn (lock/sold), backend trả lỗi "Ghế đã có người đặt".
5. Nếu ghế trống, backend dùng Redis thao tác atomic để cập nhật trạng thái các ghế này thành `LOCKED` (kèm TTL là thời gian giữ ghế).
6. Backend tạo booking session trong DB hoặc DynamoDB.
7. Frontend hiển thị countdown thanh toán cho người dùng.

Điều kiện hợp lệ:

- Phim đang ở trạng thái công chiếu.
- Suất chiếu chưa bắt đầu chiếu quá thời gian quy định (VD: 15 phút).
- Ghế được chọn phải có trạng thái `AVAILABLE`.
- Số lượng ghế chọn không vượt quá giới hạn mỗi lượt mua.

## 3. Logic chống oversell ghế ngồi bằng Redis

Oversell (đặt trùng ghế) xảy ra khi 2 người cùng click chọn 1 ghế trống cùng một mili-giây.

Logic xử lý (phải atomic):

1. Hệ thống lưu trạng thái sơ đồ ghế của suất chiếu trong Redis. VD hash: `seat_status:{showtimeId}` có key là `seatId`, value là `AVAILABLE`, `LOCKED`, `SOLD`.
2. Khi người dùng xác nhận chọn ghế, backend gọi Redis Lua Script để kiểm tra và lock.
3. Redis kiểm tra trạng thái tất cả ghế yêu cầu.
4. Nếu TẤT CẢ đều `AVAILABLE`, Redis cập nhật thành `LOCKED` và gắn TTL.
5. Nếu CÓ BẤT KỲ ghế nào không `AVAILABLE`, Redis rollback, không cập nhật ghế nào và trả về lỗi.

Pseudo logic:

```lua
-- Lua script
for _, seatId in ipairs(requestedSeats) do
    if redis.hget(seatStatusKey, seatId) ~= 'AVAILABLE' then
        return 'SEAT_UNAVAILABLE'
    end
end

for _, seatId in ipairs(requestedSeats) do
    redis.hset(seatStatusKey, seatId, 'LOCKED')
    -- Có thể lưu thêm bookingId vào một key riêng để expire (nhả ghế)
end
return 'SUCCESS'
```

## 4. Logic nhả ghế khi thanh toán thất bại/hết hạn

Khi người dùng không thanh toán, hệ thống phải nhả ghế để người khác mua.

Luồng xử lý:

1. Booking session có trạng thái `pending`.
2. Nếu quá thời gian TTL mà chưa thanh toán, hoặc cổng thanh toán trả về `failed`.
3. Backend hoặc worker/Redis Keyspace Notification sẽ trigger việc nhả ghế.
4. Cập nhật lại trạng thái các ghế trong Redis `seat_status:{showtimeId}` từ `LOCKED` về `AVAILABLE`.
5. Đổi trạng thái booking session thành `expired` hoặc `failed`.

## 5. Logic xử lý thanh toán thành công

Sau khi thanh toán thành công, hệ thống chuyển ghế từ trạng thái `LOCKED` sang `SOLD`.

Luồng xử lý:

1. Cổng thanh toán gửi webhook về backend.
2. Backend xác thực chữ ký callback.
3. Backend kiểm tra booking session còn hợp lệ và trạng thái thanh toán.
4. Backend cập nhật trạng thái các ghế trong Redis thành `SOLD`.
5. Backend gửi message vào SQS.
6. Worker đọc message từ SQS.
7. Worker tạo order, payment record và thông tin vé/ghế vào database MySQL/Postgres.
8. Worker tạo QR Code.
9. Worker gửi email vé cho người dùng.

## 6. Logic idempotency

Idempotency giúp tránh tạo trùng đơn hàng hoặc thanh toán 2 lần.

Các vị trí cần idempotency:

- Webhook xác nhận thanh toán.
- Worker tạo order từ queue.
- Quét QR check-in vào rạp.

Cách xử lý:

- Mỗi booking session có `bookingSessionId`.
- Mỗi payment có `paymentTransactionId` (unique).
- Khi worker xử lý order, kiểm tra order có tồn tại với `paymentTransactionId` này chưa.

## 7. Logic tạo vé và QR Code

Sau khi order được tạo, tạo vé điện tử.

Luồng xử lý:

1. Worker lấy thông tin order (rạp, suất chiếu, danh sách ghế ngồi, bắp nước).
2. Tạo `ticketId` tổng hợp hoặc từng `ticketId` cho từng ghế (tuỳ nghiệp vụ rạp). Thường rạp gộp chung vào 1 QR code cho toàn bộ đơn hàng.
3. Tạo ticket token có chữ ký.
4. QR Code được tạo từ ticket token.
5. Ticket được lưu vào DB với trạng thái `valid`.

## 8. Logic check-in (Soát vé vào rạp)

1. Nhân viên quét QR Code của khách tại cửa rạp.
2. App gửi ticket token về backend.
3. Backend kiểm tra chữ ký token.
4. Backend tìm vé trong DB.
5. Kiểm tra vé có thuộc đúng rạp và đúng suất chiếu (thời gian) không.
6. Nếu vé hợp lệ và trạng thái `valid`, cập nhật thành `checked_in`. Khách được vào rạp.
7. Nếu trạng thái là `checked_in`, báo lỗi "Vé đã được sử dụng".

## 9. Logic xử lý lỗi

- Khách chọn ghế đã bị người khác chọn: Trả lỗi "Ghế đã có người đặt, vui lòng chọn ghế khác".
- Hết thời gian thanh toán: Tự động nhả ghế, báo lỗi "Hết hạn thanh toán".
- Webhook thanh toán đến trễ: Nếu ghế đã bị nhả và bán cho người khác, phải tiến hành lưu đơn hàng trạng thái CẦN HOÀN TIỀN (Refund) cho khách.
- Database/Redis timeout: Retry hoặc báo lỗi hệ thống.

## 10. Logic bảo mật

- Mật khẩu phải hash.
- Webhook payment phải verify signature.
- QR token phải có chữ ký số để tránh tự tạo QR giả.
- Không lưu thông tin thẻ trên DB.
