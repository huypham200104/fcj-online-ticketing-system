import { useCallback, useEffect, useState } from 'react';
import type { Ticket } from '@/domain/entities/Ticket';
import { GetMyTicketsUseCase } from '@/application/use-cases/tickets/GetMyTicketsUseCase';
import { ApiTicketService } from '@/infrastructure/tickets/ApiTicketService';

const getMyTicketsUseCase = new GetMyTicketsUseCase(new ApiTicketService());

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setTickets(await getMyTicketsUseCase.execute());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách vé');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [load]);

  return { tickets, loading, error, reload: load };
}
