import type { BookingSession } from '@/domain/entities/BookingSession';
import type { IBookingService } from '@/application/ports/IBookingService';

export class GetBookingSessionUseCase {
  private readonly bookingService: IBookingService;

  constructor(bookingService: IBookingService) {
    this.bookingService = bookingService;
  }

  execute(sessionId: string): Promise<BookingSession | null> {
    return this.bookingService.getSession(sessionId);
  }
}

