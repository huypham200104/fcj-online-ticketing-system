import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/presentation/components/ui/Badge';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { PageState } from '@/presentation/components/shared/PageState';
import { useEventDetail } from '@/presentation/hooks/useEventDetail';
import { ROUTES, routePaths } from '@/presentation/router/routes';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import './EventDetailPage.css';

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const TicketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v3Z" />
    <path d="M13 5v2M13 11v2M13 17v2" />
  </svg>
);

function formatPrice(value: number): string {
  return value === 0 ? 'Miễn phí' : formatCurrency(value);
}

export const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const { event, loading, error, reload } = useEventDetail(id);

  if (loading) {
    return (
      <MainLayout>
        <PageState variant="loading" title="Đang tải chi tiết sự kiện" />
      </MainLayout>
    );
  }

  if (error || !event) {
    return (
      <MainLayout>
        <PageState
          variant="error"
          title="Không tìm thấy sự kiện"
          description={error ?? 'Sự kiện này không tồn tại hoặc đã ngừng mở bán.'}
          action={
            <div className="event-detail__state-actions">
              <button type="button" onClick={reload}>
                Thử lại
              </button>
              <Link to={ROUTES.EVENTS}>Về danh sách</Link>
            </div>
          }
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout contentClassName="event-detail">
      <section className="event-detail__hero">
        <div className={`event-detail__poster event-detail__poster--${event.visualTone}`}>
          <span>{event.category}</span>
          <strong>{event.dateLabel.split(',')[0]}</strong>
        </div>

        <div className="event-detail__intro">
          <Badge tone="primary">{event.category}</Badge>
          <h1>{event.title}</h1>
          <p>{event.description}</p>

          <div className="event-detail__facts">
            <span>
              <CalendarIcon />
              {event.dateLabel}
            </span>
            <span>
              <MapPinIcon />
              {event.venue.name}
            </span>
          </div>
        </div>
      </section>

      <section className="event-detail__content">
        <div className="event-detail__main">
          <article className="event-detail__panel">
            <h2>Thông tin sự kiện</h2>
            <dl>
              <div>
                <dt>Đơn vị tổ chức</dt>
                <dd>{event.organizer}</dd>
              </div>
              <div>
                <dt>Địa điểm</dt>
                <dd>
                  {event.venue.address}, {event.venue.city}
                </dd>
              </div>
              <div>
                <dt>Tỷ lệ đã bán</dt>
                <dd>{event.salesProgress}% tổng số vé</dd>
              </div>
            </dl>
          </article>
        </div>

        <aside className="event-detail__tickets">
          <div className="event-detail__tickets-header">
            <div>
              <span>Đang mở bán</span>
              <h2>Chọn loại vé</h2>
            </div>
            <TicketIcon />
          </div>

          <div className="event-detail__ticket-list">
            {event.ticketTypes.map((ticketType) => {
              const soldOut = ticketType.remainingStock === 0;
              return (
                <article className="ticket-type-card" key={ticketType.id}>
                  <div>
                    <div className="ticket-type-card__title">
                      <h3>{ticketType.name}</h3>
                      <Badge tone={soldOut ? 'error' : 'success'}>
                        {soldOut ? 'Hết vé' : `${ticketType.remainingStock} vé`}
                      </Badge>
                    </div>
                    <p>{ticketType.description}</p>
                  </div>

                  <div className="ticket-type-card__footer">
                    <strong>{formatPrice(ticketType.price)}</strong>
                    {soldOut ? (
                      <button type="button" disabled>
                        Hết vé
                      </button>
                    ) : (
                      <Link to={routePaths.checkout(event.id, ticketType.id)}>Đặt vé</Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </aside>
      </section>
    </MainLayout>
  );
};

