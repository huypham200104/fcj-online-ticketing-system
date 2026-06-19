import { useCallback, useEffect, useState } from 'react';
import type { TicketEvent } from '@/domain/entities/Event';
import { GetEventDetailUseCase } from '@/application/use-cases/events/GetEventDetailUseCase';
import { ApiEventService } from '@/infrastructure/events/ApiEventService';

const getEventDetailUseCase = new GetEventDetailUseCase(new ApiEventService());

export function useEventDetail(eventId?: string) {
  const [event, setEvent] = useState<TicketEvent | null>(null);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!eventId) {
      setEvent(null);
      setLoading(false);
      setError('Thiếu mã phim hoặc concert');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getEventDetailUseCase.execute(eventId);
      if (!result) {
        setError('Không tìm thấy phim hoặc concert');
      }
      setEvent(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải chi tiết vé');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [load]);

  return { event, loading, error, reload: load };
}
