import { describe, expect, it } from 'vitest';
import type { ProcessPaymentDTO, PaymentResultDTO } from '@/application/dtos/PaymentDTO';
import type { IPaymentService } from '@/application/ports/IPaymentService';
import { ProcessPaymentUseCase } from './ProcessPaymentUseCase';

class SuccessfulPaymentService implements IPaymentService {
  async processPayment(dto: ProcessPaymentDTO): Promise<PaymentResultDTO> {
    return {
      status: 'success',
      sessionId: dto.sessionId,
      ticketIds: ['ticket-1', 'ticket-2'],
      message: 'Thanh toán thành công.',
    };
  }
}

class FailedPaymentService implements IPaymentService {
  async processPayment(dto: ProcessPaymentDTO): Promise<PaymentResultDTO> {
    return {
      status: 'failed',
      sessionId: dto.sessionId,
      ticketIds: [],
      reason: 'payment_failed',
      message: 'Thanh toán thất bại.',
    };
  }
}

describe('ProcessPaymentUseCase', () => {
  it('returns ticket ids when payment succeeds', async () => {
    const result = await new ProcessPaymentUseCase(new SuccessfulPaymentService()).execute({
      sessionId: 'session-1',
      totalAmount: 200000,
    });

    expect(result.status).toBe('success');
    expect(result.ticketIds).toHaveLength(2);
  });

  it('returns a failed result when payment service rejects the payment', async () => {
    const result = await new ProcessPaymentUseCase(new FailedPaymentService()).execute({
      sessionId: 'session-1',
      totalAmount: 200000,
    });

    expect(result.status).toBe('failed');
    expect(result.reason).toBe('payment_failed');
    expect(result.ticketIds).toHaveLength(0);
  });
});
