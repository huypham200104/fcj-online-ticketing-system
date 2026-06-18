import type { Ticket } from '@/domain/entities/Ticket';
import type { ITicketService } from '@/application/ports/ITicketService';

export class GetTicketDetailUseCase {
  private readonly ticketService: ITicketService;

  constructor(ticketService: ITicketService) {
    this.ticketService = ticketService;
  }

  execute(ticketId: string): Promise<Ticket | null> {
    return this.ticketService.getTicketById(ticketId);
  }
}

