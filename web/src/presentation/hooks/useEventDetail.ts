import { useCallback, useEffect, useState } from 'react';
import type { TicketEvent } from '@/domain/entities/Event';
import { GetEventDetailUseCase } from '@/application/use-cases/events/GetEventDetailUseCase';
import { MockEventService } from '@/infrastructure/events/MockEventService';

const getEventDetailUseCase = new GetEventDetailUseCase(new MockEventService());

export function useEventDetail(eventId?: string) {
  const [event, setEvent] = useState<TicketEvent | null>(null);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!eventId) {
      setEvent(null);
      setLoading(false);
      setError('Thiếu mã sự kiện');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getEventDetailUseCase.execute(eventId);
      if (!result) {
        setError('Không tìm thấy sự kiện');
      }
      setEvent(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải chi tiết sự kiện');
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
