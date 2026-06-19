import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
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

interface EventDetailRouteState {
  notification?: {
    tone: 'success' | 'error';
    message: string;
  };
}

export const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const { event, loading, error, reload } = useEventDetail(id);
  const routeState = location.state as EventDetailRouteState | null;
  const notification = routeState?.notification;

  if (loading) {
    return (
      <MainLayout>
        <PageState variant="loading" title="Đang tải chi tiết vé" />
      </MainLayout>
    );
  }

  if (error || !event) {
    return (
      <MainLayout>
        <PageState
          variant="error"
          title="Không tìm thấy phim hoặc concert"
          description={error ?? 'Suất chiếu hoặc concert này không tồn tại hoặc đã ngừng mở bán.'}
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

  const movieSchedules = event.movieSchedules ?? [];
  const isMovieWithShowtimes = event.category === 'Phim' && movieSchedules.length > 0;
  const firstTicketType = event.ticketTypes[0];
  const cinemaCount = movieSchedules.length;
  const showtimeCount = movieSchedules.reduce((sum, schedule) => sum + schedule.showtimes.length, 0);
  const displayVenue = event.venue;

  return (
    <MainLayout contentClassName="event-detail">
      {notification ? (
        <div className={`event-detail__notification event-detail__notification--${notification.tone}`} role="status">
          {notification.message}
        </div>
      ) : null}

      <section className="event-detail__hero">
        <div className={event.posterUrl ? 'event-detail__poster event-detail__poster--image' : `event-detail__poster event-detail__poster--${event.visualTone}`}>
          {event.posterUrl ? (
            <>
              <img src={event.posterUrl} alt={event.title} />
              <span>{event.category}</span>
            </>
          ) : (
            <>
              <span>{event.category}</span>
              <strong>{event.dateLabel.split(',')[0]}</strong>
            </>
          )}
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
              {displayVenue.name}
            </span>
          </div>
        </div>
      </section>

      <section className="event-detail__content">
        <div className="event-detail__main">
          <article className="event-detail__panel">
            <h2>{isMovieWithShowtimes ? 'Thông tin phim' : 'Thông tin lịch chiếu'}</h2>
            <dl>
              <div>
                <dt>Đơn vị tổ chức</dt>
                <dd>{event.organizer}</dd>
              </div>
              {isMovieWithShowtimes ? (
                <>
                  <div>
                    <dt>Thể loại</dt>
                    <dd>{event.genre ?? 'Điện ảnh'}</dd>
                  </div>
                  <div>
                    <dt>Thời lượng</dt>
                    <dd>{event.duration ?? 'Đang cập nhật'}</dd>
                  </div>
                </>
              ) : null}
              <div>
                <dt>Địa điểm</dt>
                <dd>
                  {displayVenue.address}, {displayVenue.city}
                </dd>
              </div>
              <div>
                <dt>Tỷ lệ đã bán</dt>
                <dd>{event.salesProgress}% tổng số vé</dd>
              </div>
            </dl>
          </article>
        </div>

        {isMovieWithShowtimes ? (
          <aside className="event-detail__tickets">
            <div className="event-detail__tickets-header">
              <div>
                <span>Bước tiếp theo</span>
                <h2>Chọn rạp & suất chiếu</h2>
              </div>
              <TicketIcon />
            </div>

            <p className="event-detail__booking-copy">
              Phần chọn rạp, giờ chiếu và ghế ngồi được tách sang màn đặt vé riêng để bạn thao tác rõ ràng hơn.
            </p>

            <div className="event-detail__booking-stats">
              <div>
                <strong>{cinemaCount}</strong>
                <span>rạp</span>
              </div>
              <div>
                <strong>{showtimeCount}</strong>
                <span>suất chiếu</span>
              </div>
              <div>
                <strong>Theo suất</strong>
                <span>ghế trống</span>
              </div>
            </div>

            {firstTicketType ? (
              <Link className="event-detail__booking-action" to={routePaths.checkout(event.id, firstTicketType.id)}>
                Chọn rạp & giờ chiếu
              </Link>
            ) : (
              <button className="event-detail__booking-action" type="button" disabled>
                Chưa có vé mở bán
              </button>
            )}
          </aside>
        ) : (
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
        )}
      </section>
    </MainLayout>
  );
};
