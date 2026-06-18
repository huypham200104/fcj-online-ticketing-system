# Công nghệ nên dùng

## 1. Frontend web

Các lựa chọn phù hợp:

- **React.js hoặc Next.js:** phù hợp để xây dựng giao diện web hiện đại, dễ chia component và có hệ sinh thái mạnh.
- **TypeScript:** giúp code rõ ràng hơn, giảm lỗi khi làm việc với dữ liệu API.
- **Tailwind CSS:** xây dựng UI nhanh, dễ responsive và phù hợp cho dashboard/admin.
- **React Query hoặc SWR:** quản lý server state, cache dữ liệu sự kiện và đơn hàng.
- **Zustand hoặc Redux Toolkit:** quản lý state client như giỏ vé, thông tin phiên đặt vé và trạng thái đăng nhập.

Đề xuất:

- Nếu muốn làm nhanh và dễ deploy: dùng **React.js + Vite**.
- Nếu muốn dự án chuyên nghiệp hơn, hỗ trợ SEO cho trang sự kiện: dùng **Next.js + TypeScript**.

## 2. Mobile app

Các lựa chọn phù hợp:

- **Flutter:** xây dựng app Android/iOS từ một codebase, UI ổn định và phù hợp cho app check-in.
- **React Native:** phù hợp nếu team đã quen React.

Đề xuất:

- Nếu chỉ cần web responsive trước, có thể chưa làm mobile app.
- Nếu cần app check-in riêng cho nhân viên, nên dùng **Flutter** hoặc một web app mobile-first có camera scanner.

## 3. Backend

Các lựa chọn phù hợp:

- **Node.js + NestJS:** kiến trúc rõ ràng, phù hợp API lớn, hỗ trợ TypeScript tốt.
- **Node.js + Express:** dễ học, dễ làm MVP, nhưng cần tự tổ chức structure kỹ.
- **Java Spring Boot:** mạnh cho hệ thống enterprise, transaction tốt, nhưng triển khai nặng hơn.
- **Python FastAPI:** nhanh, dễ viết API, phù hợp MVP và service nhỏ.

Đề xuất:

- Với dự án portfolio/cloud: dùng **Node.js + NestJS + TypeScript** để có structure rõ ràng.
- Với serverless AWS: có thể dùng **AWS Lambda + Node.js/TypeScript**.

## 4. Database chính

Các lựa chọn phù hợp:

- **Amazon RDS MySQL:** dễ dùng, phù hợp dữ liệu quan hệ như user, event, ticket, order và payment.
- **Amazon Aurora MySQL:** hiệu năng và khả năng mở rộng tốt hơn RDS MySQL, phù hợp nếu muốn mô phỏng hệ thống production.
- **PostgreSQL:** mạnh về dữ liệu quan hệ, constraint và query phức tạp.

Đề xuất:

- Dùng **MySQL hoặc PostgreSQL** ở môi trường local.
- Dùng **Amazon RDS MySQL hoặc Aurora MySQL** khi deploy lên AWS.

## 5. Cache và kiểm soát vé

Công nghệ đề xuất:

- **Redis:** lưu số lượng vé còn lại, giữ vé tạm và xử lý thao tác atomic để chống oversell.
- **Amazon ElastiCache Redis:** phiên bản Redis managed trên AWS.

Redis nên dùng cho:

- Kiểm tra số vé còn lại.
- Trừ vé tạm thời khi người dùng tạo booking session.
- Hoàn vé nếu thanh toán thất bại hoặc session hết hạn.
- Giảm tải truy vấn vào database.

## 6. Queue và xử lý bất đồng bộ

Công nghệ đề xuất:

- **Amazon SQS:** hàng đợi xử lý đơn hàng sau khi thanh toán thành công.
- **AWS Lambda Worker:** đọc message từ SQS và ghi order/ticket vào database.
- **Dead-Letter Queue:** lưu message lỗi sau nhiều lần retry.

Queue nên dùng cho:

