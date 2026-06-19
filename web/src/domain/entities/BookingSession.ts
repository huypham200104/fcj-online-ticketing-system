export type BookingSessionStatus = 'active' | 'paid' | 'expired' | 'failed';

export interface BookingSession {
  id: string;
  eventId: string;
  eventTitle: string;
  ticketTypeId: string;
  ticketTypeName: string;
  cinemaId?: string;
  cinemaName?: string;
  cinemaAddress?: string;
  showtimeId?: string;
  showtimeLabel?: string;
  hallName?: string;
  seatIds?: string[];
  seatLabels?: string[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: 'VND';
  createdAt: string;
  expiresAt: string;
  status: BookingSessionStatus;
}
