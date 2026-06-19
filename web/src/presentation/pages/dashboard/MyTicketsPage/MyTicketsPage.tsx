import React from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import type { TicketStatus } from '@/domain/entities/Ticket';
import { Badge } from '@/presentation/components/ui/Badge';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { PageState } from '@/presentation/components/shared/PageState';
import { useTickets } from '@/presentation/hooks/useTickets';
import { ROUTES, routePaths } from '@/presentation/router/routes';
import './MyTicketsPage.css';

function getStatusTone(status: TicketStatus) {
  if (status === 'valid') return 'success';
  if (status === 'used') return 'warning';
  return 'error';
}

function getStatusLabel(status: TicketStatus) {
  if (status === 'valid') return 'Còn hiệu lực';
  if (status === 'used') return 'Đã sử dụng';
  if (status === 'expired') return 'Hết hạn';
  return 'Đã hủy';
}

export const MyTicketsPage: React.FC = () => {
  const { tickets, loading, error, reload } = useTickets();

  if (loading) {
    return (
      <MainLayout>
        <PageState variant="loading" title="Đang tải vé của bạn" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <PageState
          variant="error"
          title="Không thể tải vé"
          description={error}
          action={<button type="button" className="my-tickets__state-button" onClick={reload}>Thử lại</button>}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout contentClassName="my-tickets">
      <section className="my-tickets__heading">
        <div>
          <Badge tone="primary">Vé điện tử</Badge>
          <h1>Vé của tôi</h1>
          <p>Quản lý vé xem phim, concert và mở QR Code để vào rạp hoặc soát vé tại cổng.</p>
        </div>
        <Link to={ROUTES.EVENTS}>Mua thêm vé</Link>
      </section>

      {tickets.length === 0 ? (
        <PageState
          variant="empty"
          title="Bạn chưa có vé"
          description="Hãy đặt vé cho phim hoặc concert đang mở bán."
          action={<Link className="my-tickets__state-button" to={ROUTES.EVENTS}>Xem phim & concert</Link>}
        />
      ) : (
        <section className="my-tickets__grid">
          {tickets.map((ticket) => (
            <article className="my-ticket-card" key={ticket.id}>
              <div className="my-ticket-card__qr" aria-label={`QR vé ${ticket.code}`}>
                <QRCode value={ticket.qrValue} size={96} bgColor="var(--color-bg-surface)" fgColor="var(--color-gray-900)" />
              </div>
              <div className="my-ticket-card__body">
                <Badge tone={getStatusTone(ticket.status)}>{getStatusLabel(ticket.status)}</Badge>
                <h2>{ticket.eventTitle}</h2>
                <p>{ticket.ticketTypeName}</p>
                <dl>
                  <div>
                    <dt>Mã vé</dt>
                    <dd>{ticket.code}</dd>
                  </div>
                  <div>
                    <dt>Thời gian</dt>
                    <dd>{ticket.eventDateLabel}</dd>
                  </div>
                  {ticket.seatLabel ? (
                    <div>
                      <dt>Ghế</dt>
                      <dd>{ticket.seatLabel}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Địa điểm</dt>
                    <dd>{ticket.venueName}</dd>
                  </div>
                </dl>
              </div>
              <Link to={routePaths.ticketDetail(ticket.id)}>Mở QR</Link>
            </article>
          ))}
        </section>
      )}
    </MainLayout>
  );
};
