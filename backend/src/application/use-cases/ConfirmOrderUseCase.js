import { Order } from '../../domain/entities/Order.js';
import { Ticket } from '../../domain/entities/Ticket.js';
import { AppError } from '../../domain/errors/AppError.js';
import crypto from 'crypto';

const SEAT_HOLD_EXPIRED_MESSAGE = 'Đã hết 15 phút giữ ghế, vui lòng đặt lại.';

function createTicketQrPayload(ticketId, userId) {
  return crypto.createHash('sha256').update(`${ticketId}-${userId}`).digest('hex');
}

export class ConfirmOrderUseCase {
  constructor(bookingRepository, orderRepository, ticketRepository) {
    this.bookingRepository = bookingRepository;
    this.orderRepository = orderRepository;
    this.ticketRepository = ticketRepository;
  }

  async ensureSessionCanCheckout(bookingSessionId) {
    const session = await this.bookingRepository.findById(bookingSessionId);
    
    if (!session) {
      throw new AppError('Không tìm thấy phiên giao dịch', 404);
    }

    if (session.isExpired()) {
      session.status = 'expired';
      await this.bookingRepository.save(session);
      throw new AppError(SEAT_HOLD_EXPIRED_MESSAGE, 400);
    }

    if (session.status !== 'pending') {
      throw new AppError('Phiên giao dịch đã được xử lý. Vui lòng đặt lại.', 400);
    }

    return session;
  }

  async execute({ bookingSessionId, totalAmount, paymentMethod }) {
    const session = await this.ensureSessionCanCheckout(bookingSessionId);

    // Đánh dấu session là thành công
    session.status = 'confirmed';
    await this.bookingRepository.save(session);

    // Tạo Order
    const newOrder = new Order({
      id: crypto.randomUUID(),
      userId: session.userId,
      bookingSessionId: session.id,
      totalAmount,
      status: 'paid',
      paymentMethod
    });

    await this.orderRepository.save(newOrder);

    const tickets = await Promise.all(
      session.seatIds.map(async (seatId) => {
        const ticketId = crypto.randomUUID();
        const ticket = new Ticket({
          id: ticketId,
          orderId: newOrder.id,
          userId: session.userId,
          showTimeId: session.showTimeId,
          seatId,
          status: 'valid',
          qrCode: createTicketQrPayload(ticketId, session.userId)
        });

        return this.ticketRepository.save(ticket);
      })
    );

    return { order: newOrder, tickets };
  }
}
