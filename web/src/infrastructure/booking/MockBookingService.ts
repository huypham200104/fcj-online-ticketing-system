import type { BookingSession } from '@/domain/entities/BookingSession';
import type { CreateBookingSessionDTO } from '@/application/dtos/BookingDTO';
import type { IBookingService } from '@/application/ports/IBookingService';
import { delay } from '@/shared/utils/delay';
import { mockEvents } from '@/infrastructure/mocks/events.mock';
import {
  MOCK_STORAGE_KEYS,
  readMockStorage,
  writeMockStorage,
} from '@/infrastructure/storage/mockStorage';

const SESSION_TTL_MS = 10 * 60 * 1000;

export class MockBookingService implements IBookingService {
  async createSession(dto: CreateBookingSessionDTO): Promise<BookingSession> {
    await delay(300);

    const event = mockEvents.find((item) => item.id === dto.eventId);
    const ticketType = event?.ticketTypes.find((item) => item.id === dto.ticketTypeId);

    if (!event || !ticketType) {
      throw new Error('Event or ticket type was not found');
    }

    if (dto.quantity > ticketType.maxPerOrder) {
      throw new Error(`Bạn chỉ có thể đặt tối đa ${ticketType.maxPerOrder} vé cho hạng này`);
    }

    if (dto.quantity > ticketType.remainingStock) {
      throw new Error('Không đủ vé để giữ chỗ');
    }

    const now = new Date();
    const session: BookingSession = {
      id: `session-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      ticketTypeId: ticketType.id,
      ticketTypeName: ticketType.name,
      quantity: dto.quantity,
      unitPrice: ticketType.price,
      totalPrice: ticketType.price * dto.quantity,
      currency: 'VND',
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
      status: 'active',
    };

    const sessions = readMockStorage<BookingSession[]>(MOCK_STORAGE_KEYS.bookingSessions, []);
    writeMockStorage(MOCK_STORAGE_KEYS.bookingSessions, [session, ...sessions]);
    return session;
  }

  async getSession(sessionId: string): Promise<BookingSession | null> {
    await delay(120);
    const sessions = readMockStorage<BookingSession[]>(MOCK_STORAGE_KEYS.bookingSessions, []);
    return sessions.find((session) => session.id === sessionId) ?? null;
  }
}

