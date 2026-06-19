import type { BookingSession } from '@/domain/entities/BookingSession';
import type { CreateBookingSessionDTO } from '@/application/dtos/BookingDTO';

export interface IBookingService {
  createSession(dto: CreateBookingSessionDTO): Promise<BookingSession>;
  getSession(sessionId: string): Promise<BookingSession | null>;
  cancelSession(sessionId: string): Promise<void>;
}
