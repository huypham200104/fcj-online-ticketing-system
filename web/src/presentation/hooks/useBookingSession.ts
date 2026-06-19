import { useCallback, useState } from 'react';
import type { BookingSession } from '@/domain/entities/BookingSession';
import type { CreateBookingSessionDTO } from '@/application/dtos/BookingDTO';
import { CreateBookingSessionUseCase } from '@/application/use-cases/booking/CreateBookingSessionUseCase';
import { ApiBookingService } from '@/infrastructure/booking/ApiBookingService';

const bookingService = new ApiBookingService();
const createBookingSessionUseCase = new CreateBookingSessionUseCase(bookingService);

export function useBookingSession() {
  const [session, setSession] = useState<BookingSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (dto: CreateBookingSessionDTO) => {
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
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  const cancelSession = useCallback(async () => {
    if (!session) {
      clearSession();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await bookingService.cancelSession(session.id);
      clearSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể hủy phiên giữ vé');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearSession, session]);

  return { session, loading, error, createSession, clearSession, cancelSession };
}
