import { beforeEach, describe, expect, it } from 'vitest';
import { CreateBookingSessionUseCase } from '@/application/use-cases/booking/CreateBookingSessionUseCase';
import { ProcessMockPaymentUseCase } from './ProcessMockPaymentUseCase';
import { MockBookingService } from '@/infrastructure/booking/MockBookingService';
import { MockPaymentService } from '@/infrastructure/payment/MockPaymentService';

describe('ProcessMockPaymentUseCase', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('creates ticket ids when mock payment succeeds', async () => {
    const session = await new CreateBookingSessionUseCase(new MockBookingService()).execute({
      eventId: 'evt-summer-vibes-2026',
      ticketTypeId: 'summer-standard',
      quantity: 2,
    });

    const result = await new ProcessMockPaymentUseCase(new MockPaymentService()).execute({
      sessionId: session.id,
      outcome: 'success',
    });

    expect(result.status).toBe('success');
    expect(result.ticketIds).toHaveLength(2);
  });

  it('returns a failed result for mock payment failure', async () => {
    const session = await new CreateBookingSessionUseCase(new MockBookingService()).execute({
      eventId: 'evt-summer-vibes-2026',
      ticketTypeId: 'summer-standard',
      quantity: 1,
    });

    const result = await new ProcessMockPaymentUseCase(new MockPaymentService()).execute({
      sessionId: session.id,
      outcome: 'failed',
    });

    expect(result.status).toBe('failed');
    expect(result.reason).toBe('payment_failed');
    expect(result.ticketIds).toHaveLength(0);
  });
});

