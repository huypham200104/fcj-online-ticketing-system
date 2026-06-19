import React from 'react';
import brandLogo from '@/assets/logo/logo.png';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const cinemaHighlights = [
  {
    tag: 'Ưu đãi rạp',
    title: 'Thứ Ba từ 59K',
    description: 'Áp dụng cho suất chiếu trước 18:00',
    tone: 'promo',
  },
  {
    tag: 'Phim hot',
    title: 'Dune: Part Three',
    description: 'Đặt vé IMAX, chọn ghế trung tâm',
    tone: 'movie',
  },
  {
    tag: 'Combo',
    title: 'Bắp nước tiết kiệm',
    description: 'Thêm combo ngay khi checkout',
    tone: 'combo',
  },
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const bannerItems = [...cinemaHighlights, ...cinemaHighlights];

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
          <div className="banner-track">
            {bannerItems.map((item, index) => (
              <div className={`banner-item banner-item--${item.tone}`} key={`${item.title}-${index}`}>
                <div className="banner-bg-shape" />
                <div className="banner-content">
                  <span className="banner-tag">{item.tag}</span>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
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
