import type { HomeFeed, TicketEvent } from '@/domain/entities/Event';

export interface IEventService {
  getHomeFeed(): Promise<HomeFeed>;
  listEvents(): Promise<TicketEvent[]>;
  getEventById(eventId: string): Promise<TicketEvent | null>;
}

