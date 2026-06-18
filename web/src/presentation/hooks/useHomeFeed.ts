import { useCallback, useEffect, useState } from 'react';
import type { HomeFeed } from '@/domain/entities/Event';
import { GetHomeFeedUseCase } from '@/application/use-cases/events/GetHomeFeedUseCase';
import { MockEventService } from '@/infrastructure/events/MockEventService';

const getHomeFeedUseCase = new GetHomeFeedUseCase(new MockEventService());

export function useHomeFeed() {
  const [data, setData] = useState<HomeFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setData(await getHomeFeedUseCase.execute());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách sự kiện');
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

  return { data, loading, error, reload: load };
}
