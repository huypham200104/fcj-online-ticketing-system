import type { BookingSession } from '@/domain/entities/BookingSession';
import type { CreateBookingSessionDTO } from '@/application/dtos/BookingDTO';
import type { IBookingService } from '@/application/ports/IBookingService';

export class CreateBookingSessionUseCase {
  private readonly bookingService: IBookingService;

  constructor(bookingService: IBookingService) {
    this.bookingService = bookingService;
  }

  async execute(dto: CreateBookingSessionDTO): Promise<BookingSession> {
    if (!dto.eventId || !dto.ticketTypeId) {
      throw new Error('Missing event or ticket type');
    }
    if (!Number.isInteger(dto.quantity) || dto.quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    return this.bookingService.createSession(dto);
  }
}
