import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { LoginPage } from '@/presentation/pages/auth/LoginPage';
import { RegisterPage } from '@/presentation/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/presentation/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/presentation/pages/auth/ResetPasswordPage';
import { HomePage } from '@/presentation/pages/home/HomePage';
import { EventDetailPage } from '@/presentation/pages/events/EventDetailPage';
import { EventCatalogPage } from '@/presentation/pages/events/EventCatalogPage';
import { CheckoutPage } from '@/presentation/pages/booking/CheckoutPage';
import { PaymentResultPage } from '@/presentation/pages/payment/PaymentResultPage';
import { MyTicketsPage } from '@/presentation/pages/dashboard/MyTicketsPage';
import { TicketDetailPage } from '@/presentation/pages/dashboard/TicketDetailPage';
import { MyOrdersPage } from '@/presentation/pages/dashboard/MyOrdersPage';
import { OrderDetailPage } from '@/presentation/pages/dashboard/OrderDetailPage';
import { AdminPage } from '@/presentation/pages/admin/AdminPage';
import { CheckInPage } from '@/presentation/pages/staff/CheckInPage';
import { ROUTES } from './routes';
import { ScrollToTop } from './ScrollToTop';

function withScrollReset(element: ReactNode) {
  return <ScrollToTop>{element}</ScrollToTop>;
}

export const router = createBrowserRouter([
  // Public home
  { path: ROUTES.HOME, element: withScrollReset(<HomePage />) },

  // Auth
  { path: ROUTES.LOGIN,    element: withScrollReset(<LoginPage />) },
  { path: ROUTES.REGISTER, element: withScrollReset(<RegisterPage />) },
  { path: ROUTES.FORGOT_PASSWORD, element: withScrollReset(<ForgotPasswordPage />) },
  { path: ROUTES.RESET_PASSWORD, element: withScrollReset(<ResetPasswordPage />) },

  // App
  { path: ROUTES.EVENTS, element: withScrollReset(<HomePage />) },
  { path: ROUTES.MOVIES, element: withScrollReset(<EventCatalogPage category="Phim" />) },
  { path: ROUTES.CONCERTS, element: withScrollReset(<EventCatalogPage category="Concert" />) },
  { path: ROUTES.EVENT_DETAIL, element: withScrollReset(<EventDetailPage />) },
  { path: ROUTES.CHECKOUT, element: withScrollReset(<CheckoutPage />) },
  { path: ROUTES.PAYMENT_SUCCESS, element: withScrollReset(<PaymentResultPage status="success" />) },
  { path: ROUTES.PAYMENT_FAILED, element: withScrollReset(<PaymentResultPage status="failed" />) },
  { path: ROUTES.MY_TICKETS, element: withScrollReset(<MyTicketsPage />) },
  { path: ROUTES.MY_TICKET_DETAIL, element: withScrollReset(<TicketDetailPage />) },
  { path: ROUTES.ORDER_HISTORY, element: withScrollReset(<MyOrdersPage />) },
  { path: ROUTES.ORDER_DETAIL, element: withScrollReset(<OrderDetailPage />) },
  { path: ROUTES.ADMIN, element: withScrollReset(<AdminPage />) },
  { path: ROUTES.CHECK_IN, element: withScrollReset(<CheckInPage />) },

  // Catch-all
  { path: '*', element: withScrollReset(<Navigate to={ROUTES.LOGIN} replace />) },
]);
