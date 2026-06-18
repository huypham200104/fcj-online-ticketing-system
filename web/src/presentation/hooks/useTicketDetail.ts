import { useCallback, useEffect, useState } from 'react';
import type { Ticket } from '@/domain/entities/Ticket';
import { GetTicketDetailUseCase } from '@/application/use-cases/tickets/GetTicketDetailUseCase';
import { MockTicketService } from '@/infrastructure/tickets/MockTicketService';

const getTicketDetailUseCase = new GetTicketDetailUseCase(new MockTicketService());

export function useTicketDetail(ticketId?: string) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(Boolean(ticketId));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!ticketId) {
      setTicket(null);
      setLoading(false);
      setError('Thiếu mã vé');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getTicketDetailUseCase.execute(ticketId);
      if (!result) {
        setError('Không tìm thấy vé');
      }
      setTicket(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải chi tiết vé');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [load]);

  return { ticket, loading, error, reload: load };
}
