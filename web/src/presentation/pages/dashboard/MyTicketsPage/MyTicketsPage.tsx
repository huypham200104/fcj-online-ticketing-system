import React from 'react';
import { Link } from 'react-router-dom';
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
  if (status === 'valid') return 'Valid';
  if (status === 'used') return 'Used';
  if (status === 'expired') return 'Expired';
  return 'Cancelled';
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
          <Badge tone="primary">My tickets</Badge>
          <h1>Vé của tôi</h1>
          <p>Quản lý vé đã mua và mở QR Code để check-in tại cổng sự kiện.</p>
        </div>
        <Link to={ROUTES.EVENTS}>Mua thêm vé</Link>
      </section>

      {tickets.length === 0 ? (
        <PageState
          variant="empty"
          title="Bạn chưa có vé"
          description="Hãy đặt vé cho một sự kiện đang mở bán."
          action={<Link className="my-tickets__state-button" to={ROUTES.EVENTS}>Xem sự kiện</Link>}
        />
      ) : (
        <section className="my-tickets__grid">
          {tickets.map((ticket) => (
            <article className="my-ticket-card" key={ticket.id}>
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

