import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ApiAdminService,
  type AdminEvent,
  type AdminEventStatus,
  type AdminOrder,
  type AdminOverview,
  type AdminReports,
  type AdminRoom,
  type AdminShowTime,
  type AdminSystemStatus,
  type AdminUser,
  type AdminUserRole,
  type AdminUserStatus,
  type AdminVenue,
  type CreateAdminEventPayload,
} from '@/infrastructure/admin/ApiAdminService';
import { getAuthSession } from '@/infrastructure/api/authSession';
import { AccountMenu } from '@/presentation/components/shared/AccountMenu';
import { ROUTES } from '@/presentation/router/routes';
import './AdminPage.css';

const adminService = new ApiAdminService();

type AdminTab = 'overview' | 'events' | 'venues' | 'showtimes' | 'orders' | 'users' | 'reports' | 'system';

const tabs: Array<{ key: AdminTab; label: string }> = [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'events', label: 'Phim & sự kiện' },
  { key: 'venues', label: 'Rạp & phòng' },
  { key: 'showtimes', label: 'Suất chiếu' },
  { key: 'orders', label: 'Đơn hàng' },
  { key: 'users', label: 'Người dùng' },
  { key: 'reports', label: 'Báo cáo' },
  { key: 'system', label: 'Hệ thống' },
];

const eventStatusLabels: Record<AdminEventStatus, string> = {
  upcoming: 'Sắp chiếu',
  'now-showing': 'Đang chiếu',
  stopped: 'Ngừng chiếu',
  hidden: 'Đã ẩn',
};

const EVENT_PAGE_SIZE = 8;
const VENUE_PAGE_SIZE = 6;
const SHOWTIME_PAGE_SIZE = 10;
const ORDER_PAGE_SIZE = 10;
const USER_PAGE_SIZE = 10;

function getPageNumbers(current: number, total: number): number[] {
  const start = Math.max(1, Math.min(current - 2, total - 4));
  const end = Math.min(total, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function getPageSlice<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value?: string): string {
  if (!value) return 'Đang cập nhật';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

function getPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(Math.round((value / total) * 100), 100));
}

