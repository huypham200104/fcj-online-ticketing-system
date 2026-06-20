import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/presentation/components/ui/Badge';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { PageState } from '@/presentation/components/shared/PageState';
import { ApiOrderService, type CustomerOrderDetail } from '@/infrastructure/orders/ApiOrderService';
import { ROUTES, routePaths } from '@/presentation/router/routes';
import './OrderDetailPage.css';

const orderService = new ApiOrderService();

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}

function formatDateTime(date?: string, time?: string): string {
  if (!date) return 'Đang cập nhật';
  const parsed = new Date(`${date}T${time ?? '00:00'}:00`);
  if (Number.isNaN(parsed.getTime())) return time ? `${date} ${time}` : date;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(parsed);
}

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setOrder(await orderService.getOrder(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải chi tiết đơn hàng.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadOrder();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadOrder]);

  if (loading) {
    return (
      <MainLayout>
        <PageState variant="loading" title="Đang tải chi tiết đơn hàng" />
      </MainLayout>
    );
  }

  if (error || !order) {
    return (
      <MainLayout>
        <PageState variant="error" title="Không tìm thấy đơn hàng" description={error ?? 'Đơn hàng không tồn tại.'} action={<Link className="order-detail__button" to={ROUTES.ORDER_HISTORY}>Về lịch sử đơn</Link>} />
      </MainLayout>
    );
  }

  return (
    <MainLayout contentClassName="order-detail">
      <section className="order-detail__heading">
        <div>
          <Badge tone={order.order.status === 'paid' ? 'success' : 'warning'}>{order.order.status}</Badge>
          <h1>{order.event?.name ?? 'Chi tiết đơn hàng'}</h1>
          <p>Mã đơn {order.order.id}</p>
        </div>
        <Link to={ROUTES.ORDER_HISTORY}>Về lịch sử đơn</Link>
      </section>

      <section className="order-detail__grid">
        <article className="order-detail__panel">
          <h2>Thông tin đơn</h2>
          <dl>
            <div><dt>Thời gian</dt><dd>{formatDateTime(order.showTime?.date, order.showTime?.time)}</dd></div>
            <div><dt>Địa điểm</dt><dd>{order.venue ? `${order.venue.name}, ${order.venue.address}, ${order.venue.city}` : 'Đang cập nhật'}</dd></div>
            <div><dt>Phòng</dt><dd>{order.room?.name ?? 'Đang cập nhật'}</dd></div>
            <div><dt>Ghế</dt><dd>{order.seats.map(seat => seat.label).join(', ') || 'Không đánh số'}</dd></div>
            <div><dt>Thanh toán</dt><dd>{order.order.paymentMethod}</dd></div>
            <div><dt>Tổng tiền</dt><dd>{formatCurrency(order.order.totalAmount)}</dd></div>
          </dl>
        </article>

        <article className="order-detail__panel">
          <h2>Vé trong đơn</h2>
          <div className="order-detail__tickets">
            {order.tickets.map((ticket) => (
              <Link key={ticket.id} to={routePaths.ticketDetail(ticket.id)}>
                <strong>{ticket.id.slice(0, 8).toUpperCase()}</strong>
                <span>{ticket.status}</span>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </MainLayout>
  );
};
