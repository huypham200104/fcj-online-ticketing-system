import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { TicketType } from '@/domain/entities/Event';
import { Badge } from '@/presentation/components/ui/Badge';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { PageState } from '@/presentation/components/shared/PageState';
import { useBookingSession } from '@/presentation/hooks/useBookingSession';
import { useCountdown } from '@/presentation/hooks/useCountdown';
import { useEventDetail } from '@/presentation/hooks/useEventDetail';
import { usePayment } from '@/presentation/hooks/usePayment';
import { ROUTES, routePaths } from '@/presentation/router/routes';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import './CheckoutPage.css';

function getPriceLabel(ticketType?: TicketType): string {
  if (!ticketType) return formatCurrency(0);
  return ticketType.price === 0 ? 'Miễn phí' : formatCurrency(ticketType.price);
}

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get('eventId') ?? undefined;
  const initialTicketTypeId = searchParams.get('ticketTypeId') ?? undefined;

  const { event, loading, error } = useEventDetail(eventId);
  const booking = useBookingSession();
  const payment = usePayment();
  const countdown = useCountdown(booking.session?.expiresAt);

  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState(initialTicketTypeId ?? '');
  const [quantity, setQuantity] = useState(1);

  const selectedTicketType = useMemo(
    () =>
      event?.ticketTypes.find((ticketType) => ticketType.id === selectedTicketTypeId) ??
      event?.ticketTypes[0],
    [event, selectedTicketTypeId],
  );

  const totalPrice = (selectedTicketType?.price ?? 0) * quantity;
  const canPay = Boolean(booking.session) && !countdown.isExpired && !payment.loading;

  const handleTicketTypeChange = (ticketTypeId: string) => {
    setSelectedTicketTypeId(ticketTypeId);
    setQuantity(1);
    booking.clearSession();
  };

  const handleReserve = async () => {
    if (!event || !selectedTicketType) return;
    await booking.createSession({
      eventId: event.id,
      ticketTypeId: selectedTicketType.id,
      quantity,
    });
  };

  const handlePayment = async (outcome: 'success' | 'failed') => {
    if (!booking.session) return;

    const result = await payment.processPayment(booking.session.id, outcome);
    if (!result) return;

    if (result.status === 'success') {
      navigate(routePaths.paymentSuccess(result.sessionId, result.ticketIds[0]));
      return;
    }

    navigate(routePaths.paymentFailed(result.sessionId, result.reason));
  };

  if (!eventId) {
    return (
      <MainLayout>
        <PageState
          variant="empty"
          title="Chưa chọn sự kiện"
          description="Hãy chọn một sự kiện trước khi tạo phiên giữ vé."
          action={<Link className="checkout-page__state-link" to={ROUTES.EVENTS}>Về danh sách sự kiện</Link>}
        />
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <PageState variant="loading" title="Đang chuẩn bị checkout" />
      </MainLayout>
    );
  }

  if (error || !event) {
    return (
      <MainLayout>
        <PageState
          variant="error"
          title="Không thể mở checkout"
          description={error ?? 'Không tìm thấy sự kiện cần đặt vé.'}
          action={<Link className="checkout-page__state-link" to={ROUTES.EVENTS}>Về danh sách sự kiện</Link>}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout contentClassName="checkout-page">
      <section className="checkout-page__heading">
        <div>
          <Badge tone="primary">Checkout</Badge>
          <h1>Đặt vé {event.title}</h1>
          <p>Chọn loại vé, số lượng và tạo phiên giữ vé trước khi thanh toán.</p>
        </div>
        <Link to={routePaths.eventDetail(event.id)}>Quay lại chi tiết</Link>
      </section>

      <section className="checkout-page__grid">
        <div className="checkout-page__panel">
          <h2>Loại vé</h2>
          <div className="checkout-page__ticket-options">
            {event.ticketTypes.map((ticketType) => (
              <button
                type="button"
                className={`checkout-ticket ${ticketType.id === selectedTicketTypeId ? 'checkout-ticket--active' : ''}`}
                key={ticketType.id}
                onClick={() => handleTicketTypeChange(ticketType.id)}
              >
                <span>
                  <strong>{ticketType.name}</strong>
                  <small>{ticketType.description}</small>
                </span>
                <em>{getPriceLabel(ticketType)}</em>
              </button>
            ))}
          </div>

          <div className="checkout-page__quantity">
            <div>
              <h2>Số lượng</h2>
              <p>Tối đa {selectedTicketType?.maxPerOrder ?? 1} vé cho mỗi phiên.</p>
            </div>
            <div className="quantity-stepper">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                -
              </button>
              <strong>{quantity}</strong>
              <button
                type="button"
                onClick={() =>
                  setQuantity((value) => Math.min(selectedTicketType?.maxPerOrder ?? 1, value + 1))
                }
              >
                +
              </button>
            </div>
          </div>

          {booking.error ? <p className="checkout-page__error">{booking.error}</p> : null}

          <button
            type="button"
            className="checkout-page__reserve"
            onClick={handleReserve}
            disabled={booking.loading || !selectedTicketType}
          >
            {booking.loading ? 'Đang giữ vé...' : 'Giữ vé tạm thời'}
          </button>
        </div>

        <aside className="checkout-summary">
          <div className="checkout-summary__header">
            <span>Tóm tắt</span>
            {booking.session ? <Badge tone={countdown.isExpired ? 'error' : 'success'}>{countdown.formatted}</Badge> : null}
          </div>

          <dl className="checkout-summary__rows">
            <div>
              <dt>Sự kiện</dt>
              <dd>{event.title}</dd>
            </div>
            <div>
              <dt>Loại vé</dt>
              <dd>{selectedTicketType?.name ?? 'Chưa chọn'}</dd>
            </div>
            <div>
              <dt>Số lượng</dt>
              <dd>{quantity}</dd>
            </div>
            <div>
              <dt>Tạm tính</dt>
              <dd>{totalPrice === 0 ? 'Miễn phí' : formatCurrency(totalPrice)}</dd>
            </div>
          </dl>

          {booking.session ? (
            <div className="checkout-summary__session">
              <strong>Phiên giữ vé đã được tạo</strong>
              <p>
                Session: <span>{booking.session.id}</span>
              </p>
              <p>Vui lòng thanh toán trước khi đồng hồ về 00:00.</p>
            </div>
          ) : (
            <div className="checkout-summary__session checkout-summary__session--muted">
              <strong>Chưa giữ vé</strong>
              <p>Bấm “Giữ vé tạm thời” để mô phỏng Redis trừ tồn kho và tạo TTL session.</p>
            </div>
          )}

          {countdown.isExpired ? (
            <p className="checkout-page__error">Phiên giữ vé đã hết hạn. Hãy tạo phiên mới.</p>
          ) : null}
          {payment.error ? <p className="checkout-page__error">{payment.error}</p> : null}

          <div className="checkout-summary__actions">
            <button type="button" onClick={() => handlePayment('success')} disabled={!canPay}>
              {payment.loading ? 'Đang xử lý...' : 'Mock thanh toán thành công'}
            </button>
            <button type="button" onClick={() => handlePayment('failed')} disabled={!booking.session || payment.loading}>
              Mô phỏng thất bại
            </button>
          </div>
        </aside>
      </section>
    </MainLayout>
  );
};
