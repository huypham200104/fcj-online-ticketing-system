# Logic trong chương trình

## 1. Logic phân quyền

Hệ thống có 3 nhóm quyền chính:

- **User:** xem sự kiện, đặt vé, thanh toán, xem vé đã mua.
- **Admin:** quản lý sự kiện, loại vé, đơn hàng, người dùng và báo cáo.
- **Check-in staff:** quét QR Code và xác nhận check-in.

Logic kiểm tra quyền:

1. Người dùng đăng nhập và nhận access token.
2. Frontend gửi token trong mỗi request cần xác thực.
3. Backend kiểm tra token.
4. Backend lấy role của người dùng.
5. Backend chỉ cho phép truy cập API nếu role phù hợp.

Ví dụ:

- API tạo sự kiện chỉ cho `admin`.
- API đặt vé chỉ cho `user`.
- API check-in chỉ cho `check-in staff` hoặc `admin`.

## 2. Logic tạo booking session

Booking session là phiên giữ vé tạm thời trong lúc người dùng thanh toán.

Luồng xử lý:

1. Người dùng chọn event, ticket type và số lượng vé.
2. Backend kiểm tra sự kiện có đang mở bán không.
3. Backend kiểm tra số lượng vé yêu cầu có vượt giới hạn mỗi người không.
4. Backend gọi Redis để trừ vé tạm.
5. Nếu Redis báo không đủ vé, backend trả lỗi.
6. Nếu Redis trừ vé thành công, backend tạo booking session.
7. Booking session được lưu với thời gian hết hạn, ví dụ 10 phút.
8. Frontend hiển thị countdown thanh toán.

Điều kiện hợp lệ:

- Event phải ở trạng thái `published`.
- Ticket type phải đang mở bán.
- Số lượng vé phải lớn hơn 0.
- Số lượng vé phải nhỏ hơn hoặc bằng giới hạn cho phép.
- Redis phải còn đủ vé.

## 3. Logic chống oversell bằng Redis

Oversell xảy ra khi hệ thống bán nhiều vé hơn số lượng thực tế. Để tránh lỗi này, hệ thống không trừ vé trực tiếp trong database ở bước đầu mà dùng Redis để xử lý nhanh và atomic.

Logic đề xuất:

1. Mỗi loại vé có một key trong Redis, ví dụ `ticket_stock:{ticketTypeId}`.
2. Khi người dùng đặt vé, backend chạy một thao tác atomic trong Redis.
3. Redis kiểm tra số vé hiện tại.
4. Nếu số vé còn lại lớn hơn hoặc bằng số vé cần mua, Redis trừ số lượng.
5. Nếu không đủ vé, Redis không trừ và trả lỗi.
6. Backend chỉ cho người dùng thanh toán nếu Redis trừ thành công.

Pseudo logic:

```text
currentStock = redis.get(ticketStockKey)

if currentStock < requestedQuantity:
    return SOLD_OUT

redis.decrBy(ticketStockKey, requestedQuantity)
return RESERVED
```

Trong thực tế, phần kiểm tra và trừ vé nên chạy bằng Lua script hoặc Redis transaction để đảm bảo atomic.

## 4. Logic hoàn vé khi thanh toán thất bại

Khi người dùng không thanh toán hoặc thanh toán thất bại, vé đang giữ tạm phải được trả lại.

Luồng xử lý:

1. Booking session có trạng thái `pending`.
2. Nếu payment callback trả về thất bại, session chuyển sang `failed`.
3. Nếu quá thời gian TTL mà chưa thanh toán, session chuyển sang `expired`.
4. Backend hoặc scheduled worker cộng lại số vé vào Redis.
5. Hệ thống không tạo order chính thức.
6. Người dùng có thể tạo booking session mới nếu muốn mua lại.

Điều kiện quan trọng:

- Mỗi session chỉ được hoàn vé một lần.
- Cần lưu trạng thái để tránh cộng vé nhiều lần.
- Có thể dùng field `releasedAt` hoặc `isReleased` để đánh dấu đã hoàn vé.

## 5. Logic xử lý thanh toán thành công

Sau khi thanh toán thành công, hệ thống không nên xử lý toàn bộ trong request callback nếu flow phức tạp. Thay vào đó, backend đưa đơn hàng vào queue.

Luồng xử lý:

1. Cổng thanh toán gửi callback/webhook về backend.
2. Backend xác thực chữ ký callback.
3. Backend kiểm tra booking session còn hợp lệ.
4. Backend kiểm tra payment chưa được xử lý trước đó.
5. Backend cập nhật session thành `paid`.
6. Backend gửi message vào SQS.
7. Worker đọc message từ SQS.
8. Worker tạo order, payment record và ticket trong database.
9. Worker tạo QR Code.
10. Worker gửi email hoặc thông báo cho người dùng.

Điều kiện quan trọng:

- Payment callback phải idempotent.
- Một payment chỉ được tạo order một lần.
- Nếu worker lỗi, SQS retry.
- Nếu retry nhiều lần vẫn lỗi, message chuyển vào dead-letter queue.

## 6. Logic idempotency

Idempotency giúp tránh tạo trùng đơn hàng khi webhook thanh toán bị gửi nhiều lần hoặc người dùng bấm lại request.

Các vị trí cần idempotency:

- Tạo booking session.
- Xác nhận thanh toán.
- Tạo order từ queue.
- Check-in vé.

Cách xử lý:

