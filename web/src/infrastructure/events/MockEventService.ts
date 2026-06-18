import type { HomeFeed, TicketEvent } from '@/domain/entities/Event';
import type { IEventService } from '@/application/ports/IEventService';
import { delay } from '@/shared/utils/delay';
import { mockEvents, mockHomeStats } from '@/infrastructure/mocks/events.mock';

export class MockEventService implements IEventService {
  async getHomeFeed(): Promise<HomeFeed> {
    await delay(260);
    return {
      events: mockEvents,
      categories: ['Tất cả', ...Array.from(new Set(mockEvents.map((event) => event.category)))],
      stats: mockHomeStats,
      featuredEvent: mockEvents[0],
    };
  }

  async listEvents(): Promise<TicketEvent[]> {
    await delay(220);
    return mockEvents;
  }

  async getEventById(eventId: string): Promise<TicketEvent | null> {
    await delay(220);
    return mockEvents.find((event) => event.id === eventId) ?? null;
  }
}

