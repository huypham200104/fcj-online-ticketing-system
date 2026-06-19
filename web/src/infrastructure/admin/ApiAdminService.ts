import { apiRequest } from '@/infrastructure/api/httpClient';

export type AdminEventStatus = 'upcoming' | 'now-showing' | 'stopped' | 'hidden';
export type AdminUserRole = 'customer' | 'staff' | 'admin';
export type AdminUserStatus = 'active' | 'locked';

export interface AdminTicketType {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  available: number;
}

export interface AdminEvent {
  id: number | string;
  name: string;
  type: 'movie' | 'concert';
  description: string;
  location: string;
  date: string;
  time: string;
  duration: number;
  image: string;
  trailerUrl: string;
  director: string;
  cast: string[];
  status: AdminEventStatus;
  hidden: boolean;
  ticketTypes: AdminTicketType[];
  priceFrom: number;
  totalStock: number;
  remainingStock: number;
  soldTickets: number;
  estimatedRevenue: number;
}

export interface AdminRoom {
  id: string;
  venueId: string;
  name: string;
  type: 'standard' | 'imax' | 'stage' | string;
  status: 'active' | 'maintenance' | string;
  rows: number;
  seatsPerRow: number;
}

export interface AdminVenue {
  id: string;
  name: string;
  address: string;
  city: string;
  status: 'active' | 'maintenance' | string;
  rooms: AdminRoom[];
}

export interface AdminShowTime {
  id: string;
  eventId: number | string;
  eventName: string;
  roomId: string;
  roomName: string;
  venueId: string | null;
  venueName: string;
  date: string;
  time: string;
  format: string;
  basePrice: number;
  status: 'scheduled' | 'cancelled' | 'sold-out' | string;
  soldTickets: number;
}

export interface AdminOrder {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  bookingSessionId: string;
  eventName: string;
  showTime: string;
  seatCount: number;
  seats: string[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
}

export interface AdminSystemStatus {
  apiStatus: 'ok' | 'degraded';
  startedAt: string;
  uptimeSeconds: number;
  requestCount: number;
  errorCount: number;
  queuePending: number;
  cloudWatchAlerts: string[];
  memoryMb: number;
}

export interface AdminOverview {
  metrics: {
    totalRevenue: number;
    paidRevenue: number;
    estimatedInventoryRevenue: number;
    events: number;
    activeEvents: number;
    ticketsSold: number;
    orders: number;
    users: number;
    staffUsers: number;
  };
  recentOrders: AdminOrder[];
  topEvents: AdminEvent[];
  system: AdminSystemStatus;
}

export interface AdminReports {
  revenueByEvent: Array<{ eventId: number | string; eventName: string; revenue: number; ticketsSold: number }>;
  revenueByVenue: Array<{ venueName: string; revenue: number }>;
  paymentStats: { success: number; failed: number; successRate: number };
  occupancy: Array<{ eventId: number | string; eventName: string; occupancyRate: number }>;
}

export interface CreateAdminEventPayload {
  name: string;
  type: 'movie' | 'concert';
  description: string;
  location: string;
  date: string;
  time: string;
  duration: number;
  image: string;
  status: AdminEventStatus;
  director?: string;
  cast?: string[];
  trailerUrl?: string;
  priceFrom?: number;
}

export class ApiAdminService {
  getOverview(): Promise<AdminOverview> {
    return apiRequest<AdminOverview>('/admin/overview');
  }

  getEvents(): Promise<AdminEvent[]> {
    return apiRequest<AdminEvent[]>('/admin/events');
  }

  createEvent(payload: CreateAdminEventPayload): Promise<AdminEvent> {
    return apiRequest<AdminEvent>('/admin/events', { method: 'POST', body: payload });
  }

  updateEvent(eventId: string | number, payload: Partial<AdminEvent>): Promise<AdminEvent> {
    return apiRequest<AdminEvent>(`/admin/events/${eventId}`, { method: 'PUT', body: payload });
  }

  hideEvent(eventId: string | number): Promise<AdminEvent> {
    return apiRequest<AdminEvent>(`/admin/events/${eventId}`, { method: 'DELETE' });
  }

  getVenues(): Promise<AdminVenue[]> {
    return apiRequest<AdminVenue[]>('/admin/venues');
  }

  createVenue(payload: Pick<AdminVenue, 'name' | 'address' | 'city'>): Promise<AdminVenue> {
    return apiRequest<AdminVenue>('/admin/venues', { method: 'POST', body: payload });
  }

  createRoom(venueId: string, payload: Pick<AdminRoom, 'name' | 'type' | 'rows' | 'seatsPerRow'>): Promise<AdminRoom> {
    return apiRequest<AdminRoom>(`/admin/venues/${venueId}/rooms`, { method: 'POST', body: payload });
  }

  updateRoom(roomId: string, payload: Partial<AdminRoom>): Promise<AdminRoom> {
    return apiRequest<AdminRoom>(`/admin/rooms/${roomId}`, { method: 'PATCH', body: payload });
  }

  getShowTimes(): Promise<AdminShowTime[]> {
    return apiRequest<AdminShowTime[]>('/admin/showtimes');
  }

  createShowTime(payload: {
    eventId: string | number;
    roomId: string;
    date: string;
    time: string;
    format: string;
    basePrice: number;
  }): Promise<AdminShowTime> {
    return apiRequest<AdminShowTime>('/admin/showtimes', { method: 'POST', body: payload });
  }

  updateShowTime(showTimeId: string, payload: Partial<AdminShowTime>): Promise<AdminShowTime> {
    return apiRequest<AdminShowTime>(`/admin/showtimes/${showTimeId}`, { method: 'PATCH', body: payload });
  }

  getOrders(params: { q?: string; status?: string } = {}): Promise<AdminOrder[]> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.status) query.set('status', params.status);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<AdminOrder[]>(`/admin/orders${suffix}`);
  }

  cancelOrder(orderId: string): Promise<AdminOrder> {
    return apiRequest<AdminOrder>(`/admin/orders/${orderId}/cancel`, { method: 'PATCH' });
  }

  getUsers(): Promise<AdminUser[]> {
    return apiRequest<AdminUser[]>('/admin/users');
  }

  updateUser(userId: string, payload: Pick<AdminUser, 'role' | 'status'>): Promise<AdminUser> {
    return apiRequest<AdminUser>(`/admin/users/${userId}`, { method: 'PATCH', body: payload });
  }

  getReports(): Promise<AdminReports> {
    return apiRequest<AdminReports>('/admin/reports');
  }

  getSystemStatus(): Promise<AdminSystemStatus> {
    return apiRequest<AdminSystemStatus>('/admin/system');
  }
}
