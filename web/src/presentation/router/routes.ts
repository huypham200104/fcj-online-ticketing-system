export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  EVENTS: '/events',
  MOVIES: '/events/movies',
  CONCERTS: '/events/concerts',
  EVENT_DETAIL: '/events/:id',
  CHECKOUT: '/checkout',
  PAYMENT_SUCCESS: '/payment/success',
  PAYMENT_FAILED: '/payment/failed',
  MY_TICKETS: '/my-tickets',
  MY_TICKET_DETAIL: '/my-tickets/:id',
  ORDER_HISTORY: '/orders',
  ORDER_DETAIL: '/orders/:id',
  ADMIN: '/admin',
  ADMIN_EVENT_NEW: '/admin/events/new',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_ORDERS: '/admin/orders',
  CHECK_IN: '/check-in',
} as const;

export type RouteValues = (typeof ROUTES)[keyof typeof ROUTES];

export const routePaths = {
  eventDetail: (eventId: string, selection?: { cinemaId?: string }) => {
    const params = new URLSearchParams();
    if (selection?.cinemaId) params.set('cinemaId', selection.cinemaId);
    const query = params.toString();
    return query ? `/events/${eventId}?${query}` : `/events/${eventId}`;
  },
  checkout: (
    eventId: string,
    ticketTypeId?: string,
    selection?: { cinemaId?: string; showtimeId?: string },
  ) => {
    const params = new URLSearchParams({ eventId });
    if (ticketTypeId) params.set('ticketTypeId', ticketTypeId);
    if (selection?.cinemaId) params.set('cinemaId', selection.cinemaId);
    if (selection?.showtimeId) params.set('showtimeId', selection.showtimeId);
    return `${ROUTES.CHECKOUT}?${params.toString()}`;
  },
  paymentSuccess: (sessionId: string, ticketId?: string) => {
    const params = new URLSearchParams({ sessionId });
    if (ticketId) params.set('ticketId', ticketId);
    return `${ROUTES.PAYMENT_SUCCESS}?${params.toString()}`;
  },
  paymentFailed: (sessionId: string, reason?: string) => {
    const params = new URLSearchParams({ sessionId });
    if (reason) params.set('reason', reason);
    return `${ROUTES.PAYMENT_FAILED}?${params.toString()}`;
  },
  ticketDetail: (ticketId: string) => `/my-tickets/${ticketId}`,
  orderDetail: (orderId: string) => `/orders/${orderId}`,
};
