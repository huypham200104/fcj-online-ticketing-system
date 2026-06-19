import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES, routePaths } from '@/presentation/router/routes';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

function getDefaultItems(pathname: string, search: string): BreadcrumbItem[] {
  const params = new URLSearchParams(search);
  const eventId = params.get('eventId') ?? undefined;
  const cinemaId = params.get('cinemaId') ?? undefined;
  const items: BreadcrumbItem[] = [{ label: 'Trang chủ', to: ROUTES.EVENTS }];

  if (pathname === ROUTES.EVENTS) {
    return [...items, { label: 'Phim & Concert' }];
  }

  if (pathname.startsWith('/events/')) {
    return [...items, { label: 'Phim & Concert', to: ROUTES.EVENTS }, { label: 'Chi tiết phim' }];
  }

  if (pathname === ROUTES.CHECKOUT) {
    const detailLink = eventId ? routePaths.eventDetail(eventId, { cinemaId }) : ROUTES.EVENTS;
    return [
      ...items,
      { label: 'Phim & Concert', to: ROUTES.EVENTS },
      { label: 'Chi tiết phim', to: detailLink },
      { label: 'Checkout' },
    ];
  }

  if (pathname === ROUTES.PAYMENT_SUCCESS) {
    return [...items, { label: 'Checkout', to: ROUTES.CHECKOUT }, { label: 'Thanh toán thành công' }];
  }

  if (pathname === ROUTES.PAYMENT_FAILED) {
    return [...items, { label: 'Checkout', to: ROUTES.CHECKOUT }, { label: 'Thanh toán thất bại' }];
  }

  if (pathname === ROUTES.MY_TICKETS) {
    return [...items, { label: 'Vé của tôi' }];
  }

  if (pathname.startsWith('/my-tickets/')) {
    return [...items, { label: 'Vé của tôi', to: ROUTES.MY_TICKETS }, { label: 'Chi tiết vé' }];
  }

  if (pathname === ROUTES.CHECK_IN) {
    return [...items, { label: 'Soát vé QR' }];
  }

  return items;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const location = useLocation();
  const resolvedItems = items ?? getDefaultItems(location.pathname, location.search);

  if (resolvedItems.length <= 1) return null;

  return (
    <nav className={`breadcrumb ${className}`} aria-label="Breadcrumb">
      <ol className="breadcrumb__list">
        {resolvedItems.map((item, index) => {
          const isLast = index === resolvedItems.length - 1;
          return (
            <li className="breadcrumb__item" key={`${item.label}-${index}`}>
              {item.to && !isLast ? (
                <Link to={item.to}>{item.label}</Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
