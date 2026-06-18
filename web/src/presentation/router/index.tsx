import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/presentation/pages/auth/LoginPage';
import { RegisterPage } from '@/presentation/pages/auth/RegisterPage';
import { HomePage } from '@/presentation/pages/home/HomePage';
import { EventDetailPage } from '@/presentation/pages/events/EventDetailPage';
import { CheckoutPage } from '@/presentation/pages/booking/CheckoutPage';
import { PaymentResultPage } from '@/presentation/pages/payment/PaymentResultPage';
import { MyTicketsPage } from '@/presentation/pages/dashboard/MyTicketsPage';
import { TicketDetailPage } from '@/presentation/pages/dashboard/TicketDetailPage';
import { ROUTES } from './routes';

export const router = createBrowserRouter([
  // Root redirect → Login
  { path: ROUTES.HOME, element: <Navigate to={ROUTES.LOGIN} replace /> },

  // Auth
  { path: ROUTES.LOGIN,    element: <LoginPage /> },
  { path: ROUTES.REGISTER, element: <RegisterPage /> },

  // App
  { path: ROUTES.EVENTS, element: <HomePage /> },
  { path: ROUTES.EVENT_DETAIL, element: <EventDetailPage /> },
  { path: ROUTES.CHECKOUT, element: <CheckoutPage /> },
  { path: ROUTES.PAYMENT_SUCCESS, element: <PaymentResultPage status="success" /> },
  { path: ROUTES.PAYMENT_FAILED, element: <PaymentResultPage status="failed" /> },
  { path: ROUTES.MY_TICKETS, element: <MyTicketsPage /> },
  { path: ROUTES.MY_TICKET_DETAIL, element: <TicketDetailPage /> },

  // Catch-all
  { path: '*', element: <Navigate to={ROUTES.LOGIN} replace /> },
]);
