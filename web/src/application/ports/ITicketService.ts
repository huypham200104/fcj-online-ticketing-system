import type { Ticket } from '@/domain/entities/Ticket';

export interface ITicketService {
  listMyTickets(): Promise<Ticket[]>;
  getTicketById(ticketId: string): Promise<Ticket | null>;
}

