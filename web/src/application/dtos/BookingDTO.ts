import type { BookingSession } from '@/domain/entities/BookingSession';

export interface CreateBookingSessionDTO {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  cinemaId?: string;
  showtimeId?: string;
  seatIds?: string[];
}

export type BookingSessionDTO = BookingSession;
