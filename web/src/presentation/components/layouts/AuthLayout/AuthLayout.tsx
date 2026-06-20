import React from 'react';
import brandLogo from '@/assets/logo/logo.png';
import type { TicketEvent } from '@/domain/entities/Event';
import { useHomeFeed } from '@/presentation/hooks/useHomeFeed';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

function getRemainingTickets(event: TicketEvent): number {
  return event.ticketTypes.reduce((sum, ticketType) => sum + ticketType.remainingStock, 0);
}

function getPriceLabel(event: TicketEvent): string {
  return event.priceFrom === 0 ? 'Miễn phí' : `Từ ${formatCurrency(event.priceFrom)}`;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { data, loading, error } = useHomeFeed();
  const events = data?.events.slice(0, 6) ?? [];
  const bannerItems = events.length ? [...events, ...events] : [];

  return (
    <div className="auth-layout">
      <aside className="auth-layout__brand" aria-hidden="true">
        <div className="auth-layout__brand-mark">
          <div className="auth-layout__logo">
            <img src={brandLogo} alt="Cinematic Pulse" />
            <span>Cinematic Pulse</span>
          </div>
        </div>

        <div className="auth-layout__screen">
          <div className="auth-layout__screen-bar" />
          <div className="auth-layout__seat-map">
            {Array.from({ length: 36 }, (_, index) => (
              <span key={index} className={index % 7 === 0 ? 'auth-layout__seat--selected' : ''} />
            ))}
          </div>
        </div>

        <div className="auth-layout__banners">
          {(loading || error || bannerItems.length === 0) && bannerItems.length === 0 ? (
            <div className="auth-event-card auth-event-card--loading">
              <span />
              <strong>{error ? 'Chưa tải được sự kiện' : 'Đang tải sự kiện từ backend'}</strong>
              <small>{error ? 'Kiểm tra backend để hiển thị phim và concert đang mở bán.' : 'Banner sẽ dùng dữ liệu phim và concert đang mở bán.'}</small>
            </div>
          ) : (
            <div className="banner-track">
              {bannerItems.map((event, index) => (
                <article className="auth-event-card" key={`${event.id}-${index}`}>
                  {event.posterUrl ? <img src={event.posterUrl} alt="" /> : null}
                  <div className="auth-event-card__shade" />
                  <div className="auth-event-card__content">
                    <div className="auth-event-card__meta">
                      <span>{event.category}</span>
                      <span>{event.dateLabel}</span>
                    </div>
                    <h4>{event.title}</h4>
                    <p>{event.venue.name}</p>
                    <div className="auth-event-card__footer">
                      <strong>{getPriceLabel(event)}</strong>
                      <span>{getRemainingTickets(event)} vé còn lại</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="auth-layout__tagline">
          <h2>Đặt vé xem phim<br />nhanh và rõ ghế</h2>
          <ul className="auth-layout__features">
            <li>
              <span className="feature-icon">A1</span>
              <span>Hơn 50+ cụm rạp trên toàn quốc</span>
            </li>
            <li>
              <span className="feature-icon">B2</span>
              <span>Chọn ghế ngồi và bắp nước dễ dàng</span>
            </li>
            <li>
              <span className="feature-icon">QR</span>
              <span>Quét mã QR vào rạp nhanh chóng</span>
            </li>
          </ul>
        </div>
      </aside>

      <main className="auth-layout__content">
        <div className="auth-layout__mobile-logo">
          <img src={brandLogo} alt="Cinematic Pulse" />
          <span>Cinematic Pulse</span>
        </div>

        <div className="auth-layout__form-wrapper">{children}</div>
      </main>
    </div>
  );
};
