import type { Ticket } from '@/domain/entities/Ticket';
import type { ITicketService } from '@/application/ports/ITicketService';
import { delay } from '@/shared/utils/delay';
import { mockTickets } from '@/infrastructure/mocks/tickets.mock';
import {
  MOCK_STORAGE_KEYS,
  readMockStorage,
} from '@/infrastructure/storage/mockStorage';

export class MockTicketService implements ITicketService {
  async listMyTickets(): Promise<Ticket[]> {
    await delay(240);
    const purchasedTickets = readMockStorage<Ticket[]>(MOCK_STORAGE_KEYS.purchasedTickets, []);
    return [...purchasedTickets, ...mockTickets];
  }

  async getTicketById(ticketId: string): Promise<Ticket | null> {
    await delay(180);
    const tickets = await this.listMyTickets();
    return tickets.find((ticket) => ticket.id === ticketId) ?? null;
  }
}

