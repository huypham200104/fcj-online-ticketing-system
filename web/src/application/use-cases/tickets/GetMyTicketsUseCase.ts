import type { Ticket } from '@/domain/entities/Ticket';
import type { ITicketService } from '@/application/ports/ITicketService';

export class GetMyTicketsUseCase {
  private readonly ticketService: ITicketService;

  constructor(ticketService: ITicketService) {
    this.ticketService = ticketService;
  }

  execute(): Promise<Ticket[]> {
    return this.ticketService.listMyTickets();
  }
}

