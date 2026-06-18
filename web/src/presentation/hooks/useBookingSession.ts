import { useState } from 'react';
import type { BookingSession } from '@/domain/entities/BookingSession';
import type { CreateBookingSessionDTO } from '@/application/dtos/BookingDTO';
import { CreateBookingSessionUseCase } from '@/application/use-cases/booking/CreateBookingSessionUseCase';
import { MockBookingService } from '@/infrastructure/booking/MockBookingService';

const createBookingSessionUseCase = new CreateBookingSessionUseCase(new MockBookingService());

export function useBookingSession() {
  const [session, setSession] = useState<BookingSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = async (dto: CreateBookingSessionDTO) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createBookingSessionUseCase.execute(dto);
      setSession(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo phiên giữ vé');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearSession = () => {
    setSession(null);
    setError(null);
  };

  return { session, loading, error, createSession, clearSession };
}

