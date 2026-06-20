import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/presentation/components/ui/Badge';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { PageState } from '@/presentation/components/shared/PageState';
import { ApiOrderService, type CustomerOrderDetail } from '@/infrastructure/orders/ApiOrderService';
import { ROUTES, routePaths } from '@/presentation/router/routes';
import './MyOrdersPage.css';

const orderService = new ApiOrderService();

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}

function formatShowTime(order: CustomerOrderDetail): string {
  if (!order.showTime) return 'Đang cập nhật';
  const parsed = new Date(`${order.showTime.date}T${order.showTime.time}:00`);
  if (Number.isNaN(parsed.getTime())) return `${order.showTime.date} ${order.showTime.time}`;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(parsed);
}

export const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await orderService.listMyOrders());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch sử đơn hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadOrders]);

  const totalPaid = useMemo(
    () => orders.filter(item => item.order.status === 'paid').reduce((sum, item) => sum + item.order.totalAmount, 0),
    [orders],
  );

  if (loading) {
    return (
      <MainLayout>
        <PageState variant="loading" title="Đang tải lịch sử đơn hàng" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <PageState variant="error" title="Không thể tải đơn hàng" description={error} action={<button className="my-orders__state-button" onClick={() => void loadOrders()}>Thử lại</button>} />
      </MainLayout>
    );
  }

  return (
    <MainLayout contentClassName="my-orders">
      <section className="my-orders__heading">
        <div>
          <Badge tone="primary">Lịch sử giao dịch</Badge>
          <h1>Đơn hàng của tôi</h1>
          <p>Theo dõi trạng thái thanh toán, tổng tiền và các vé được tạo từ từng đơn.</p>
        </div>
        <div className="my-orders__total">
          <span>Đã thanh toán</span>
          <strong>{formatCurrency(totalPaid)}</strong>
        </div>
      </section>

      {orders.length === 0 ? (
        <PageState
          variant="empty"
          title="Bạn chưa có đơn hàng"
          description="Hãy đặt vé cho phim hoặc concert đang mở bán."
          action={<Link className="my-orders__state-button" to={ROUTES.EVENTS}>Xem phim & concert</Link>}
        />
      ) : (
        <section className="my-orders__list">
          {orders.map((item) => (
            <article className="my-order-card" key={item.order.id}>
              <div>
                <Badge tone={item.order.status === 'paid' ? 'success' : item.order.status === 'cancelled' ? 'error' : 'warning'}>{item.order.status}</Badge>
                <h2>{item.event?.name ?? 'Sự kiện'}</h2>
                <p>{item.venue?.name ?? item.event?.location ?? 'Đang cập nhật'} · {formatShowTime(item)}</p>
              </div>
              <dl>
                <div><dt>Mã đơn</dt><dd>{item.order.id.slice(0, 8).toUpperCase()}</dd></div>
                <div><dt>Ghế</dt><dd>{item.seats.map(seat => seat.label).join(', ') || 'Không đánh số'}</dd></div>
                <div><dt>Số vé</dt><dd>{item.tickets.length}</dd></div>
                <div><dt>Tổng tiền</dt><dd>{formatCurrency(item.order.totalAmount)}</dd></div>
              </dl>
              <Link to={routePaths.orderDetail(item.order.id)}>Xem chi tiết</Link>
            </article>
          ))}
        </section>
      )}
    </MainLayout>
  );
};
