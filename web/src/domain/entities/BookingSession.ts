export type BookingSessionStatus = 'active' | 'paid' | 'expired' | 'failed';

export interface BookingSession {
  id: string;
  eventId: string;
  eventTitle: string;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: 'VND';
  createdAt: string;
  expiresAt: string;
  status: BookingSessionStatus;
}

