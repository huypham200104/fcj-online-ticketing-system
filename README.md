# FCJ Online Ticketing System

Demo web đặt vé phim/concert với luồng mua vé, giữ ghế, thanh toán mock, QR ticket, admin portal và staff check-in.

## Chạy local

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend mặc định chạy tại `http://localhost:3002/api`.

### Frontend

```bash
cd web
npm install
npm run dev
```

Frontend mặc định chạy tại `http://localhost:5173`.

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Customer | `customer@cinematicpulse.vn` | `password123` |
| Admin | `admin@cinematicpulse.vn` | `password123` |
| Staff | `staff@cinematicpulse.vn` | `password123` |

## Luồng demo đề xuất

1. Mở `/` để xem trang public phim và concert.
2. Vào danh sách phim, thử lọc theo thành phố, ngày, định dạng và giá tối đa.
3. Chọn phim, chọn rạp, suất chiếu và ghế.
4. Thêm combo bắp nước, nhập mã `DEMO10` hoặc `STUDENT50`, giữ ghế rồi thanh toán.
5. Mở vé QR trong "Vé của tôi".
6. Đăng nhập staff và vào "Soát vé QR" để check-in vé.
7. Đăng nhập admin để xem dashboard, đơn hàng, người dùng, báo cáo và audit log.

## Ghi chú demo

- Dữ liệu hiện dùng mock/in-memory repository, restart backend sẽ quay về dữ liệu seed.
- Thanh toán là mock payment, có xác suất thất bại để demo luồng lỗi.
- Combo bắp nước và voucher đang được tính vào tổng tiền checkout cho demo, chưa lưu thành line-item riêng trong backend.
- Nếu bật gửi email, cấu hình SMTP trong `backend/.env` theo `backend/.env.example`.
