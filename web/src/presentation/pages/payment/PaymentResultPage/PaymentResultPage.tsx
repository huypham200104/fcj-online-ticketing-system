import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '@/presentation/components/ui/Badge';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { ROUTES, routePaths } from '@/presentation/router/routes';
import './PaymentResultPage.css';

interface PaymentResultPageProps {
  status: 'success' | 'failed';
}

const reasonText: Record<string, string> = {
  payment_failed: 'Thanh toán bị từ chối. Phiên giữ vé đã được giải phóng.',
  session_expired: 'Phiên giữ vé đã hết hạn. Vé đã được mở bán lại cho người khác.',
  session_not_found: 'Không tìm thấy phiên giữ vé để xác nhận.',
};

export const PaymentResultPage: React.FC<PaymentResultPageProps> = ({ status }) => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId') ?? '';
  const ticketId = searchParams.get('ticketId') ?? '';
  const reason = searchParams.get('reason') ?? 'payment_failed';
  const isSuccess = status === 'success';

  return (
    <MainLayout contentClassName="payment-result">
      <section className={`payment-result__card payment-result__card--${status}`}>
        <Badge tone={isSuccess ? 'success' : 'error'}>{isSuccess ? 'Success' : 'Failed'}</Badge>
        <h1>{isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}</h1>
        <p>
          {isSuccess
            ? 'Đơn hàng đã được xử lý bằng mock payment. Vé QR đã được tạo và lưu vào danh sách vé của bạn.'
            : reasonText[reason] ?? 'Giao dịch chưa hoàn tất. Vui lòng thử lại với phiên giữ vé mới.'}
        </p>

        {sessionId ? (
          <div className="payment-result__meta">
            <span>Booking session</span>
            <strong>{sessionId}</strong>
          </div>
        ) : null}

        <div className="payment-result__actions">
          {isSuccess && ticketId ? (
            <Link to={routePaths.ticketDetail(ticketId)}>Xem vé QR</Link>
          ) : null}
          <Link to={isSuccess ? ROUTES.MY_TICKETS : ROUTES.EVENTS}>
            {isSuccess ? 'Về vé của tôi' : 'Đặt lại vé'}
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};

