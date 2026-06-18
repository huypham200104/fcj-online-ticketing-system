# Ticket Booking System - Backend

Node.js Express backend cho hệ thống đặt vé sự kiện trực tuyến.

## Cài đặt

### Yêu cầu
- Node.js v16 hoặc cao hơn
- npm hoặc yarn

### Các bước cài đặt

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Tạo file .env:**
```bash
cp .env.example .env
```

3. **Chạy server:**
```bash
# Chế độ production
npm start

# Chế độ development (auto reload)
npm run dev
```

Server sẽ chạy trên `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /api/health` - Kiểm tra trạng thái server

### Events API
- `GET /api/events` - Lấy danh sách tất cả sự kiện
- `GET /api/events/:id` - Lấy chi tiết sự kiện
- `GET /api/events/search/by-location?location=...` - Tìm kiếm sự kiện theo địa điểm

### Tickets API
- `POST /api/tickets/reserve` - Giữ vé tạm thời
  ```json
  {
    "eventId": 1,
    "ticketTypeId": 1,
    "quantity": 2,
    "userId": 1
  }
  ```

- `POST /api/tickets/confirm/:reservationId` - Xác nhận đặt vé sau thanh toán
- `GET /api/tickets/:ticketId` - Lấy chi tiết vé
- `GET /api/tickets/user/:userId` - Lấy danh sách vé của user
- `POST /api/tickets/check-in/:ticketId` - Check-in vé (quét QR)

### Users API
- `POST /api/users/register` - Đăng ký tài khoản
  ```json
  {
    "email": "user@example.com",
    "name": "John Doe",
    "password": "password123",
    "passwordConfirm": "password123"
  }
  ```

- `POST /api/users/login` - Đăng nhập
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `GET /api/users` - Lấy danh sách tất cả users (tạm)
- `GET /api/users/:userId` - Lấy thông tin user

## Cấu trúc dự án

```
backend/
├── src/
│   ├── routes/
│   │   ├── events.js      - API cho sự kiện
│   │   ├── tickets.js     - API cho vé
│   │   └── users.js       - API cho người dùng
│   └── index.js           - Server chính
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Tính năng hiện tại

✅ Mock data cho sự kiện
✅ API lấy danh sách sự kiện
✅ API tìm kiếm sự kiện
✅ API giữ vé tạm thời
✅ API xác nhận đơn hàng
✅ API check-in vé
✅ API đăng ký/đăng nhập user
✅ Error handling cơ bản
✅ CORS enabled

## Phát triển tiếp theo

⚠️ Cần thêm:
- Database (MySQL/PostgreSQL)
- JWT Authentication
- Input validation (joi/zod)
- Logging system
- Rate limiting
- Redis caching
- Payment gateway integration
- Email service (SES)
- QR code generation
- Unit tests
- API documentation (Swagger)

## Chạy thử API

### Sử dụng cURL

```bash
# Health check
curl http://localhost:3001/api/health

# Lấy tất cả sự kiện
curl http://localhost:3001/api/events

# Lấy sự kiện với ID = 1
curl http://localhost:3001/api/events/1

# Tìm sự kiện ở Hà Nội
curl "http://localhost:3001/api/events/search/by-location?location=Hà%20Nội"

# Đăng ký user
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123",
    "passwordConfirm": "password123"
  }'

# Giữ vé
curl -X POST http://localhost:3001/api/tickets/reserve \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "ticketTypeId": 1,
    "quantity": 2,
    "userId": 1
  }'
```

### Sử dụng Postman

Import các endpoints trên vào Postman hoặc Thunder Client để test.

## License

ISC
