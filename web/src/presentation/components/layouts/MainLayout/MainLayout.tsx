import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import brandLogo from '@/assets/logo/logo.png';
import { Breadcrumb } from '@/presentation/components/shared/Breadcrumb';
import { AccountMenu } from '@/presentation/components/shared/AccountMenu';
import { Footer } from '@/presentation/components/shared/Footer';
import { ROUTES } from '@/presentation/router/routes';
import { getAuthSession } from '@/infrastructure/api/authSession';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  contentClassName?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, contentClassName = '' }) => {
  const session = getAuthSession();
  const role = session?.user.role;
  const canCheckIn = role === 'staff' || role === 'admin';
  const canManageAdmin = role === 'admin';

  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <Link to={ROUTES.EVENTS} className="main-layout__brand" aria-label="Cinematic Pulse home">
          <img src={brandLogo} alt="Cinematic Pulse" />
          <span>Cinematic Pulse</span>
        </Link>

        <nav className="main-layout__nav" aria-label="Main navigation">
          <NavLink to={ROUTES.EVENTS}>Phim & Concert</NavLink>
          {session ? <NavLink to={ROUTES.MY_TICKETS}>Vé của tôi</NavLink> : null}
          {session ? <NavLink to={ROUTES.ORDER_HISTORY}>Đơn hàng</NavLink> : null}
          {canCheckIn ? <NavLink to={ROUTES.CHECK_IN}>Soát vé QR</NavLink> : null}
          {canManageAdmin ? <NavLink to={ROUTES.ADMIN}>Admin</NavLink> : null}
        </nav>

        {session ? (
          <AccountMenu initialSession={session} />
        ) : (
          <Link to={ROUTES.LOGIN} className="main-layout__account">
            Đăng nhập
          </Link>
        )}
      </header>

      <Breadcrumb />
      <main className={`main-layout__content ${contentClassName}`}>{children}</main>
      <Footer />
    </div>
  );
};
