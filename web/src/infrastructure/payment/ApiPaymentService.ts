import type { ProcessPaymentDTO, PaymentResultDTO } from '@/application/dtos/PaymentDTO';
import type { IPaymentService } from '@/application/ports/IPaymentService';
import { ApiClientError, apiRequest } from '@/infrastructure/api/httpClient';
import type { BackendOrder, BackendTicket } from '@/infrastructure/api/backendTypes';

interface CheckoutResponse {
  order: BackendOrder;
  tickets: BackendTicket[];
}

function toFailureReason(statusCode: number): PaymentResultDTO['reason'] {
  if (statusCode === 404) return 'session_not_found';
  if (statusCode === 400) return 'session_expired';
  return 'payment_failed';
}

export class ApiPaymentService implements IPaymentService {
  async processPayment(dto: ProcessPaymentDTO): Promise<PaymentResultDTO> {
    try {
      const result = await apiRequest<CheckoutResponse>('/bookings/checkout', {
        method: 'POST',
        headers: {
          'Idempotency-Key': `checkout:${dto.sessionId}`,
        },
        body: {
          bookingSessionId: dto.sessionId,
          paymentMethod: dto.paymentMethod ?? 'card',
          totalAmount: dto.totalAmount,
        },
      });

      return {
        status: 'success',
        sessionId: dto.sessionId,
        ticketIds: result.tickets.map((ticket) => ticket.id),
        message: 'Thanh toán thành công. Vé QR đã được tạo từ backend.',
      };
    } catch (error) {
      if (error instanceof ApiClientError) {
        return {
          status: 'failed',
          sessionId: dto.sessionId,
          ticketIds: [],
          reason: toFailureReason(error.statusCode),
          message: error.message,
        };
      }

      throw error;
    }
  }
}
