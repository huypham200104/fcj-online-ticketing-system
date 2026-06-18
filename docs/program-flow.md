# Flow chương trình

## 1. Flow tổng quan

```mermaid
flowchart TD
    A[Người dùng truy cập website/app] --> B[Xem hoặc tìm kiếm sự kiện]
    B --> C[Xem chi tiết sự kiện]
    C --> D[Chọn loại vé và số lượng vé]
    D --> E[Tạo booking session]
    E --> F{Redis còn vé không?}
    F -- Không --> G[Thông báo hết vé]
    F -- Có --> H[Giữ vé tạm và tạo phiên thanh toán]
    H --> I[Người dùng thanh toán]
    I --> J{Thanh toán thành công?}
    J -- Không --> K[Hủy session và hoàn vé]
    J -- Có --> L[Đưa đơn hàng vào SQS]
    L --> M[Worker xử lý đơn hàng]
    M --> N[Lưu order và ticket vào database]
    N --> O[Tạo QR Code]
    O --> P[Gửi email hoặc thông báo]
    P --> Q[Người dùng nhận vé]
    Q --> R[Check-in tại cổng sự kiện]
```

## 2. Flow đăng ký và đăng nhập

```mermaid
flowchart TD
    A[Người dùng mở trang đăng nhập] --> B{Đã có tài khoản?}
    B -- Chưa có --> C[Nhập thông tin đăng ký]
    C --> D[Backend kiểm tra email đã tồn tại]
    D --> E{Email hợp lệ?}
    E -- Không --> F[Trả lỗi đăng ký]
    E -- Có --> G[Tạo tài khoản]
    G --> H[Gửi phản hồi đăng ký thành công]
    B -- Đã có --> I[Nhập email và mật khẩu]
    I --> J[Backend kiểm tra thông tin]
    J --> K{Thông tin đúng?}
    K -- Không --> L[Trả lỗi đăng nhập]
    K -- Có --> M[Tạo access token]
    M --> N[Frontend lưu token]
    N --> O[Chuyển vào hệ thống]
```

## 3. Flow xem và tìm kiếm sự kiện

```mermaid
flowchart TD
    A[Người dùng mở trang sự kiện] --> B[Frontend gọi API danh sách sự kiện]
    B --> C[Backend nhận query tìm kiếm và bộ lọc]
    C --> D[Truy vấn database hoặc cache]
    D --> E[Trả danh sách sự kiện]
    E --> F[Frontend hiển thị kết quả]
    F --> G[Người dùng chọn một sự kiện]
    G --> H[Frontend gọi API chi tiết sự kiện]
    H --> I[Backend trả thông tin sự kiện và loại vé]
    I --> J[Frontend hiển thị trang chi tiết]
```

## 4. Flow đặt vé

```mermaid
sequenceDiagram
    participant User as Người dùng
    participant FE as Frontend
    participant API as API Gateway/Backend
    participant Redis as Redis
    participant Session as DynamoDB Session

    User->>FE: Chọn loại vé và số lượng
    FE->>API: Gửi request tạo booking session
    API->>Redis: Kiểm tra và trừ vé tạm
    alt Không đủ vé
        Redis-->>API: Trả lỗi hết vé
        API-->>FE: Thông báo không đủ vé
        FE-->>User: Hiển thị hết vé
    else Còn vé
        Redis-->>API: Trừ vé thành công
        API->>Session: Lưu booking session có TTL
        Session-->>API: Lưu thành công
        API-->>FE: Trả booking session và thời hạn thanh toán
        FE-->>User: Chuyển sang màn hình thanh toán
    end
```

## 5. Flow thanh toán thành công

```mermaid
sequenceDiagram
    participant User as Người dùng
    participant Payment as Cổng thanh toán
    participant API as Backend
    participant SQS as SQS
    participant Worker as Lambda Worker
    participant DB as RDS/Aurora
    participant S3 as S3
    participant Email as SES/SNS

    User->>Payment: Thanh toán đơn hàng
    Payment->>API: Gửi kết quả thanh toán thành công
    API->>API: Xác thực webhook/payment callback
    API->>SQS: Đưa message tạo đơn hàng
    SQS-->>Worker: Worker nhận message
    Worker->>DB: Tạo order, payment và ticket
    Worker->>S3: Lưu QR Code
    Worker->>Email: Gửi email/thông báo vé
    Worker-->>SQS: Xóa message sau khi xử lý thành công
```

## 6. Flow thanh toán thất bại hoặc hết hạn

```mermaid
flowchart TD
    A[Booking session được tạo] --> B[Đếm ngược thời gian thanh toán]
    B --> C{Người dùng thanh toán kịp?}
    C -- Có nhưng thất bại --> D[Nhận trạng thái payment failed]
    C -- Không --> E[Session hết TTL]
    D --> F[Đánh dấu session failed]
    E --> G[Job xử lý session hết hạn]
    F --> H[Hoàn số lượng vé vào Redis]
    G --> H
    H --> I[Vé được mở bán lại]
    I --> J[Không tạo order chính thức]
```

## 7. Flow check-in bằng QR Code

```mermaid
sequenceDiagram
    participant Staff as Nhân viên
    participant App as App check-in
    participant API as Backend
    participant DB as RDS/Aurora

    Staff->>App: Quét QR Code
    App->>API: Gửi ticket token
    API->>API: Kiểm tra chữ ký/token
    API->>DB: Tìm vé theo ticket ID
    DB-->>API: Trả thông tin vé
    alt Vé không tồn tại
        API-->>App: Báo vé không hợp lệ
    else Vé đã check-in
        API-->>App: Báo vé đã sử dụng
    else Vé hợp lệ
        API->>DB: Cập nhật trạng thái checked-in
        API-->>App: Báo check-in thành công
    end
```

## 8. Flow admin quản lý sự kiện

```mermaid
flowchart TD
    A[Admin đăng nhập] --> B[Truy cập dashboard]
    B --> C[Tạo hoặc cập nhật sự kiện]
    C --> D[Nhập thông tin sự kiện]
    D --> E[Tạo loại vé và số lượng]
    E --> F[Lưu vào database]
    F --> G[Đồng bộ số lượng vé ban đầu vào Redis]
    G --> H[Publish sự kiện]
    H --> I[Người dùng có thể đặt vé]
```

## 9. Flow xử lý lỗi trong queue

```mermaid
flowchart TD
    A[SQS có message đơn hàng] --> B[Worker nhận message]
    B --> C[Xử lý tạo order và ticket]
    C --> D{Xử lý thành công?}
    D -- Có --> E[Xóa message khỏi queue]
    D -- Không --> F[SQS retry theo cấu hình]
    F --> G{Vượt số lần retry?}
    G -- Không --> B
    G -- Có --> H[Đưa message vào Dead-Letter Queue]
    H --> I[Gửi cảnh báo CloudWatch/SNS]
    I --> J[Admin/DevOps kiểm tra và xử lý thủ công]
```

