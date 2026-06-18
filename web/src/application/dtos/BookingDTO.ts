import type { BookingSession } from '@/domain/entities/BookingSession';

export interface CreateBookingSessionDTO {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
}

export type BookingSessionDTO = BookingSession;

