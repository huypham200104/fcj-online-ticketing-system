import { describe, expect, it } from 'vitest';
import type { CreateBookingSessionDTO } from '@/application/dtos/BookingDTO';
import type { BookingSession } from '@/domain/entities/BookingSession';
import type { IBookingService } from '@/application/ports/IBookingService';
import { CreateBookingSessionUseCase } from './CreateBookingSessionUseCase';

class FakeBookingService implements IBookingService {
  async createSession(dto: CreateBookingSessionDTO): Promise<BookingSession> {
    return {
      id: 'session-1',
      eventId: dto.eventId,
      eventTitle: 'Phim CGV Premiere',
      ticketTypeId: dto.ticketTypeId,
      ticketTypeName: 'Ghế thường',
      cinemaId: dto.cinemaId,
      cinemaName: 'CGV Landmark 81',
      showtimeId: dto.showtimeId,
      showtimeLabel: '20/12/2026, 20:00',
      hallName: 'Cinema 1',
      seatIds: dto.seatIds,
      seatLabels: ['A1', 'A2'],
      quantity: dto.quantity,
      unitPrice: 100000,
      totalPrice: 200000,
      currency: 'VND',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 600000).toISOString(),
      status: 'active',
    };
  }

  async getSession(): Promise<BookingSession | null> {
    return null;
  }

  async cancelSession(): Promise<void> {
    return undefined;
  }
}

describe('CreateBookingSessionUseCase', () => {
  it('creates an active booking session with TTL metadata', async () => {
    const useCase = new CreateBookingSessionUseCase(new FakeBookingService());

    const session = await useCase.execute({
      eventId: '2',
      ticketTypeId: '4',
      cinemaId: 'cgv-landmark-81',
      showtimeId: 'st2',
      seatIds: ['seat-r1-A1', 'seat-r1-A2'],
      quantity: 2,
    });

    expect(session.status).toBe('active');
    expect(session.quantity).toBe(2);
    expect(session.totalPrice).toBe(200000);
    expect(session.cinemaName).toBe('CGV Landmark 81');
    expect(session.seatLabels).toEqual(['A1', 'A2']);
    expect(new Date(session.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('rejects invalid quantity before reaching the service', async () => {
    const useCase = new CreateBookingSessionUseCase(new FakeBookingService());

    await expect(
      useCase.execute({
        eventId: '2',
        ticketTypeId: '4',
        quantity: 0,
      }),
    ).rejects.toThrow('Quantity must be at least 1');
  });
});
