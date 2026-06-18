import { beforeEach, describe, expect, it } from 'vitest';
import { CreateBookingSessionUseCase } from './CreateBookingSessionUseCase';
import { MockBookingService } from '@/infrastructure/booking/MockBookingService';

describe('CreateBookingSessionUseCase', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('creates an active booking session with TTL metadata', async () => {
    const useCase = new CreateBookingSessionUseCase(new MockBookingService());

    const session = await useCase.execute({
      eventId: 'evt-summer-vibes-2026',
      ticketTypeId: 'summer-standard',
      quantity: 2,
    });

    expect(session.status).toBe('active');
    expect(session.quantity).toBe(2);
    expect(session.totalPrice).toBe(1380000);
    expect(new Date(session.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('rejects invalid quantity before reaching the service', async () => {
    const useCase = new CreateBookingSessionUseCase(new MockBookingService());

    await expect(
      useCase.execute({
        eventId: 'evt-summer-vibes-2026',
        ticketTypeId: 'summer-standard',
        quantity: 0,
      }),
    ).rejects.toThrow('Quantity must be at least 1');
  });
});

