import type { HomeFeed, TicketEvent } from '@/domain/entities/Event';
import type { PaginatedResult } from '@/shared/types/ApiResponse';

export interface IEventService {
  getHomeFeed(): Promise<HomeFeed>;
  listEvents(): Promise<TicketEvent[]>;
  listEventsPage(
    category: TicketEvent['category'],
    page: number,
    pageSize: number,
    filters?: { q?: string; city?: string },
  ): Promise<PaginatedResult<TicketEvent>>;
  getEventById(eventId: string): Promise<TicketEvent | null>;
}
