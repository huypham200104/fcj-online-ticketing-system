import type { BookingSession } from '@/domain/entities/BookingSession';
import type { Ticket } from '@/domain/entities/Ticket';
import type { ProcessPaymentDTO, PaymentResultDTO } from '@/application/dtos/PaymentDTO';
import type { IPaymentService } from '@/application/ports/IPaymentService';
import { delay } from '@/shared/utils/delay';
import { mockEvents } from '@/infrastructure/mocks/events.mock';
import {
  MOCK_STORAGE_KEYS,
  readMockStorage,
  writeMockStorage,
} from '@/infrastructure/storage/mockStorage';

export class MockPaymentService implements IPaymentService {
  async processPayment(dto: ProcessPaymentDTO): Promise<PaymentResultDTO> {
    await delay(520);

    const sessions = readMockStorage<BookingSession[]>(MOCK_STORAGE_KEYS.bookingSessions, []);
    const session = sessions.find((item) => item.id === dto.sessionId);

    if (!session) {
      return {
        status: 'failed',
        sessionId: dto.sessionId,
        ticketIds: [],
        reason: 'session_not_found',
        message: 'Không tìm thấy phiên giữ vé.',
      };
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      this.updateSessionStatus(sessions, session.id, 'expired');
      return {
        status: 'failed',
        sessionId: session.id,
        ticketIds: [],
        reason: 'session_expired',
        message: 'Phiên giữ vé đã hết hạn. Vé đã được mở bán lại.',
      };
    }

    if (dto.outcome === 'failed') {
      this.updateSessionStatus(sessions, session.id, 'failed');
      return {
        status: 'failed',
        sessionId: session.id,
        ticketIds: [],
        reason: 'payment_failed',
        message: 'Thanh toán thất bại. Vé đã được hoàn về kho tạm.',
      };
    }

    const event = mockEvents.find((item) => item.id === session.eventId);
    const createdTickets = Array.from({ length: session.quantity }, (_, index) => {
      const serial = `${Date.now()}-${index + 1}`;
      const ticketId = `ticket-${serial}`;
      return {
        id: ticketId,
        code: `TS-${serial}`,
        eventId: session.eventId,
        eventTitle: session.eventTitle,
        ticketTypeName: session.ticketTypeName,
        holderName: 'Demo User',
        eventDateLabel: event?.dateLabel ?? 'Đang cập nhật',
        venueName: event?.venue.name ?? 'Đang cập nhật',
        venueAddress: event?.venue.address ?? 'Đang cập nhật',
        purchasedAt: new Date().toISOString(),
        status: 'valid',
        qrValue: `ticketspace://check-in/${ticketId}`,
      } satisfies Ticket;
    });

    const storedTickets = readMockStorage<Ticket[]>(MOCK_STORAGE_KEYS.purchasedTickets, []);
    writeMockStorage(MOCK_STORAGE_KEYS.purchasedTickets, [...createdTickets, ...storedTickets]);
    this.updateSessionStatus(sessions, session.id, 'paid');

    return {
      status: 'success',
      sessionId: session.id,
      ticketIds: createdTickets.map((ticket) => ticket.id),
      message: 'Thanh toán thành công. Vé QR đã được tạo.',
    };
  }

  private updateSessionStatus(
    sessions: BookingSession[],
    sessionId: string,
    status: BookingSession['status'],
  ): void {
    const nextSessions = sessions.map((session) =>
      session.id === sessionId ? { ...session, status } : session,
    );
    writeMockStorage(MOCK_STORAGE_KEYS.bookingSessions, nextSessions);
  }
}

