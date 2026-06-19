import React from 'react';
import { Link } from 'react-router-dom';
import brandLogo from '@/assets/logo/logo.png';
import { ROUTES } from '@/presentation/router/routes';
import './Footer.css';

const footerGroups = [
  {
    title: 'Khám phá',
    links: [
      { label: 'Phim đang chiếu', to: ROUTES.EVENTS },
      { label: 'Concert tại Việt Nam', to: ROUTES.EVENTS },
      { label: 'Vé của tôi', to: ROUTES.MY_TICKETS },
      { label: 'Soát vé QR', to: ROUTES.CHECK_IN },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Hướng dẫn đặt vé', to: ROUTES.EVENTS },
      { label: 'Chính sách đổi trả', to: ROUTES.EVENTS },
      { label: 'Câu hỏi thường gặp', to: ROUTES.EVENTS },
      { label: 'Liên hệ hỗ trợ', to: ROUTES.EVENTS },
    ],
  },
  {
    title: 'Cinematic Pulse',
    links: [
      { label: 'Về chúng tôi', to: ROUTES.EVENTS },
      { label: 'Đối tác rạp phim', to: ROUTES.EVENTS },
      { label: 'Đối tác tổ chức concert', to: ROUTES.EVENTS },
      { label: 'Điều khoản sử dụng', to: ROUTES.EVENTS },
    ],
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <section className="site-footer__brand-panel" aria-label="Cinematic Pulse">
          <Link to={ROUTES.EVENTS} className="site-footer__brand">
            <img src={brandLogo} alt="Cinematic Pulse" />
            <span>Cinematic Pulse</span>
          </Link>
          <p>
            Nền tảng đặt vé xem phim và concert tại Việt Nam, hỗ trợ chọn rạp, chọn suất chiếu,
            giữ ghế tạm thời và nhận vé QR để check-in nhanh.
          </p>
          <div className="site-footer__meta">
            <span>Hotline: 1900 2026</span>
            <span>support@cinematicpulse.vn</span>
          </div>
        </section>

        <nav className="site-footer__links" aria-label="Footer navigation">
          {footerGroups.map((group) => (
            <div className="site-footer__group" key={group.title}>
              <h2>{group.title}</h2>
              {group.links.map((link) => (
                <Link to={link.to} key={link.label}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <section className="site-footer__newsletter" aria-label="Nhận thông tin mới">
          <h2>Nhận lịch mở bán mới</h2>
          <p>Thông báo phim hot, suất chiếu sớm và ưu đãi combo bắp nước.</p>
          <form className="site-footer__form">
            <label>
              <span>Email</span>
              <input type="email" placeholder="you@example.com" />
            </label>
            <button type="button">Đăng ký</button>
          </form>
        </section>
      </div>

      <div className="site-footer__bottom">
        <span>© 2026 Cinematic Pulse. All rights reserved.</span>
        <span>Movie tickets · Concert tickets · QR check-in</span>
      </div>
    </footer>
  );
};
