import { AppError, NotFoundError } from '../../domain/errors/AppError.js';
import { createTicketQrPayload } from '../../infrastructure/security/ticketQrToken.js';

export class GenerateTicketQRUseCase {
  constructor(ticketRepository) {
    this.ticketRepository = ticketRepository;
  }

  async execute(ticketId, userId) {
    const ticket = await this.ticketRepository.findById(ticketId);
    
    if (!ticket) {
      throw new NotFoundError('Ticket');
    }

    if (ticket.userId !== userId) {
      throw new AppError('Bạn không có quyền truy cập vé này', 403);
    }

    if (ticket.qrCode) {
      return ticket.qrCode;
    }

    const qrPayload = createTicketQrPayload(ticket.id, ticket.userId);
    
    ticket.qrCode = qrPayload;
    await this.ticketRepository.save(ticket);

    return qrPayload;
  }
}