- Mỗi booking session có `bookingSessionId`.
- Mỗi payment có `paymentTransactionId`.
- Mỗi message SQS có `orderRequestId`.
- Database đặt unique constraint cho các ID quan trọng.
- Trước khi tạo order, worker kiểm tra order đã tồn tại chưa.

Ví dụ:

```text
if order exists by paymentTransactionId:
    return existing order

create new order
```

## 7. Logic tạo vé và QR Code

Sau khi order được tạo thành công, hệ thống tạo vé điện tử.

Luồng xử lý:

1. Worker lấy thông tin order.
2. Với mỗi vé trong order, hệ thống tạo `ticketId`.
3. Hệ thống tạo ticket token có chữ ký.
4. QR Code được tạo từ ticket token hoặc URL check-in.
5. QR Code được lưu vào S3 hoặc tạo động khi người dùng mở vé.
6. Ticket được lưu vào database với trạng thái `valid`.

Ticket token nên chứa:

- Ticket ID.
- Event ID.
- User ID hoặc order ID.
- Thời điểm phát hành.
- Chữ ký để chống giả mạo.

Không nên chứa:

- Mật khẩu.
- Thông tin thẻ thanh toán.
- Dữ liệu cá nhân nhạy cảm.

## 8. Logic check-in

Check-in cần đảm bảo một vé chỉ được sử dụng một lần.

Luồng xử lý:

1. Nhân viên quét QR Code.
2. App gửi ticket token về backend.
3. Backend kiểm tra chữ ký token.
4. Backend tìm ticket trong database.
5. Backend kiểm tra vé có thuộc đúng sự kiện không.
6. Backend kiểm tra trạng thái vé.
7. Nếu vé đang `valid`, backend cập nhật thành `checked_in`.
8. Nếu vé đã `checked_in`, backend trả lỗi vé đã sử dụng.
9. Nếu vé `cancelled` hoặc `expired`, backend trả lỗi vé không hợp lệ.

Điều kiện quan trọng:

- Cập nhật trạng thái check-in phải atomic.
- Nên dùng điều kiện update: chỉ update nếu status hiện tại là `valid`.
- Cần lưu `checkedInAt` và `checkedInBy`.

Pseudo logic:

```text
updated = update ticket
          set status = checked_in
          where ticketId = inputTicketId
          and status = valid

if updated == 1:
    return CHECK_IN_SUCCESS

return INVALID_OR_ALREADY_USED
```

## 9. Logic quản lý tồn kho vé

Hệ thống cần phân biệt các chỉ số:

- **Total quantity:** tổng số vé được tạo cho một loại vé.
- **Available quantity:** số vé còn có thể bán.
- **Reserved quantity:** số vé đang được giữ tạm.
- **Sold quantity:** số vé đã thanh toán thành công.
- **Checked-in quantity:** số vé đã dùng tại cổng.

Logic cập nhật:

- Khi admin tạo loại vé: set total quantity trong database và Redis.
- Khi user tạo booking session: giảm available trong Redis, tăng reserved tạm thời.
- Khi thanh toán thành công: chuyển reserved thành sold trong database.
- Khi thanh toán thất bại/hết hạn: giảm reserved và tăng lại available trong Redis.
- Khi check-in: tăng checked-in quantity.

Database nên là nguồn dữ liệu chính thức cho order và ticket. Redis là lớp xử lý nhanh cho tồn kho trong lúc đặt vé.

## 10. Logic xử lý lỗi

Các lỗi cần xử lý:

- Không đủ vé.
- Booking session hết hạn.
- Thanh toán thất bại.
- Payment callback không hợp lệ.
- Worker tạo order thất bại.
- Database timeout.
- Redis mất kết nối.
- QR Code không hợp lệ.
- Vé đã được check-in.

Cách xử lý đề xuất:

- Trả lỗi rõ ràng cho frontend.
- Ghi log chi tiết cho backend.
- Retry với lỗi tạm thời.
- Không retry với lỗi nghiệp vụ như hết vé hoặc vé đã dùng.
- Đưa message lỗi vào dead-letter queue nếu retry thất bại nhiều lần.
- Gửi cảnh báo qua CloudWatch Alarm và SNS khi lỗi vượt ngưỡng.

## 11. Logic monitoring

Hệ thống cần theo dõi các chỉ số sau:

- Số request API theo thời gian.
- Tỷ lệ lỗi 4xx và 5xx.
- Thời gian phản hồi API.
- Số booking session được tạo.
- Số booking session hết hạn.
- Số payment thành công/thất bại.
- Số message tồn trong SQS.
- Số message vào dead-letter queue.
- CPU, memory và connection của database.
- Memory và hit rate của Redis.
- Số lượt check-in thành công/thất bại.

Khi metric vượt ngưỡng, CloudWatch Alarm gửi cảnh báo để team kiểm tra.

## 12. Logic bảo mật

Các nguyên tắc bảo mật cần có:

- Mật khẩu phải được hash trước khi lưu.
- API cần xác thực bằng JWT hoặc Cognito token.
- Admin API phải kiểm tra role.
- Payment callback phải xác thực chữ ký.
- QR token phải có chữ ký để chống giả mạo.
- Không lưu thông tin thẻ thanh toán trong hệ thống.
- Sử dụng HTTPS.
- Cấu hình CORS chặt chẽ.
- Rate limit API nhạy cảm.
- IAM role trên AWS theo nguyên tắc least privilege.

