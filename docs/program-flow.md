# Flow chương trình

## 1. Flow tổng quan

```mermaid
flowchart TD
    A[Người dùng truy cập website/app] --> B[Xem phim đang chiếu/sắp chiếu]
    B --> C[Xem chi tiết phim, lịch chiếu]
    C --> D[Chọn suất chiếu và rạp]
    D --> E[Chọn ghế ngồi trên sơ đồ]
    E --> F[Tạo booking session (Lock ghế)]
    F --> G{Redis lock ghế thành công?}
    G -- Không --> H[Báo lỗi: Ghế đã có người đặt]
    G -- Có --> I[Tạo phiên thanh toán có Countdown]
    I --> J[Người dùng thanh toán]
    J --> K{Thanh toán thành công?}
    K -- Không --> L[Hết giờ/Lỗi: Nhả ghế về trống]
    K -- Có --> M[Đưa đơn hàng vào SQS]
    M --> N[Worker cập nhật ghế thành Đã Bán]
    N --> O[Lưu order và ticket vào database]
    O --> P[Tạo QR Code vé phim]
    P --> Q[Gửi email vé]
    Q --> R[Người dùng ra rạp, quét QR để check-in]
```

## 2. Flow đặt vé và chọn ghế

```mermaid
sequenceDiagram
    participant User as Người dùng
    participant FE as Frontend
    participant API as Backend
    participant Redis as Redis
    participant DB as Database/DynamoDB

    User->>FE: Chọn suất chiếu & chọn ghế
    FE->>API: Gửi request lock ghế
    API->>Redis: Kiểm tra trạng thái ghế
    alt Ghế không trống
        Redis-->>API: Trả lỗi (Ghế bị lock/sold)
        API-->>FE: Thông báo ghế đã bị đặt
        FE-->>User: Hiển thị lại sơ đồ ghế
    else Ghế trống
        Redis->>Redis: Atomic update status = LOCKED
        Redis-->>API: Lock thành công
        API->>DB: Lưu booking session (có TTL)
        API-->>FE: Trả booking session & Thời gian thanh toán
        FE-->>User: Chuyển màn hình thanh toán
    end
```

## 3. Flow thanh toán và chốt ghế

```mermaid
sequenceDiagram
    participant User as Người dùng
    participant Payment as Cổng thanh toán
    participant API as Backend
    participant Redis as Redis
    participant SQS as SQS
    participant Worker as Worker
    participant DB as Database

    User->>Payment: Thanh toán
    Payment->>API: Webhook: Thanh toán thành công
    API->>API: Xác thực Webhook
    API->>Redis: Cập nhật ghế = SOLD
    API->>SQS: Gửi message tạo đơn hàng
    SQS-->>Worker: Kéo message
    Worker->>DB: Lưu Order, Ticket, OrderItems (Ghế, Bắp nước)
    Worker->>Worker: Tạo QR Code
    Worker-->>SQS: Xoá message
```

## 4. Flow thanh toán thất bại / Hết hạn

```mermaid
flowchart TD
    A[Lock ghế thành công, bắt đầu đếm ngược] --> B{Thanh toán kịp thời?}
    B -- Có nhưng báo lỗi --> C[Đánh dấu session Failed]
    B -- Hết 10 phút --> D[Session Timeout]
    C --> E[Trigger nhả ghế]
    D --> E
    E --> F[Cập nhật trạng thái ghế trong Redis = AVAILABLE]
    F --> G[Ghế hiện lại trên sơ đồ cho người khác đặt]
```

## 5. Flow check-in tại rạp

```mermaid
sequenceDiagram
    participant Staff as Nhân viên rạp
    participant App as App quét QR
    participant API as Backend
    participant DB as Database

    Staff->>App: Quét QR Code vé của khách
    App->>API: Gửi token/thông tin vé
    API->>API: Verify Signature
    API->>DB: Lấy thông tin vé & Suất chiếu
    alt Vé không tồn tại
        API-->>App: Lỗi: Vé không hợp lệ
    else Vé khác suất chiếu / rạp
        API-->>App: Lỗi: Sai rạp hoặc suất chiếu
    else Vé đã check-in
        API-->>App: Lỗi: Vé đã sử dụng
    else Hợp lệ
        API->>DB: Update trạng thái = Checked-in
        API-->>App: Success: Hiển thị (Phim, Phòng, Tên Ghế)
    end
```
