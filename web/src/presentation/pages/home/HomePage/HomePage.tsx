import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { TicketEvent, HomeBanner } from '@/domain/entities/Event';
import { Breadcrumb } from '@/presentation/components/shared/Breadcrumb';
import { AccountMenu } from '@/presentation/components/shared/AccountMenu';
import { Footer } from '@/presentation/components/shared/Footer';
import { PageState } from '@/presentation/components/shared/PageState';
import { getAuthSession } from '@/infrastructure/api/authSession';
import { useHomeFeed } from '@/presentation/hooks/useHomeFeed';
import { ROUTES, routePaths } from '@/presentation/router/routes';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import logoMark from '@/assets/logo/logo.png';
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

const StatIcon: React.FC<{ name: string }> = ({ name }) => {
  if (name === 'qr') return <QrIcon />;
  if (name === 'pin') return <MapPinIcon />;
  return <TicketIcon />;
};

function formatEventPrice(event: TicketEvent): string {
  return event.priceFrom === 0 ? 'Miễn phí' : formatCurrency(event.priceFrom);
}

interface HomeRouteState {
  notification?: {
    tone: 'success' | 'error';
    message: string;
  };
}

// Hero Slider Component
const HeroSlider: React.FC<{ banners: HomeBanner[] }> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  return (
    <div className="hero-slider">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`hero-slider__slide ${index === currentIndex ? 'active' : ''}`}
        >
          <img src={banner.imageUrl} alt={banner.title} className="hero-slider__bg" />
          <div className="hero-slider__overlay" />
          <div className="hero-slider__content">
            <span className="hero-slider__tag">{banner.tag}</span>
            <h2>{banner.title}</h2>
            <p>{banner.subtitle}</p>
            <Link to={banner.link} className="hero-slider__button">
              <TicketIcon /> Mua Vé Ngay
            </Link>
          </div>
        </div>
      ))}
      <div className="hero-slider__nav">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`hero-slider__dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, loading, error, reload } = useHomeFeed();
  const session = getAuthSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('TP. HCM');
  const routeState = location.state as HomeRouteState | null;
  const notification = routeState?.notification;

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const query = searchQuery.trim();
    if (query) params.set('q', query);
    if (selectedCity) params.set('city', selectedCity);
    params.set('page', '1');
    navigate(`${ROUTES.MOVIES}?${params.toString()}`);
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <Link to={ROUTES.EVENTS} className="home-header__brand" aria-label="Cinematic Pulse home">
          <img src={logoMark} alt="Cinematic Pulse" className="home-header__logo-img" />
          <span>Cinematic Pulse</span>
        </Link>

        <nav className="home-header__nav" aria-label="Main navigation">
          <a href="#movies">Phim Đang Chiếu</a>
          <a href="#concerts">Concert</a>
          <Link to={ROUTES.MY_TICKETS}>Vé của tôi</Link>
        </nav>

        {session ? (
          <AccountMenu initialSession={session} />
        ) : (
          <Link to={ROUTES.LOGIN} className="home-header__account">
            Đăng nhập
          </Link>
        )}
      </header>

      <Breadcrumb className="home-breadcrumb" />
      <main className="home-main">
        {notification ? (
          <div className={`home-page__notification home-page__notification--${notification.tone}`} role="status">
            {notification.message}
          </div>
        ) : null}

        {loading ? (
          <PageState variant="loading" title="Đang tải lịch phim" description="Hệ thống đang lấy dữ liệu phim mới nhất." />
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

        {!loading && !error && data ? (
          <>
            <HeroSlider banners={data.banners} />

            <form className="home-search-bar" role="search" onSubmit={handleSearch}>
              <div className="search-bar-inner">
                <label className="home-search__field">
                  <SearchIcon />
                  <input
                    type="search"
                    placeholder="Tìm tên phim, concert..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </label>
                <label className="home-search__field home-search__field--location">
                  <MapPinIcon />
                  <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>
                    <option value="">Tất cả thành phố</option>
                    <option value="TP. HCM">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                  </select>
                </label>
                <button type="submit" className="home-search__button">
                  Tìm Vé
                </button>
              </div>
            </form>

            <section className="home-stats" aria-label="Tổng quan hệ thống">
              {data.stats.map((item) => (
                <article className="stat-card" key={item.label}>
                  <div className="stat-card__icon" aria-hidden="true">
                    <StatIcon name={item.icon} />
                  </div>
                  <div className="stat-card__info">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                    <small>{item.helper}</small>
                  </div>
                </article>
              ))}
            </section>

            <section className="movie-section" id="movies">
              <div className="section-heading">
                <div>
                  <span className="section-heading__label">Đang Hot Tại Rạp</span>
                  <h2>Phim Đang Chiếu</h2>
                </div>
                <Link to={ROUTES.MOVIES}>Xem toàn bộ lịch chiếu</Link>
              </div>

              <div className="movie-grid">
                {data.nowShowingMovies.map((movie) => (
                  <article className="movie-card" key={movie.id}>
                    <div className="movie-card__poster">
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt={movie.title} />
                      ) : (
                        <div className={`movie-placeholder bg-${movie.visualTone}`} />
                      )}
                      <div className="movie-card__overlay">
                        <Link to={routePaths.eventDetail(movie.id)} className="btn-book">Mua Vé</Link>
                      </div>
                      <span className="movie-rating">{movie.rating || 'P'}</span>
                    </div>
                    <div className="movie-card__info">
                      <h3>{movie.title}</h3>
                      <div className="movie-meta">
                        <span>{movie.genre}</span>
                        <span>•</span>
                        <span>{movie.duration}</span>
                      </div>
                      <p className="movie-date">Khởi chiếu: {movie.dateLabel.replace('Từ ', '')}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {data.upcomingConcerts && data.upcomingConcerts.length > 0 && (
              <section className="concert-section" id="concerts">
                <div className="section-heading">
                  <div>
                    <span className="section-heading__label">Live Music</span>
                    <h2>Concert Sắp Diễn Ra</h2>
                  </div>
                  <Link to={ROUTES.CONCERTS}>Khám phá thêm</Link>
                </div>

                <div className="event-grid">
                  {data.upcomingConcerts.map((event) => (
                    <article className="event-card" key={event.id}>
                      <div className={`event-card__visual event-card__visual--${event.visualTone}`}>
                        {event.posterUrl && <img src={event.posterUrl} alt={event.title} className="event-bg" />}
                        <div className="event-visual-content">
                          <span>{event.category}</span>
                          <strong>{event.dateLabel.split(',')[0]}</strong>
                        </div>
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
                            <span>Mua Vé</span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="home-bottom-cta">
              <div className="cta-content">
                <h2>Quản Lý Vé Trực Tuyến Dễ Dàng</h2>
                <p>Theo dõi lịch sử mua vé, nhận vé điện tử QR Code và check-in nhanh chóng chỉ với 1 chạm.</p>
                <div className="cta-actions">
                  <Link to={ROUTES.MY_TICKETS} className="btn-primary">
                    <QrIcon /> Vé Của Tôi
                  </Link>
                  <Link to={ROUTES.REGISTER} className="btn-outline">
                    Đăng ký thành viên
                  </Link>
                </div>
              </div>
              <div className="cta-visual">
                <div className="qr-preview-large">
                  <span /> <span /> <span className="active" />
                  <span /> <span className="active" /> <span />
                  <span className="active" /> <span /> <span className="active" />
                </div>
              </div>
            </section>
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};
