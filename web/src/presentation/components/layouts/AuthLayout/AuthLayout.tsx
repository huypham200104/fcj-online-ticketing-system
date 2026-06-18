import React from 'react';
import logoImg from '@/assets/logo/logo.png';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-layout">
      {/* ── Left brand panel ── */}
      <aside className="auth-layout__brand" aria-hidden="true">
        {/* Decorative orbs */}
        <div className="auth-layout__orb auth-layout__orb--top" />
        <div className="auth-layout__orb auth-layout__orb--bottom" />

        {/* Brand mark */}
        <div className="auth-layout__brand-mark">
          <div className="auth-layout__logo">
            <img src={logoImg} alt="TicketSpace Logo" className="auth-layout__logo-img" />
            <span>TicketSpace</span>
          </div>
        </div>

        {/* Infinite scrolling banners */}
        <div className="auth-layout__banners">
          <div className="banner-track">
            {/* Banner 1: Promotion */}
            <div className="banner-item banner-item--promo">
              <div className="banner-bg-shape"></div>
              <div className="banner-content">
                <span className="banner-tag">🎁 Ưu đãi đặc biệt</span>
                <h4>Giảm giá 20%</h4>
                <p>Thứ Ba vui vẻ - Xem phim cực rẻ</p>
              </div>
            </div>
            
            {/* Banner 2: Movie Event */}
            <div className="banner-item banner-item--music">
              <div className="banner-bg-shape"></div>
              <div className="banner-content">
                <span className="banner-tag">🎬 Phim bom tấn</span>
                <h4>Avengers: Secret Wars</h4>
                <p>Mở bán vé sớm vào Thứ Sáu tuần này</p>
              </div>
            </div>
            
            {/* Banner 3: Movie Festival */}
            <div className="banner-item banner-item--festival">
              <div className="banner-bg-shape"></div>
              <div className="banner-content">
                <span className="banner-tag">✨ Suất chiếu đặc biệt</span>
                <h4>Dune: Part Three</h4>
                <p>Trải nghiệm định dạng IMAX 3D</p>
              </div>
            </div>

            {/* Duplicated Items for infinite loop */}
            <div className="banner-item banner-item--promo">
              <div className="banner-bg-shape"></div>
              <div className="banner-content">
                <span className="banner-tag">🎁 Ưu đãi đặc biệt</span>
                <h4>Giảm giá 20%</h4>
                <p>Thứ Ba vui vẻ - Xem phim cực rẻ</p>
              </div>
            </div>
            <div className="banner-item banner-item--music">
              <div className="banner-bg-shape"></div>
              <div className="banner-content">
                <span className="banner-tag">🎬 Phim bom tấn</span>
                <h4>Avengers: Secret Wars</h4>
                <p>Mở bán vé sớm vào Thứ Sáu tuần này</p>
              </div>
            </div>
            <div className="banner-item banner-item--festival">
              <div className="banner-bg-shape"></div>
              <div className="banner-content">
                <span className="banner-tag">✨ Suất chiếu đặc biệt</span>
                <h4>Dune: Part Three</h4>
                <p>Trải nghiệm định dạng IMAX 3D</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="auth-layout__tagline">
          <h2>Trải nghiệm điện ảnh<br/>đỉnh cao</h2>
          <ul className="auth-layout__features">
            <li>
              <span className="feature-icon">✨</span>
              <span>Hơn 50+ cụm rạp trên toàn quốc</span>
            </li>
            <li>
              <span className="feature-icon">🍿</span>
              <span>Chọn ghế ngồi và bắp nước dễ dàng</span>
            </li>
            <li>
              <span className="feature-icon">🎟️</span>
              <span>Quét mã QR vào rạp nhanh chóng</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="auth-layout__content">
        {/* Mobile logo */}
        <div className="auth-layout__mobile-logo">
          <img src={logoImg} alt="TicketSpace Logo" className="auth-layout__logo-img" />
          <span>TicketSpace</span>
        </div>

        <div className="auth-layout__form-wrapper">{children}</div>
      </main>
    </div>
  );
};
