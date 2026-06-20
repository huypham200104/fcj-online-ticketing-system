import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { TicketEvent } from '@/domain/entities/Event';
import type { PaginatedResult } from '@/shared/types/ApiResponse';
import { Badge } from '@/presentation/components/ui/Badge';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { PageState } from '@/presentation/components/shared/PageState';
import { ApiEventService } from '@/infrastructure/events/ApiEventService';
import { ROUTES, routePaths } from '@/presentation/router/routes';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import './EventCatalogPage.css';

interface EventCatalogPageProps {
  category: TicketEvent['category'];
}

const PAGE_SIZE = 12;
const eventService = new ApiEventService();

function formatPrice(event: TicketEvent): string {
  return event.priceFrom === 0 ? 'Miễn phí' : formatCurrency(event.priceFrom);
}

function getPageNumbers(current: number, total: number): number[] {
  const start = Math.max(1, current - 2);
  const end = Math.min(total, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function getFormatLabel(value: string): string {
  const labels: Record<string, string> = {
    standard: 'Standard',
    '2d': '2D / Standard',
    imax: 'IMAX',
    premium: 'Premium / Recliner',
    fan: 'Fan Zone',
    vip: 'VIP / Fan Zone',
  };
  return labels[value] ?? value;
}

export const EventCatalogPage: React.FC<EventCatalogPageProps> = ({ category }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(Number(searchParams.get('page') ?? '1') || 1, 1);
  const q = searchParams.get('q')?.trim() ?? '';
  const city = searchParams.get('city')?.trim() ?? '';
  const date = searchParams.get('date')?.trim() ?? '';
  const format = searchParams.get('format')?.trim() ?? '';
  const maxPrice = searchParams.get('maxPrice')?.trim() ?? '';
  const [result, setResult] = useState<PaginatedResult<TicketEvent> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMovie = category === 'Phim';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setResult(await eventService.listEventsPage(category, page, PAGE_SIZE, { q, city, date, format, maxPrice }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách sự kiện');
    } finally {
      setLoading(false);
    }
  }, [category, city, date, format, maxPrice, page, q]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [load]);

  const pageNumbers = useMemo(
    () => getPageNumbers(result?.page ?? page, result?.totalPages ?? 1),
    [page, result?.page, result?.totalPages],
  );

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(nextPage));
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({ page: '1' });
  };

  const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams({ page: '1' });

    ['q', 'city', 'date', 'format', 'maxPrice'].forEach((key) => {
      const trimmed = String(formData.get(key) ?? '').trim();
      if (trimmed) params.set(key, trimmed);
    });

    setSearchParams(params);
  };

  if (loading) {
    return (
      <MainLayout>
        <PageState variant="loading" title={isMovie ? 'Đang tải phim' : 'Đang tải concert'} />
      </MainLayout>
    );
  }

  if (error || !result) {
    return (
      <MainLayout>
        <PageState
          variant="error"
          title="Không thể tải danh sách"
          description={error ?? 'Backend chưa trả về dữ liệu.'}
          action={<button type="button" className="catalog-page__state-button" onClick={load}>Thử lại</button>}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout contentClassName="catalog-page">
      <section className="catalog-page__heading">
        <div>
          <Badge tone="primary">{isMovie ? 'Movies' : 'Live Events'}</Badge>
          <h1>{isMovie ? 'Tất cả phim đang chiếu' : 'Tất cả concert sắp diễn ra'}</h1>
          <p>
            {result.total} {isMovie ? 'bộ phim' : 'concert'} đang mở bán từ backend
            {q ? ` cho "${q}"` : ''}
            {city ? ` tại ${city}` : ''}.
          </p>
        </div>

        <div className="catalog-page__tabs" aria-label="Chọn danh mục">
          <Link className={isMovie ? 'catalog-page__tab catalog-page__tab--active' : 'catalog-page__tab'} to={ROUTES.MOVIES}>
            Phim
          </Link>
          <Link className={!isMovie ? 'catalog-page__tab catalog-page__tab--active' : 'catalog-page__tab'} to={ROUTES.CONCERTS}>
            Concert
          </Link>
        </div>
      </section>

      <form className="catalog-filter-panel" onSubmit={handleFilterSubmit} key={`${q}|${city}|${date}|${format}|${maxPrice}`}>
        <label>
          <span>Từ khóa</span>
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder={isMovie ? 'Tên phim, rạp...' : 'Tên concert, địa điểm...'}
          />
        </label>
        <label>
          <span>Thành phố</span>
          <select name="city" defaultValue={city}>
            <option value="">Tất cả</option>
            <option value="TP. HCM">TP. Hồ Chí Minh</option>
            <option value="Hà Nội">Hà Nội</option>
          </select>
        </label>
        <label>
          <span>Ngày diễn ra</span>
          <input name="date" type="date" defaultValue={date} />
        </label>
        <label>
          <span>{isMovie ? 'Định dạng' : 'Loại vé'}</span>
          <select name="format" defaultValue={format}>
            <option value="">Tất cả</option>
            {isMovie ? (
              <>
                <option value="2d">2D / Standard</option>
                <option value="imax">IMAX</option>
                <option value="premium">Premium / Recliner</option>
              </>
            ) : (
              <>
                <option value="standard">Standard</option>
                <option value="fan">Fan Zone</option>
                <option value="vip">VIP</option>
              </>
            )}
          </select>
        </label>
        <label>
          <span>Giá tối đa</span>
          <select name="maxPrice" defaultValue={maxPrice}>
            <option value="">Tất cả</option>
            {isMovie ? (
              <>
                <option value="120000">120.000đ</option>
                <option value="180000">180.000đ</option>
                <option value="250000">250.000đ</option>
              </>
            ) : (
              <>
                <option value="700000">700.000đ</option>
                <option value="1200000">1.200.000đ</option>
                <option value="2000000">2.000.000đ</option>
              </>
            )}
          </select>
        </label>
        <div className="catalog-filter-panel__actions">
          <button type="submit">Lọc</button>
          <button type="button" onClick={clearFilters}>Xóa</button>
        </div>
      </form>

      {(q || city || date || format || maxPrice) ? (
        <div className="catalog-page__filters">
          {q ? <span>Từ khóa: {q}</span> : null}
          {city ? <span>Thành phố: {city}</span> : null}
          {date ? <span>Ngày: {date}</span> : null}
          {format ? <span>{isMovie ? 'Định dạng' : 'Loại vé'}: {getFormatLabel(format)}</span> : null}
          {maxPrice ? <span>Giá tối đa: {formatCurrency(Number(maxPrice))}</span> : null}
          <button type="button" onClick={clearFilters}>Xóa lọc</button>
        </div>
      ) : null}

      <section className={isMovie ? 'catalog-grid catalog-grid--movies' : 'catalog-grid'}>
        {result.items.map((event) => (
          <article className={isMovie ? 'catalog-card catalog-card--movie' : 'catalog-card'} key={event.id}>
            <Link className="catalog-card__media" to={routePaths.eventDetail(event.id)}>
              {event.posterUrl ? <img src={event.posterUrl} alt={event.title} /> : null}
              <span>{event.category}</span>
            </Link>

            <div className="catalog-card__body">
              <div>
                <h2>{event.title}</h2>
                <p>{event.shortDescription}</p>
              </div>

              <dl>
                <div>
                  <dt>Thời gian</dt>
                  <dd>{event.dateLabel}</dd>
                </div>
                <div>
                  <dt>Địa điểm</dt>
                  <dd>{event.venue.name}</dd>
                </div>
              </dl>

              <div className="catalog-card__footer">
                <strong>{formatPrice(event)}</strong>
                <Link to={routePaths.eventDetail(event.id)}>Mua vé</Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      <nav className="catalog-pagination" aria-label="Phân trang">
        <button type="button" onClick={() => goToPage(result.page - 1)} disabled={result.page <= 1}>
          Trước
        </button>
        {pageNumbers.map((pageNumber) => (
          <button
            type="button"
            key={pageNumber}
            className={pageNumber === result.page ? 'catalog-pagination__page--active' : ''}
            onClick={() => goToPage(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <button type="button" onClick={() => goToPage(result.page + 1)} disabled={result.page >= result.totalPages}>
          Sau
        </button>
      </nav>
    </MainLayout>
  );
};
