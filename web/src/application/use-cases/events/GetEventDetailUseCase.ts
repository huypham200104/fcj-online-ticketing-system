import type { TicketEvent } from '@/domain/entities/Event';
import type { IEventService } from '@/application/ports/IEventService';

export class GetEventDetailUseCase {
  private readonly eventService: IEventService;

  constructor(eventService: IEventService) {
    this.eventService = eventService;
  }

  execute(eventId: string): Promise<TicketEvent | null> {
    return this.eventService.getEventById(eventId);
  }
}

