export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  EVENTS: '/events',
  EVENT_DETAIL: '/events/:id',
  CHECKOUT: '/checkout',
  PAYMENT_SUCCESS: '/payment/success',
  PAYMENT_FAILED: '/payment/failed',
  MY_TICKETS: '/my-tickets',
  MY_TICKET_DETAIL: '/my-tickets/:id',
  ORDER_HISTORY: '/orders',
  ADMIN: '/admin',
  ADMIN_EVENT_NEW: '/admin/events/new',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_ORDERS: '/admin/orders',
  CHECK_IN: '/check-in',
} as const;

export type RouteValues = (typeof ROUTES)[keyof typeof ROUTES];

export const routePaths = {
  eventDetail: (eventId: string) => `/events/${eventId}`,
  checkout: (eventId: string, ticketTypeId?: string) => {
    const params = new URLSearchParams({ eventId });
    if (ticketTypeId) params.set('ticketTypeId', ticketTypeId);
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
};
