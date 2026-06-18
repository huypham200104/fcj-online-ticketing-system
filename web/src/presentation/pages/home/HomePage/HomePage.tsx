import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '@/assets/logo/logo.png';
import type { TicketEvent } from '@/domain/entities/Event';
import { PageState } from '@/presentation/components/shared/PageState';
import { useHomeFeed } from '@/presentation/hooks/useHomeFeed';
import { ROUTES, routePaths } from '@/presentation/router/routes';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import './HomePage.css';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const TicketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v3Z" />
    <path d="M13 5v2M13 11v2M13 17v2" />
  </svg>
);

const QrIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h2v2h-2zM18 14h3v3M14 18h3v3M20 20h1" />
  </svg>
);

function formatEventPrice(event: TicketEvent): string {
  return event.priceFrom === 0 ? 'Miễn phí' : formatCurrency(event.priceFrom);
}

export const HomePage: React.FC = () => {
  const { data, loading, error, reload } = useHomeFeed();
  const featuredEvent = data?.featuredEvent;

  return (
    <div className="home-page">
      <header className="home-header">
        <Link to={ROUTES.EVENTS} className="home-header__brand" aria-label="TicketSpace home">
          <img src={logoImg} alt="" className="home-header__logo" />
          <span>TicketSpace</span>
        </Link>

        <nav className="home-header__nav" aria-label="Main navigation">
          <a href="#events">Sự kiện</a>
          <a href="#my-ticket">Vé của tôi</a>
          <a href="#checkin">Check-in</a>
        </nav>

        <Link to={ROUTES.LOGIN} className="home-header__account">
          Demo User
        </Link>
      </header>

      <main className="home-main">
        {loading ? (
          <PageState variant="loading" title="Đang tải sự kiện" description="Hệ thống đang lấy dữ liệu mở bán mới nhất." />
        ) : null}

        {error ? (
          <PageState
            variant="error"
            title="Không thể tải trang home"
            description={error}
            action={
              <button type="button" className="home-page__retry" onClick={reload}>
                Thử lại
              </button>
            }
          />
        ) : null}

        {!loading && !error && data && featuredEvent ? (
          <>
        <section className="home-hero" aria-label="Khám phá sự kiện">
          <div className="home-hero__content">
            <span className="home-hero__eyebrow">Đặt vé nhanh, nhận QR tức thì</span>
            <h1>Khám phá sự kiện phù hợp cho cuối tuần này</h1>
            <p>
              Tìm concert, workshop và sự kiện nổi bật. Giữ vé realtime, thanh toán nhanh
              và check-in bằng mã QR tại cổng.
            </p>

            <div className="home-search" role="search">
              <label className="home-search__field">
                <SearchIcon />
                <input type="search" placeholder="Tìm theo tên sự kiện" />
              </label>
              <label className="home-search__field">
                <MapPinIcon />
                <select defaultValue="ho-chi-minh">
                  <option value="ho-chi-minh">TP. Hồ Chí Minh</option>
                  <option value="ha-noi">Hà Nội</option>
                  <option value="da-nang">Đà Nẵng</option>
                </select>
              </label>
              <button type="button" className="home-search__button">
                <SearchIcon />
                <span>Tìm vé</span>
              </button>
            </div>
          </div>

          <aside className="featured-ticket" aria-label="Sự kiện nổi bật">
            <div className="featured-ticket__poster">
              <div className="featured-ticket__stage">
                <span />
                <span />
                <span />
              </div>
              <strong>LIVE</strong>
            </div>
            <div className="featured-ticket__body">
              <span className="featured-ticket__tag">Hot event</span>
              <h2>{featuredEvent.title}</h2>
              <p>{featuredEvent.shortDescription}</p>
              <div className="featured-ticket__meta">
                <span>
                  <CalendarIcon />
                  {featuredEvent.dateLabel}
                </span>
                <span>
                  <TicketIcon />
                  từ {formatEventPrice(featuredEvent)}
                </span>
              </div>
            </div>
          </aside>
        </section>

        <section className="home-stats" aria-label="Tổng quan hệ thống">
          {data.stats.map((item) => (
            <article className="stat-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.helper}</small>
            </article>
          ))}
        </section>

        <section className="home-content" id="events">
          <div className="home-content__main">
            <div className="section-heading">
              <div>
                <span className="section-heading__label">Đang mở bán</span>
                <h2>Sự kiện nổi bật</h2>
              </div>
              <Link to={ROUTES.EVENTS}>Xem tất cả</Link>
            </div>

            <div className="category-tabs" aria-label="Lọc danh mục">
              {data.categories.map((category, index) => (
                <button
                  type="button"
                  className={`category-tabs__item ${index === 0 ? 'category-tabs__item--active' : ''}`}
                  key={category}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="event-grid">
              {data.events.map((event) => (
                <article className="event-card" key={event.title}>
                  <div className={`event-card__visual event-card__visual--${event.visualTone}`}>
                    <span>{event.category}</span>
                    <strong>{event.dateLabel.split(',')[0]}</strong>
                  </div>
                  <div className="event-card__body">
                    <div>
                      <span className="event-card__type">{event.category}</span>
                      <h3>{event.title}</h3>
                    </div>
                    <p>
                      <MapPinIcon />
                      {event.venue.name}
                    </p>
                    <div className="event-card__stock" aria-label={`Đã bán ${event.salesProgress}%`}>
                      <span style={{ width: `${event.salesProgress}%` }} />
                    </div>
                    <div className="event-card__footer">
                      <strong>{formatEventPrice(event)}</strong>
                      <Link to={routePaths.eventDetail(event.id)}>
                        <TicketIcon />
                        <span>Đặt vé</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="home-sidebar">
            <section className="side-panel" id="my-ticket">
              <div className="side-panel__header">
                <span className="side-panel__icon">
                  <QrIcon />
                </span>
                <div>
                  <h2>Vé QR gần nhất</h2>
                  <p>{featuredEvent.title}</p>
                </div>
              </div>
              <div className="qr-preview" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <Link to={ROUTES.MY_TICKETS} className="side-panel__button">
                Mở vé của tôi
              </Link>
            </section>

            <section className="side-panel side-panel--timeline" id="checkin">
              <h2>Lịch hôm nay</h2>
              <ol className="timeline-list">
                {data.events.map((event) => (
                  <li key={event.id}>
                    <time>{event.dateLabel.split(',')[0]}</time>
                    <span>{event.title}</span>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </section>
          </>
        ) : null}
      </main>
    </div>
  );
};
