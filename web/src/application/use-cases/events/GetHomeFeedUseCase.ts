import type { HomeFeed } from '@/domain/entities/Event';
import type { IEventService } from '@/application/ports/IEventService';

export class GetHomeFeedUseCase {
  private readonly eventService: IEventService;

  constructor(eventService: IEventService) {
    this.eventService = eventService;
  }

  execute(): Promise<HomeFeed> {
    return this.eventService.getHomeFeed();
  }
}

