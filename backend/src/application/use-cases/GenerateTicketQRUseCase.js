import { AppError, NotFoundError } from '../../domain/errors/AppError.js';
import crypto from 'crypto';

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

    // Generate a simple hash/payload as QR string
    const qrPayload = crypto.createHash('sha256').update(`${ticket.id}-${ticket.userId}`).digest('hex');
    
    ticket.qrCode = qrPayload;
    await this.ticketRepository.save(ticket);

    return qrPayload;
  }
}