function downloadCsv(filename: string, rows: string[][]): void {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const initialEventForm: CreateAdminEventPayload = {
  name: '',
  type: 'movie',
  description: '',
  location: '',
  date: '',
  time: '',
  duration: 120,
  image: '',
  status: 'upcoming',
  director: '',
  cast: [],
  trailerUrl: '',
  priceFrom: 120000,
};

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [session] = useState(() => getAuthSession());
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [venues, setVenues] = useState<AdminVenue[]>([]);
  const [showTimes, setShowTimes] = useState<AdminShowTime[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReports | null>(null);
  const [system, setSystem] = useState<AdminSystemStatus | null>(null);
  const [eventForm, setEventForm] = useState<CreateAdminEventPayload>(initialEventForm);
  const [eventPage, setEventPage] = useState(1);
  const [venuePage, setVenuePage] = useState(1);
  const [showTimePage, setShowTimePage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [venueForm, setVenueForm] = useState({ name: '', address: '', city: '' });
  const [roomForm, setRoomForm] = useState({ venueId: '', name: '', type: 'standard', rows: 6, seatsPerRow: 12 });
  const [showTimeForm, setShowTimeForm] = useState({
    eventId: '',
    roomId: '',
    date: '',
    time: '',
    format: '2D',
    basePrice: 120000,
  });
  const [orderFilter, setOrderFilter] = useState({ q: '', status: '' });

  const rooms = useMemo(() => venues.flatMap((venue) => venue.rooms.map((room) => ({ ...room, venueName: venue.name }))), [venues]);
  const eventTotalPages = useMemo(() => Math.max(Math.ceil(events.length / EVENT_PAGE_SIZE), 1), [events.length]);
  const safeEventPage = Math.min(eventPage, eventTotalPages);
  const paginatedEvents = useMemo(() => getPageSlice(events, safeEventPage, EVENT_PAGE_SIZE), [events, safeEventPage]);
  const eventStart = events.length === 0 ? 0 : (safeEventPage - 1) * EVENT_PAGE_SIZE + 1;
  const eventEnd = Math.min(safeEventPage * EVENT_PAGE_SIZE, events.length);
  const venueTotalPages = useMemo(() => Math.max(Math.ceil(venues.length / VENUE_PAGE_SIZE), 1), [venues.length]);
  const safeVenuePage = Math.min(venuePage, venueTotalPages);
  const paginatedVenues = useMemo(() => getPageSlice(venues, safeVenuePage, VENUE_PAGE_SIZE), [safeVenuePage, venues]);
  const venueStart = venues.length === 0 ? 0 : (safeVenuePage - 1) * VENUE_PAGE_SIZE + 1;
  const venueEnd = Math.min(safeVenuePage * VENUE_PAGE_SIZE, venues.length);
  const showTimeTotalPages = useMemo(() => Math.max(Math.ceil(showTimes.length / SHOWTIME_PAGE_SIZE), 1), [showTimes.length]);
  const safeShowTimePage = Math.min(showTimePage, showTimeTotalPages);
  const paginatedShowTimes = useMemo(() => getPageSlice(showTimes, safeShowTimePage, SHOWTIME_PAGE_SIZE), [safeShowTimePage, showTimes]);
  const showTimeStart = showTimes.length === 0 ? 0 : (safeShowTimePage - 1) * SHOWTIME_PAGE_SIZE + 1;
  const showTimeEnd = Math.min(safeShowTimePage * SHOWTIME_PAGE_SIZE, showTimes.length);
  const orderTotalPages = useMemo(() => Math.max(Math.ceil(orders.length / ORDER_PAGE_SIZE), 1), [orders.length]);
  const safeOrderPage = Math.min(orderPage, orderTotalPages);
  const paginatedOrders = useMemo(() => getPageSlice(orders, safeOrderPage, ORDER_PAGE_SIZE), [orders, safeOrderPage]);
  const orderStart = orders.length === 0 ? 0 : (safeOrderPage - 1) * ORDER_PAGE_SIZE + 1;
  const orderEnd = Math.min(safeOrderPage * ORDER_PAGE_SIZE, orders.length);
  const userTotalPages = useMemo(() => Math.max(Math.ceil(users.length / USER_PAGE_SIZE), 1), [users.length]);
  const safeUserPage = Math.min(userPage, userTotalPages);
  const paginatedUsers = useMemo(() => getPageSlice(users, safeUserPage, USER_PAGE_SIZE), [safeUserPage, users]);
  const userStart = users.length === 0 ? 0 : (safeUserPage - 1) * USER_PAGE_SIZE + 1;
  const userEnd = Math.min(safeUserPage * USER_PAGE_SIZE, users.length);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, eventData, venueData, showTimeData, orderData, userData, reportData, systemData] =
        await Promise.all([
          adminService.getOverview(),
          adminService.getEvents(),
          adminService.getVenues(),
          adminService.getShowTimes(),
          adminService.getOrders(),
          adminService.getUsers(),
          adminService.getReports(),
          adminService.getSystemStatus(),
        ]);

      setOverview(overviewData);
      setEvents(eventData);
      setVenues(venueData);
      setShowTimes(showTimeData);
      setOrders(orderData);
      setUsers(userData);
      setReports(reportData);
      setSystem(systemData);
      setRoomForm((prev) => ({ ...prev, venueId: prev.venueId || venueData[0]?.id || '' }));
      setShowTimeForm((prev) => ({
        ...prev,
        eventId: prev.eventId || String(eventData[0]?.id ?? ''),
        roomId: prev.roomId || venueData[0]?.rooms[0]?.id || '',
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session) {
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    if (session.user.role !== 'admin') {
      navigate(ROUTES.EVENTS, { replace: true });
      return;
    }

    const loadTimer = window.setTimeout(() => {
      void loadAdminData();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadAdminData, navigate, session]);

  const refreshOrders = async () => {
    const data = await adminService.getOrders(orderFilter);
    setOrders(data);
    setOrderPage(1);
  };

  const runAction = async (action: () => Promise<void>) => {
    setActionLoading(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thao tác thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateEvent = (event: React.FormEvent) => {
    event.preventDefault();
    void runAction(async () => {
      const created = await adminService.createEvent(eventForm);
      setEvents((prev) => [created, ...prev]);
      setEventPage(1);
      setEventForm(initialEventForm);
      const [overviewData, reportsData] = await Promise.all([adminService.getOverview(), adminService.getReports()]);
      setOverview(overviewData);
      setReports(reportsData);
    });
  };

  const handleEventStatus = (eventItem: AdminEvent, status: AdminEventStatus) => {
    void runAction(async () => {
      const updated = await adminService.updateEvent(eventItem.id, { status });
      setEvents((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    });
  };

  const handleHideEvent = (eventItem: AdminEvent) => {
    void runAction(async () => {
      const updated = await adminService.hideEvent(eventItem.id);
      setEvents((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    });
  };

  const handleRestoreEvent = (eventItem: AdminEvent) => {
    void runAction(async () => {
      const updated = await adminService.updateEvent(eventItem.id, { status: 'upcoming', hidden: false });
      setEvents((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    });
  };

  const handleCreateVenue = (event: React.FormEvent) => {
    event.preventDefault();
    void runAction(async () => {
      await adminService.createVenue(venueForm);
      setVenueForm({ name: '', address: '', city: '' });
      setVenues(await adminService.getVenues());
      setVenuePage(1);
    });
  };

  const handleCreateRoom = (event: React.FormEvent) => {
    event.preventDefault();
    void runAction(async () => {
      const venueId = roomForm.venueId || venues[0]?.id;
      if (!venueId) throw new Error('Chưa có rạp để tạo phòng.');
      await adminService.createRoom(venueId, roomForm);
      setRoomForm((prev) => ({ ...prev, name: '' }));
      setVenues(await adminService.getVenues());
    });
  };

  const handleRoomStatus = (room: AdminRoom, status: string) => {
    void runAction(async () => {
      await adminService.updateRoom(room.id, { status });
      setVenues(await adminService.getVenues());
    });
  };

  const handleCreateShowTime = (event: React.FormEvent) => {
    event.preventDefault();
    void runAction(async () => {
      const payload = {
        ...showTimeForm,
        eventId: showTimeForm.eventId || events[0]?.id,
        roomId: showTimeForm.roomId || rooms[0]?.id || '',
      };
      const created = await adminService.createShowTime(payload);
      setShowTimes((prev) => [created, ...prev]);
      setShowTimePage(1);
      setShowTimeForm((prev) => ({ ...prev, date: '', time: '' }));
    });
  };

  const handleShowTimeStatus = (showTime: AdminShowTime, status: string) => {
    void runAction(async () => {
      const updated = await adminService.updateShowTime(showTime.id, { status });
      setShowTimes((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    });
  };

  const handleCancelOrder = (order: AdminOrder) => {
    void runAction(async () => {
      const updated = await adminService.cancelOrder(order.id);
      setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setOverview(await adminService.getOverview());
    });
  };

  const handleUserUpdate = (user: AdminUser, updates: { role?: AdminUserRole; status?: AdminUserStatus }) => {
    void runAction(async () => {
      const updated = await adminService.updateUser(user.id, {
        role: updates.role ?? user.role,
        status: updates.status ?? user.status,
      });
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    });
  };

  const handleExportOrders = () => {
    downloadCsv('orders.csv', [
      ['Mã đơn', 'Khách hàng', 'Email', 'Sự kiện', 'Trạng thái', 'Thanh toán', 'Tổng tiền', 'Ngày tạo'],
      ...orders.map((order) => [
        order.id,
        order.customerName,
        order.customerEmail,
        order.eventName,
        order.status,
        order.paymentMethod,
        String(order.totalAmount),
        order.createdAt,
      ]),
    ]);
  };

  if (!session || session.user.role !== 'admin') return null;
  const activeTabLabel = tabs.find((tab) => tab.key === activeTab)?.label ?? 'Dashboard';

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-header__eyebrow">Admin Portal</span>
          <h1>Dashboard quản trị</h1>
        </div>

        <nav className="admin-tabs" aria-label="Admin navigation">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={activeTab === tab.key ? 'admin-tabs__item admin-tabs__item--active' : 'admin-tabs__item'}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-header__session">
          <AccountMenu initialSession={session} />
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-main-header">
          <div>
            <span className="admin-header__eyebrow">Đang quản lý</span>
            <h2>{activeTabLabel}</h2>
          </div>
          <button type="button" onClick={() => void loadAdminData()} disabled={loading}>
            Làm mới dữ liệu
          </button>
        </header>

        {error ? <div className="admin-alert" role="alert">{error}</div> : null}
        {loading ? <section className="admin-panel admin-loading">Đang tải dữ liệu quản trị...</section> : null}

        {!loading && activeTab === 'overview' && overview ? (
          <section className="admin-stack">
            <div className="admin-metric-grid">
              <MetricCard label="Doanh thu" value={formatCurrency(overview.metrics.totalRevenue)} helper="Paid + inventory estimate" />
              <MetricCard label="Vé đã bán" value={String(overview.metrics.ticketsSold)} helper="Theo đơn và tồn kho" />
              <MetricCard label="Sự kiện mở bán" value={String(overview.metrics.activeEvents)} helper={`${overview.metrics.events} tổng sự kiện`} />
              <MetricCard label="Người dùng" value={String(overview.metrics.users)} helper={`${overview.metrics.staffUsers} staff`} />
            </div>
            <div className="admin-two-column">
              <DataPanel title="Top doanh thu theo phim/sự kiện">
                <SimpleTable
                  headers={['Sự kiện', 'Vé bán', 'Doanh thu']}
                  rows={overview.topEvents.map((eventItem) => [
                    eventItem.name,
                    String(eventItem.soldTickets),
                    formatCurrency(eventItem.estimatedRevenue),
                  ])}
                />
              </DataPanel>
              <DataPanel title="Đơn hàng gần đây">
                <SimpleTable
                  headers={['Mã đơn', 'Khách', 'Trạng thái', 'Tổng']}
                  rows={overview.recentOrders.map((order) => [
                    order.id.slice(0, 8),
                    order.customerName,
                    order.status,
                    formatCurrency(order.totalAmount),
                  ])}
                  empty="Chưa có đơn hàng."
                />
              </DataPanel>
            </div>
          </section>
        ) : null}

        {!loading && activeTab === 'events' ? (
          <section className="admin-stack">
            <DataPanel title="Tạo phim / sự kiện mới" description="Thông tin này sẽ xuất hiện ở catalog, trang chi tiết và lịch bán vé.">
              <form className="admin-form admin-form--grid" onSubmit={handleCreateEvent}>
                <label className="admin-field">
                  <span>Tên phim hoặc concert</span>
                  <input value={eventForm.name} onChange={(e) => setEventForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Midnight Wave" required />
                </label>
                <label className="admin-field">
                  <span>Loại</span>
                  <select value={eventForm.type} onChange={(e) => setEventForm((prev) => ({ ...prev, type: e.target.value as 'movie' | 'concert' }))}>
                    <option value="movie">Phim</option>
                    <option value="concert">Concert</option>
                  </select>
                </label>
                <label className="admin-field">
                  <span>Ngày chiếu / diễn</span>
                  <input type="date" value={eventForm.date} onChange={(e) => setEventForm((prev) => ({ ...prev, date: e.target.value }))} required />
                </label>
                <label className="admin-field">
                  <span>Giờ bắt đầu</span>
                  <input type="time" value={eventForm.time} onChange={(e) => setEventForm((prev) => ({ ...prev, time: e.target.value }))} required />
                </label>
                <label className="admin-field">
                  <span>Thời lượng (phút)</span>
                  <input type="number" min="1" value={eventForm.duration} onChange={(e) => setEventForm((prev) => ({ ...prev, duration: Number(e.target.value) }))} />
                  <small>Dùng cho lịch chiếu và trang chi tiết</small>
                </label>
                <label className="admin-field">
                  <span>Giá vé từ (VND)</span>
                  <input type="number" min="0" step="1000" value={eventForm.priceFrom} onChange={(e) => setEventForm((prev) => ({ ...prev, priceFrom: Number(e.target.value) }))} />
                  <small>{formatCurrency(eventForm.priceFrom ?? 0)}</small>
                </label>
                <label className="admin-field">
                  <span>Địa điểm</span>
                  <input value={eventForm.location} onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="CGV Landmark 81" required />
                </label>
                <label className="admin-field">
                  <span>Poster URL</span>
                  <input value={eventForm.image} onChange={(e) => setEventForm((prev) => ({ ...prev, image: e.target.value }))} placeholder="https://..." />
                </label>
                <label className="admin-field">
                  <span>Đạo diễn</span>
                  <input value={eventForm.director} onChange={(e) => setEventForm((prev) => ({ ...prev, director: e.target.value }))} placeholder="Tên đạo diễn" />
                </label>
                <label className="admin-field">
                  <span>Trailer URL</span>
                  <input value={eventForm.trailerUrl} onChange={(e) => setEventForm((prev) => ({ ...prev, trailerUrl: e.target.value }))} placeholder="https://..." />
                </label>
                <label className="admin-field admin-field--wide">
                  <span>Mô tả</span>
                  <textarea value={eventForm.description} onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Tóm tắt nội dung hoặc thông tin sự kiện" />
                </label>
                <button type="submit" disabled={actionLoading}>Tạo mới</button>
              </form>
            </DataPanel>
            <DataPanel title="Danh sách phim / sự kiện">
              {events.length === 0 ? (
                <p className="admin-empty">Chưa có phim / sự kiện.</p>
              ) : (
                <>
                  <div className="admin-table-meta">
                    Hiển thị {eventStart}-{eventEnd} trong {events.length} phim / sự kiện
                  </div>
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Tên</th>
                          <th>Loại</th>
                          <th>Ngày giờ</th>
                          <th>Tồn vé</th>
                          <th>Doanh thu ước tính</th>
                          <th>Trạng thái</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedEvents.map((eventItem) => (
                          <tr key={eventItem.id}>
                            <td>
                              <strong>{eventItem.name}</strong>
                              <span>{eventItem.location}</span>
                            </td>
                            <td>
                              <span className={`admin-type-chip admin-type-chip--${eventItem.type}`}>
                                {eventItem.type === 'movie' ? 'Phim' : 'Concert'}
                              </span>
                            </td>
                            <td>{eventItem.date} {eventItem.time}</td>
                            <td>
                              <div className="admin-stock">
                                <div>
                                  <strong>{eventItem.remainingStock}/{eventItem.totalStock}</strong>
                                  <span>{getPercent(eventItem.remainingStock, eventItem.totalStock)}% còn lại</span>
                                </div>
                                <i aria-hidden="true">
                                  <b style={{ width: `${getPercent(eventItem.remainingStock, eventItem.totalStock)}%` }} />
                                </i>
                              </div>
                            </td>
                            <td>{formatCurrency(eventItem.estimatedRevenue)}</td>
                            <td>
                              <select
                                className={`admin-status-select admin-status-select--${eventItem.status}`}
                                value={eventItem.status}
                                onChange={(e) => handleEventStatus(eventItem, e.target.value as AdminEventStatus)}
                              >
                                {Object.entries(eventStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                              </select>
                            </td>
                            <td>
                              {eventItem.hidden || eventItem.status === 'hidden' ? (
                                <button type="button" className="admin-row-action admin-row-action--restore" onClick={() => handleRestoreEvent(eventItem)}>Mở lại</button>
                              ) : (
                                <button type="button" className="admin-row-action admin-row-action--danger" onClick={() => handleHideEvent(eventItem)}>Ẩn</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <AdminPagination
                    label="Phân trang phim và sự kiện"
                    page={safeEventPage}
                    totalPages={eventTotalPages}
                    onPageChange={setEventPage}
                  />
                </>
              )}
            </DataPanel>
          </section>
        ) : null}

        {!loading && activeTab === 'venues' ? (
          <section className="admin-stack">
            <div className="admin-two-column">
              <DataPanel title="Thêm cụm rạp">
                <form className="admin-form" onSubmit={handleCreateVenue}>
                  <label className="admin-field">
                    <span>Tên rạp</span>
                    <input value={venueForm.name} onChange={(e) => setVenueForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="CGV Landmark 81" required />
                  </label>
                  <label className="admin-field">
                    <span>Địa chỉ</span>
                    <input value={venueForm.address} onChange={(e) => setVenueForm((prev) => ({ ...prev, address: e.target.value }))} placeholder="208 Nguyễn Hữu Cảnh" required />
                  </label>
                  <label className="admin-field">
                    <span>Thành phố</span>
                    <input value={venueForm.city} onChange={(e) => setVenueForm((prev) => ({ ...prev, city: e.target.value }))} placeholder="TP. HCM" required />
                  </label>
                  <button type="submit" disabled={actionLoading}>Thêm rạp</button>
                </form>
              </DataPanel>
              <DataPanel title="Tạo phòng chiếu">
                <form className="admin-form" onSubmit={handleCreateRoom}>
                  <label className="admin-field">
                    <span>Cụm rạp</span>
                    <select value={roomForm.venueId} onChange={(e) => setRoomForm((prev) => ({ ...prev, venueId: e.target.value }))}>
                      {venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}
                    </select>
                  </label>
                  <label className="admin-field">
                    <span>Tên phòng</span>
                    <input value={roomForm.name} onChange={(e) => setRoomForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Phòng 01" required />
                  </label>
                  <label className="admin-field">
                    <span>Loại phòng</span>
                    <select value={roomForm.type} onChange={(e) => setRoomForm((prev) => ({ ...prev, type: e.target.value }))}>
                      <option value="standard">Standard</option>
                      <option value="imax">IMAX</option>
                      <option value="stage">Stage</option>
                    </select>
                  </label>
                  <div className="admin-inline-fields">
                    <label className="admin-field">
                      <span>Số hàng</span>
                      <input type="number" value={roomForm.rows} onChange={(e) => setRoomForm((prev) => ({ ...prev, rows: Number(e.target.value) }))} />
                    </label>
                    <label className="admin-field">
                      <span>Ghế mỗi hàng</span>
                      <input type="number" value={roomForm.seatsPerRow} onChange={(e) => setRoomForm((prev) => ({ ...prev, seatsPerRow: Number(e.target.value) }))} />
                    </label>
                  </div>
                  <button type="submit" disabled={actionLoading}>Tạo phòng</button>
                </form>
              </DataPanel>
            </div>
            {venues.length === 0 ? (
              <p className="admin-empty">Chưa có cụm rạp.</p>
            ) : (
              <>
                <div className="admin-table-meta">
                  Hiển thị {venueStart}-{venueEnd} trong {venues.length} cụm rạp
                </div>
                <div className="admin-card-grid">
                  {paginatedVenues.map((venue) => (
                    <article className="admin-venue-card" key={venue.id}>
                      <h3>{venue.name}</h3>
                      <p>{venue.address}, {venue.city}</p>
                      <div className="admin-room-list">
                        {venue.rooms.map((room) => (
                          <div key={room.id}>
                            <span>{room.name} · {room.type}</span>
                            <select value={room.status} onChange={(e) => handleRoomStatus(room, e.target.value)}>
                              <option value="active">Hoạt động</option>
                              <option value="maintenance">Bảo trì</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
                <AdminPagination
                  label="Phân trang cụm rạp"
                  page={safeVenuePage}
                  totalPages={venueTotalPages}
                  onPageChange={setVenuePage}
                />
              </>
            )}
          </section>
        ) : null}

        {!loading && activeTab === 'showtimes' ? (
          <section className="admin-stack">
            <DataPanel title="Tạo suất chiếu">
              <form className="admin-form admin-form--grid" onSubmit={handleCreateShowTime}>
                <label className="admin-field">
                  <span>Phim / sự kiện</span>
                  <select value={showTimeForm.eventId} onChange={(e) => setShowTimeForm((prev) => ({ ...prev, eventId: e.target.value }))}>
                    {events.filter((eventItem) => !eventItem.hidden).map((eventItem) => <option key={eventItem.id} value={eventItem.id}>{eventItem.name}</option>)}
                  </select>
                </label>
                <label className="admin-field">
                  <span>Rạp / phòng</span>
                  <select value={showTimeForm.roomId} onChange={(e) => setShowTimeForm((prev) => ({ ...prev, roomId: e.target.value }))}>
                    {rooms.map((room) => <option key={room.id} value={room.id}>{room.venueName} · {room.name}</option>)}
                  </select>
                </label>
                <label className="admin-field">
                  <span>Ngày chiếu</span>
                  <input type="date" value={showTimeForm.date} onChange={(e) => setShowTimeForm((prev) => ({ ...prev, date: e.target.value }))} required />
                </label>
                <label className="admin-field">
                  <span>Giờ bắt đầu</span>
                  <input type="time" value={showTimeForm.time} onChange={(e) => setShowTimeForm((prev) => ({ ...prev, time: e.target.value }))} required />
                </label>
                <label className="admin-field">
                  <span>Định dạng</span>
                  <select value={showTimeForm.format} onChange={(e) => setShowTimeForm((prev) => ({ ...prev, format: e.target.value }))}>
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX">IMAX</option>
                  </select>
                </label>
                <label className="admin-field">
                  <span>Giá vé cơ bản</span>
                  <input type="number" min="0" step="1000" value={showTimeForm.basePrice} onChange={(e) => setShowTimeForm((prev) => ({ ...prev, basePrice: Number(e.target.value) }))} />
                  <small>{formatCurrency(showTimeForm.basePrice)}</small>
                </label>
                <button type="submit" disabled={actionLoading}>Tạo suất</button>
              </form>
            </DataPanel>
            <DataPanel title="Danh sách suất chiếu">
              {showTimes.length ? (
                <div className="admin-table-meta">
                  Hiển thị {showTimeStart}-{showTimeEnd} trong {showTimes.length} suất chiếu
                </div>
              ) : null}
              <SimpleTable
                headers={['Sự kiện', 'Rạp / phòng', 'Thời gian', 'Định dạng', 'Vé bán', 'Trạng thái']}
                rows={paginatedShowTimes.map((showTime) => [
                  showTime.eventName,
                  `${showTime.venueName} · ${showTime.roomName}`,
                  `${showTime.date} ${showTime.time}`,
                  showTime.format,
                  String(showTime.soldTickets),
                  <select key={showTime.id} value={showTime.status} onChange={(e) => handleShowTimeStatus(showTime, e.target.value)}>
                    <option value="scheduled">Đang mở</option>
                    <option value="sold-out">Hết vé</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>,
                ])}
              />
              <AdminPagination
                label="Phân trang suất chiếu"
                page={safeShowTimePage}
                totalPages={showTimeTotalPages}
                onPageChange={setShowTimePage}
              />
            </DataPanel>
          </section>
        ) : null}

        {!loading && activeTab === 'orders' ? (
          <section className="admin-stack">
            <DataPanel title="Tra cứu đơn hàng">
              <div className="admin-toolbar">
                <label className="admin-field">
                  <span>Từ khóa</span>
                  <input
                    value={orderFilter.q}
                    onChange={(e) => {
                      setOrderFilter((prev) => ({ ...prev, q: e.target.value }));
                      setOrderPage(1);
                    }}
                    placeholder="Mã đơn, email, tên phim"
                  />
                </label>
                <label className="admin-field">
                  <span>Trạng thái</span>
                  <select
                    value={orderFilter.status}
                    onChange={(e) => {
                      setOrderFilter((prev) => ({ ...prev, status: e.target.value }));
                      setOrderPage(1);
                    }}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
                <button type="button" onClick={() => void refreshOrders()}>Lọc</button>
                <button type="button" onClick={handleExportOrders}>Xuất CSV</button>
              </div>
            </DataPanel>
            <DataPanel title="Danh sách đơn hàng">
              {orders.length === 0 ? (
                <p className="admin-empty">Không có đơn hàng phù hợp.</p>
              ) : (
                <>
                  <div className="admin-table-meta">
                    Hiển thị {orderStart}-{orderEnd} trong {orders.length} đơn hàng
                  </div>
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Mã đơn</th>
                          <th>Khách</th>
                          <th>Sự kiện</th>
                          <th>Ghế</th>
                          <th>Tổng tiền</th>
                          <th>Trạng thái</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOrders.map((order) => (
                          <tr key={order.id}>
                            <td>{order.id.slice(0, 8)}</td>
                            <td><strong>{order.customerName}</strong><span>{order.customerEmail}</span></td>
                            <td>{order.eventName}</td>
                            <td>{order.seatCount}</td>
                            <td>{formatCurrency(order.totalAmount)}</td>
                            <td><span className={`admin-status admin-status--${order.status}`}>{order.status}</span></td>
                            <td>{order.status !== 'cancelled' ? <button type="button" onClick={() => handleCancelOrder(order)}>Hủy</button> : null}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <AdminPagination
                    label="Phân trang đơn hàng"
                    page={safeOrderPage}
                    totalPages={orderTotalPages}
                    onPageChange={setOrderPage}
                  />
                </>
              )}
            </DataPanel>
          </section>
        ) : null}

        {!loading && activeTab === 'users' ? (
          <DataPanel title="Quản lý người dùng và phân quyền">
            {users.length ? (
              <div className="admin-table-meta">
                Hiển thị {userStart}-{userEnd} trong {users.length} người dùng
              </div>
            ) : null}
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => {
                    const isProtectedAdmin = user.role === 'admin';
                    return (
                      <tr key={user.id} className={isProtectedAdmin ? 'admin-table-row--locked' : undefined}>
                        <td>
                          <strong>{user.name}</strong>
                          <span>{user.id}</span>
                          {isProtectedAdmin ? <em className="admin-lock-note">Tài khoản quản trị viên được bảo vệ</em> : null}
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            value={user.role}
                            disabled={isProtectedAdmin}
                            onChange={(e) => handleUserUpdate(user, { role: e.target.value as AdminUserRole })}
                          >
                            <option value="customer">Customer</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={user.status}
                            disabled={isProtectedAdmin}
                            onChange={(e) => handleUserUpdate(user, { status: e.target.value as AdminUserStatus })}
                          >
                            <option value="active">Active</option>
                            <option value="locked">Locked</option>
                          </select>
                        </td>
                        <td>{formatDateTime(user.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <AdminPagination
              label="Phân trang người dùng"
              page={safeUserPage}
              totalPages={userTotalPages}
              onPageChange={setUserPage}
            />
          </DataPanel>
        ) : null}

        {!loading && activeTab === 'reports' && reports ? (
          <section className="admin-stack">
            <div className="admin-metric-grid">
              <MetricCard label="Thanh toán thành công" value={`${reports.paymentStats.successRate}%`} helper={`${reports.paymentStats.success} paid / ${reports.paymentStats.failed} failed`} />
              <MetricCard label="Top event" value={reports.revenueByEvent[0]?.eventName ?? 'N/A'} helper={formatCurrency(reports.revenueByEvent[0]?.revenue ?? 0)} />
              <MetricCard label="Rạp có doanh thu" value={String(reports.revenueByVenue.length)} helper="Theo cụm rạp" />
              <MetricCard label="Lấp đầy cao nhất" value={`${Math.max(...reports.occupancy.map((item) => item.occupancyRate), 0)}%`} helper="Theo tồn kho sự kiện" />
            </div>
            <div className="admin-two-column">
              <DataPanel title="Doanh thu theo sự kiện">
                <BarList items={reports.revenueByEvent.map((item) => ({ label: item.eventName, value: item.revenue, display: formatCurrency(item.revenue) }))} />
              </DataPanel>
              <DataPanel title="Tỷ lệ lấp đầy">
                <BarList items={reports.occupancy.map((item) => ({ label: item.eventName, value: item.occupancyRate, display: `${item.occupancyRate}%` }))} max={100} />
              </DataPanel>
            </div>
          </section>
        ) : null}

        {!loading && activeTab === 'system' && system ? (
          <section className="admin-stack">
            <div className="admin-metric-grid">
              <MetricCard label="API status" value={system.apiStatus.toUpperCase()} helper={`Started ${formatDateTime(system.startedAt)}`} />
              <MetricCard label="Request" value={String(system.requestCount)} helper={`${system.errorCount} lỗi HTTP`} />
              <MetricCard label="Queue pending" value={String(system.queuePending)} helper="Mock queue" />
              <MetricCard label="Memory" value={`${system.memoryMb} MB`} helper={`${system.uptimeSeconds}s uptime`} />
            </div>
            <DataPanel title="CloudWatch alerts">
              {system.cloudWatchAlerts.length === 0 ? <p className="admin-empty">Không có cảnh báo.</p> : (
                <ul className="admin-alert-list">
                  {system.cloudWatchAlerts.map((alert) => <li key={alert}>{alert}</li>)}
                </ul>
              )}
            </DataPanel>
          </section>
        ) : null}
      </main>
    </div>
  );
};

function MetricCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <article className="admin-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </article>
  );
}

function DataPanel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel__header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function SimpleTable({ headers, rows, empty = 'Không có dữ liệu.' }: { headers: string[]; rows: React.ReactNode[][]; empty?: string }) {
  if (rows.length === 0) return <p className="admin-empty">{empty}</p>;

  return (
    <div className="admin-table-scroll">
      <table className="admin-table">
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminPagination({
  label,
  page,
  totalPages,
  onPageChange,
}: {
  label: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="admin-pagination" aria-label={label}>
      <button type="button" onClick={() => onPageChange(Math.max(page - 1, 1))} disabled={page <= 1}>
        Trước
      </button>
      {getPageNumbers(page, totalPages).map((pageNumber) => (
        <button
          type="button"
          key={pageNumber}
          className={pageNumber === page ? 'admin-pagination__page--active' : ''}
          onClick={() => onPageChange(pageNumber)}
          aria-current={pageNumber === page ? 'page' : undefined}
        >
          {pageNumber}
        </button>
      ))}
      <button type="button" onClick={() => onPageChange(Math.min(page + 1, totalPages))} disabled={page >= totalPages}>
        Sau
      </button>
    </nav>
  );
}

function BarList({ items, max }: { items: Array<{ label: string; value: number; display: string }>; max?: number }) {
  const computedMax = max ?? Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="admin-bar-list">
      {items.map((item) => (
        <div className="admin-bar-item" key={item.label}>
          <div>
            <span>{item.label}</span>
            <strong>{item.display}</strong>
          </div>
          <i style={{ width: `${Math.min((item.value / computedMax) * 100, 100)}%` }} />
        </div>
      ))}
    </div>
  );
}
