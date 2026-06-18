import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import logoImg from '@/assets/logo/logo.png';
import { ROUTES } from '@/presentation/router/routes';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  contentClassName?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, contentClassName = '' }) => {
  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <Link to={ROUTES.EVENTS} className="main-layout__brand" aria-label="TicketSpace home">
          <img src={logoImg} alt="" className="main-layout__logo" />
          <span>TicketSpace</span>
        </Link>

        <nav className="main-layout__nav" aria-label="Main navigation">
          <NavLink to={ROUTES.EVENTS}>Sự kiện</NavLink>
          <NavLink to={ROUTES.MY_TICKETS}>Vé của tôi</NavLink>
          <NavLink to={ROUTES.CHECK_IN}>Check-in</NavLink>
        </nav>

        <Link to={ROUTES.LOGIN} className="main-layout__account">
          Demo User
        </Link>
      </header>

      <main className={`main-layout__content ${contentClassName}`}>{children}</main>
    </div>
  );
};