- Xử lý đơn hàng.
- Tạo vé và QR Code.
- Gửi email xác nhận.
- Retry khi database hoặc service phụ bị lỗi tạm thời.

## 7. Lưu phiên đặt vé tạm thời

Công nghệ đề xuất:

- **Amazon DynamoDB:** lưu booking session tạm thời.
- **TTL của DynamoDB:** tự động xóa session hết hạn.

DynamoDB phù hợp vì:

- Tốc độ cao.
- Không cần quản lý server.
- Dễ lưu dữ liệu tạm theo key-value.
- Có cơ chế TTL cho phiên giữ vé.

## 8. Thanh toán

Các lựa chọn phù hợp:

- **Stripe:** phổ biến, tài liệu tốt, dễ tích hợp môi trường test.
- **PayPal:** phù hợp nếu cần thanh toán quốc tế.
- **VNPay, MoMo, ZaloPay:** phù hợp thị trường Việt Nam.
- **Mock payment:** phù hợp cho giai đoạn demo hoặc portfolio.

Đề xuất:

- Giai đoạn MVP: dùng **mock payment** để hoàn thiện flow.
- Giai đoạn nâng cấp: tích hợp **Stripe test mode** hoặc **VNPay sandbox**.

## 9. QR Code và check-in

Công nghệ đề xuất:

- **QRCode library:** tạo mã QR từ ticket token.
- **JWT hoặc signed token:** tránh QR bị giả mạo.
- **Camera scanner library:** quét QR trên web/mobile.

QR Code nên chứa:

- Ticket ID.
- Event ID.
- Mã xác thực hoặc chữ ký số.
- Thời gian tạo hoặc metadata cần thiết.

Không nên đưa trực tiếp thông tin nhạy cảm vào QR Code.

## 10. Cloud và hạ tầng AWS

Dịch vụ AWS đề xuất:

- **Amazon S3:** lưu frontend, ảnh sự kiện và QR Code.
- **Amazon CloudFront:** CDN phân phối frontend và tài nguyên tĩnh.
- **Amazon API Gateway:** cổng API cho frontend.
- **AWS Lambda:** xử lý logic backend theo hướng serverless.
- **Amazon RDS/Aurora:** lưu dữ liệu chính.
- **Amazon ElastiCache Redis:** chống oversell và cache.
- **Amazon SQS:** hàng đợi xử lý đơn hàng.
- **Amazon DynamoDB:** lưu booking session tạm.
- **Amazon SES:** gửi email vé.
- **Amazon SNS:** gửi thông báo hoặc cảnh báo.
- **Amazon CloudWatch:** logging, metrics và alarms.
- **AWS Global Accelerator:** tối ưu truy cập và hỗ trợ multi-region failover.

## 11. DevOps và công cụ hỗ trợ

Công nghệ đề xuất:

- **Docker:** đóng gói backend và database local.
- **Terraform hoặc AWS CDK:** quản lý hạ tầng bằng code.
- **GitHub Actions:** CI/CD tự động test và deploy.
- **Postman hoặc Bruno:** test API.
- **k6 hoặc Artillery:** load test API đặt vé.
- **ESLint + Prettier:** chuẩn hóa code.
- **Jest hoặc Vitest:** unit test.
- **Playwright hoặc Cypress:** end-to-end test.

## 12. Stack đề xuất cuối cùng

Stack cân bằng giữa học tập, demo và tính thực tế:

- **Frontend:** Next.js, TypeScript, Tailwind CSS.
- **Backend:** NestJS hoặc AWS Lambda Node.js/TypeScript.
- **Database:** MySQL/PostgreSQL local, Amazon RDS/Aurora khi deploy.
- **Cache:** Redis, Amazon ElastiCache Redis.
- **Queue:** Amazon SQS.
- **Temporary session:** Amazon DynamoDB.
- **Storage:** Amazon S3.
- **CDN:** Amazon CloudFront.
- **Auth:** Amazon Cognito hoặc JWT custom.
- **Monitoring:** Amazon CloudWatch.
- **Infrastructure as Code:** Terraform hoặc AWS CDK.

