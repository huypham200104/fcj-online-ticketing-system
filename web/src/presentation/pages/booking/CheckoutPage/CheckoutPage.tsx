import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { MovieSchedule, MovieSeat, MovieShowtime, TicketType } from '@/domain/entities/Event';
import { Badge } from '@/presentation/components/ui/Badge';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { BookingProgress } from '@/presentation/components/shared/BookingProgress';
import { PageState } from '@/presentation/components/shared/PageState';
import { useBookingSession } from '@/presentation/hooks/useBookingSession';
import { useCountdown } from '@/presentation/hooks/useCountdown';
import { useEventDetail } from '@/presentation/hooks/useEventDetail';
import { usePayment } from '@/presentation/hooks/usePayment';
import { ROUTES, routePaths } from '@/presentation/router/routes';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import './CheckoutPage.css';

const SEAT_HOLD_EXPIRED_MESSAGE = 'Đã hết 15 phút giữ ghế, vui lòng đặt lại.';
const DEFAULT_HOLD_TIME_LABEL = '15:00';

interface HoldTimerProps {
  description: string;
  label: string;
  status: 'active' | 'expired' | 'idle';
  value: string;
}

const HoldTimer: React.FC<HoldTimerProps> = ({ description, label, status, value }) => (
  <div className={`checkout-hold-timer checkout-hold-timer--${status}`}>
    <span>{label}</span>
    <strong>{value}</strong>
    <small>{description}</small>
  </div>
);

function getPriceLabel(ticketType?: TicketType): string {
  if (!ticketType) return formatCurrency(0);
  return ticketType.price === 0 ? 'Miễn phí' : formatCurrency(ticketType.price);
}

function getAvailableSeatCount(showtime: MovieShowtime): number {
  return showtime.seats.filter((seat) => seat.status === 'available').length;
}

function groupSeatsByRow(seats: MovieSeat[]): [string, MovieSeat[]][] {
  const groups = seats.reduce<Record<string, MovieSeat[]>>((acc, seat) => {
    acc[seat.row] = [...(acc[seat.row] ?? []), seat];
    return acc;
  }, {});

  return Object.entries(groups).map(([row, rowSeats]) => [
    row,
    [...rowSeats].sort((a, b) => a.number - b.number),
  ]);
}

function getSeatPrice(ticketType: TicketType | undefined, seat: MovieSeat): number {
  return (ticketType?.price ?? 0) + seat.priceModifier;
}

function getSeatClassName(seat: MovieSeat, selected: boolean): string {
  if (selected) return 'seat-button seat-button--selected';
  if (seat.status === 'taken') return 'seat-button seat-button--taken';
  if (seat.status === 'locked') return 'seat-button seat-button--locked';
  return 'seat-button seat-button--available';
}

function getMovieBookingSteps(eventId: string, cinemaId?: string) {
  return [
    { id: 'movie', label: 'Chọn phim', to: ROUTES.EVENTS },
    { id: 'cinema', label: 'Chọn rạp', to: routePaths.eventDetail(eventId, { cinemaId }) },
    { id: 'showtime', label: 'Địa điểm & giờ' },
    { id: 'seat', label: 'Chọn ghế' },
    { id: 'payment', label: 'Thanh toán' },
  ];
}

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get('eventId') ?? undefined;
  const initialTicketTypeId = searchParams.get('ticketTypeId') ?? undefined;
  const initialCinemaId = searchParams.get('cinemaId') ?? '';
  const initialShowtimeId = searchParams.get('showtimeId') ?? '';

  const { event, loading, error } = useEventDetail(eventId);
  const booking = useBookingSession();
  const payment = usePayment();
  const countdown = useCountdown(booking.session?.expiresAt);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [eventId, initialTicketTypeId, initialCinemaId, initialShowtimeId]);

  const [selectedCinemaId, setSelectedCinemaId] = useState(initialCinemaId);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState(initialShowtimeId);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState(initialTicketTypeId ?? '');
  const [quantity, setQuantity] = useState(1);

  const movieSchedules = useMemo(() => event?.movieSchedules ?? [], [event?.movieSchedules]);
  const isMovieFlow = event?.category === 'Phim' && movieSchedules.length > 0;

  const activeSchedule = useMemo<MovieSchedule | undefined>(() => {
    if (!isMovieFlow) return undefined;
    if (selectedCinemaId) {
      return movieSchedules.find((schedule) => schedule.cinema.id === selectedCinemaId);
    }
    if (selectedShowtimeId) {
      return movieSchedules.find((schedule) =>
        schedule.showtimes.some((showtime) => showtime.id === selectedShowtimeId),
      );
    }
    return undefined;
  }, [isMovieFlow, movieSchedules, selectedCinemaId, selectedShowtimeId]);

  const selectedShowtime = useMemo<MovieShowtime | undefined>(() => {
    if (!isMovieFlow) return undefined;
    return activeSchedule?.showtimes.find((showtime) => showtime.id === selectedShowtimeId);
  }, [activeSchedule, isMovieFlow, selectedShowtimeId]);

  const selectedTicketType = useMemo(
    () =>
      event?.ticketTypes.find(
        (ticketType) => ticketType.id === (selectedShowtime?.ticketTypeId ?? selectedTicketTypeId),
      ) ?? event?.ticketTypes[0],
    [event, selectedShowtime?.ticketTypeId, selectedTicketTypeId],
  );

  const selectedSeats = useMemo(
    () =>
      selectedSeatIds
        .map((seatId) => selectedShowtime?.seats.find((seat) => seat.id === seatId))
        .filter((seat): seat is MovieSeat => Boolean(seat)),
    [selectedSeatIds, selectedShowtime],
  );

  const seatRows = useMemo(
    () => groupSeatsByRow(selectedShowtime?.seats ?? []),
    [selectedShowtime?.seats],
  );
  const movieSeatSelectionLimit = selectedShowtime ? getAvailableSeatCount(selectedShowtime) : 0;

  const totalPrice = isMovieFlow
    ? selectedSeats.reduce((sum, seat) => sum + getSeatPrice(selectedTicketType, seat), 0)
    : (selectedTicketType?.price ?? 0) * quantity;
  const hasBookingSession = Boolean(booking.session);
  const holdExpired = hasBookingSession && countdown.isExpired;
  const hasActiveHold = hasBookingSession && !holdExpired;
  const canReserve = isMovieFlow
    ? Boolean(activeSchedule && selectedShowtime && selectedSeats.length > 0)
    : Boolean(selectedTicketType);
  const canUseReserveAction = holdExpired || (canReserve && !hasActiveHold);
  const canPay = hasActiveHold && !payment.loading;
  const activeProgressStep = hasActiveHold
    ? 'payment'
    : selectedShowtime
      ? 'seat'
      : selectedCinemaId
        ? 'showtime'
        : 'cinema';
  const holdTimerStatus = holdExpired ? 'expired' : hasActiveHold ? 'active' : 'idle';
  const holdTimerLabel = isMovieFlow ? 'Thời gian giữ ghế' : 'Thời gian giữ vé';
  const holdTimerDescription = holdExpired
    ? 'Hết giờ giữ chỗ, vui lòng đặt lại.'
    : hasActiveHold
      ? 'Hoàn tất thanh toán trước khi hết giờ.'
      : isMovieFlow
        ? 'Chọn ghế rồi bấm giữ ghế để bắt đầu đếm ngược.'
        : 'Bấm giữ vé để bắt đầu đếm ngược.';
  const holdTimerValue = hasBookingSession ? countdown.formatted : DEFAULT_HOLD_TIME_LABEL;

  const clearHeldSession = () => {
    booking.clearSession();
  };

  const handleCinemaChange = (cinemaId: string) => {
    if (hasActiveHold) return;
    setSelectedCinemaId(cinemaId);
    setSelectedShowtimeId('');
    setSelectedSeatIds([]);
    clearHeldSession();
  };

  const handleShowtimeChange = (showtime: MovieShowtime) => {
    if (hasActiveHold) return;
    if (getAvailableSeatCount(showtime) === 0) return;
    setSelectedCinemaId(showtime.cinemaId);
    setSelectedShowtimeId(showtime.id);
    setSelectedSeatIds([]);
    clearHeldSession();
  };

  const handleSeatToggle = (seat: MovieSeat) => {
    if (hasActiveHold) return;
    if (seat.status !== 'available') return;

    setSelectedSeatIds((current) => {
      if (current.includes(seat.id)) {
        clearHeldSession();
        return current.filter((seatId) => seatId !== seat.id);
      }

      const seatLimit = isMovieFlow ? movieSeatSelectionLimit : (selectedTicketType?.maxPerOrder ?? 1);
      if (current.length >= seatLimit) return current;
      clearHeldSession();
      return [...current, seat.id];
    });
  };

  const handleTicketTypeChange = (ticketTypeId: string) => {
    if (hasActiveHold) return;
    setSelectedTicketTypeId(ticketTypeId);
    setQuantity(1);
    clearHeldSession();
  };

  const handleResetReservation = () => {
    booking.clearSession();
    setSelectedSeatIds([]);
    setQuantity(1);
  };

  const handleCancelBooking = async () => {
    try {
      await booking.cancelSession();
    } catch {
      return;
    }

    if (!event) return;

    setSelectedCinemaId('');
    setSelectedShowtimeId('');
    setSelectedSeatIds([]);
    setQuantity(1);
    navigate(routePaths.eventDetail(event.id, { cinemaId: activeSchedule?.cinema.id }), {
      state: {
        notification: {
          tone: 'success',
          message: 'Đã hủy toàn bộ đặt vé. Bạn có thể chọn phim hoặc sự kiện khác.',
        },
      },
    });
  };

  const handleReserve = async () => {
    if (holdExpired) {
      handleResetReservation();
      return;
    }
    if (hasActiveHold) return;
    if (!event || !selectedTicketType) return;

    if (isMovieFlow) {
      if (!activeSchedule || !selectedShowtime) return;
      await booking.createSession({
        eventId: event.id,
        ticketTypeId: selectedShowtime.ticketTypeId,
        cinemaId: activeSchedule.cinema.id,
        showtimeId: selectedShowtime.id,
        seatIds: selectedSeatIds,
        quantity: selectedSeatIds.length,
      });
      return;
    }

    await booking.createSession({
      eventId: event.id,
      ticketTypeId: selectedTicketType.id,
      quantity,
    });
  };

  const handlePayment = async () => {
    if (!booking.session || countdown.isExpired) return;

    const result = await payment.processPayment(booking.session);
    if (!result) return;

    if (result.status === 'success') {
      navigate(routePaths.paymentSuccess(result.sessionId, result.ticketIds[0]));
      return;
    }

    navigate(routePaths.paymentFailed(result.sessionId, result.reason));
  };

  if (!eventId) {
    return (
      <MainLayout>
        <PageState
          variant="empty"
          title="Chưa chọn phim hoặc concert"
          description="Hãy chọn một phim, suất chiếu hoặc concert trước khi tạo phiên giữ vé."
          action={<Link className="checkout-page__state-link" to={ROUTES.EVENTS}>Về danh sách vé</Link>}
        />
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <PageState variant="loading" title="Đang chuẩn bị checkout" />
      </MainLayout>
    );
  }

  if (error || !event) {
    return (
      <MainLayout>
        <PageState
          variant="error"
          title="Không thể mở checkout"
          description={error ?? 'Không tìm thấy phim hoặc concert cần đặt vé.'}
          action={<Link className="checkout-page__state-link" to={ROUTES.EVENTS}>Về danh sách vé</Link>}
        />
      </MainLayout>
    );
  }

  if (!isMovieFlow) {
    return (
      <MainLayout contentClassName="checkout-page">
        <section className="checkout-page__heading">
          <div>
            <Badge tone="primary">Checkout</Badge>
            <h1>Đặt vé {event.title}</h1>
            <p>Chọn loại vé, số lượng và tạo phiên giữ vé trước khi thanh toán.</p>
          </div>
          <div className="checkout-page__heading-actions">
            <Link to={routePaths.eventDetail(event.id)}>Quay lại chi tiết</Link>
          </div>
        </section>

        <section className="checkout-page__grid">
          <div className="checkout-page__panel">
            <h2>Loại vé</h2>
            <div className="checkout-page__ticket-options">
              {event.ticketTypes
                .filter((ticketType) => initialTicketTypeId ? ticketType.id === initialTicketTypeId : true)
                .map((ticketType) => (
                <button
                  type="button"
                  className={`checkout-ticket ${ticketType.id === selectedTicketType?.id ? 'checkout-ticket--active' : ''}`}
                  key={ticketType.id}
                  onClick={() => handleTicketTypeChange(ticketType.id)}
                  disabled={hasActiveHold}
                  style={{ cursor: hasActiveHold ? 'not-allowed' : initialTicketTypeId ? 'default' : 'pointer' }}
                >
                  <span>
                    <strong>{ticketType.name}</strong>
                    <small>{ticketType.description}</small>
                  </span>
                  <em>{getPriceLabel(ticketType)}</em>
                </button>
              ))}
            </div>

            <div className="checkout-page__quantity">
              <div>
                <h2>Số lượng</h2>
                <p>Tối đa {selectedTicketType?.maxPerOrder ?? 1} vé cho mỗi phiên.</p>
              </div>
              <div className="quantity-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  disabled={hasActiveHold}
                >
                  -
                </button>
                <strong>{quantity}</strong>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((value) => Math.min(selectedTicketType?.maxPerOrder ?? 1, value + 1))
                  }
                  disabled={hasActiveHold}
                >
                  +
                </button>
              </div>
            </div>

            {booking.error ? <p className="checkout-page__error">{booking.error}</p> : null}

            <button
              type="button"
              className="checkout-page__reserve"
              onClick={handleReserve}
              disabled={booking.loading || !canUseReserveAction}
            >
              {holdExpired ? 'Đặt lại' : booking.loading ? 'Đang giữ vé...' : hasActiveHold ? 'Đã giữ vé' : 'Giữ vé tạm thời'}
            </button>
          </div>

          <aside className="checkout-summary">
            <div className="checkout-summary__header">
              <span>Tóm tắt</span>
            </div>

            <HoldTimer
              description={holdTimerDescription}
              label={holdTimerLabel}
              status={holdTimerStatus}
              value={holdTimerValue}
            />

            <dl className="checkout-summary__rows">
              <div>
                <dt>Concert</dt>
                <dd>{event.title}</dd>
              </div>
              <div>
                <dt>Loại vé</dt>
                <dd>{selectedTicketType?.name ?? 'Chưa chọn'}</dd>
              </div>
              <div>
                <dt>Số lượng</dt>
                <dd>{quantity}</dd>
              </div>
              <div>
                <dt>Tạm tính</dt>
                <dd>{totalPrice === 0 ? 'Miễn phí' : formatCurrency(totalPrice)}</dd>
              </div>
            </dl>

            {booking.session ? (
              <div className={`checkout-summary__session ${holdExpired ? 'checkout-summary__session--expired' : ''}`}>
                <strong>{holdExpired ? 'Phiên giữ vé đã hết hạn' : 'Phiên giữ vé đã được tạo'}</strong>
                <p>
                  Session: <span>{booking.session.id}</span>
                </p>
                <p>
                  {holdExpired
                    ? 'Ghế đã được mở lại. Hãy đặt lại để tạo phiên giữ vé mới.'
                    : 'Vui lòng thanh toán trước khi đồng hồ về 00:00.'}
                </p>
              </div>
            ) : (
              <div className="checkout-summary__session checkout-summary__session--muted">
                <strong>Chưa giữ vé</strong>
                <p>Bấm “Giữ vé tạm thời” để backend giữ vé trong 15 phút.</p>
              </div>
            )}

            {holdExpired ? (
              <p className="checkout-page__error" role="alert">{SEAT_HOLD_EXPIRED_MESSAGE}</p>
            ) : null}
            {payment.error ? <p className="checkout-page__error">{payment.error}</p> : null}

            <div className="checkout-summary__actions">
              <button type="button" className="checkout-summary__action checkout-summary__action--primary" onClick={handlePayment} disabled={!canPay}>
                {payment.loading ? 'Đang xử lý...' : 'Thanh toán'}
              </button>
              <button
                type="button"
                className="checkout-summary__action checkout-summary__action--danger"
                onClick={handleCancelBooking}
                disabled={booking.loading}
              >
                {booking.loading ? 'Đang hủy...' : 'Hủy đặt vé'}
              </button>
            </div>
          </aside>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout contentClassName="checkout-page checkout-page--movie">
      <BookingProgress
        steps={getMovieBookingSteps(event.id, activeSchedule?.cinema.id)}
        activeStepId={activeProgressStep}
      />

      <section className="checkout-page__heading">
        <div>
          <Badge tone="primary">Đặt vé phim</Badge>
          <h1>{event.title}</h1>
          <p>Chọn rạp, suất chiếu, ghế ngồi và tạo phiên giữ ghế trước khi thanh toán.</p>
        </div>
        <div className="checkout-page__heading-actions">
          <Link to={routePaths.eventDetail(event.id, { cinemaId: activeSchedule?.cinema.id })}>
            Quay lại chi tiết
          </Link>
        </div>
      </section>

      <section className="checkout-page__grid checkout-page__grid--wide">
        <div className="checkout-flow">
          <section className="checkout-step">
            <div className="checkout-step__header">
              <span>1</span>
              <div>
                <h2>Chọn rạp</h2>
                <p>Chỉ hiển thị các rạp đang chiếu phim này.</p>
              </div>
            </div>

            <div className="cinema-picker">
              {movieSchedules.map((schedule) => {
                const active = schedule.cinema.id === selectedCinemaId;
                const availableShowtimes = schedule.showtimes.filter(
                  (showtime) => getAvailableSeatCount(showtime) > 0,
                ).length;

                return (
                  <button
                    type="button"
                    className={`cinema-picker__item ${active ? 'cinema-picker__item--active' : ''}`}
                    key={schedule.cinema.id}
                    onClick={() => handleCinemaChange(schedule.cinema.id)}
                    disabled={hasActiveHold}
                  >
                    <strong>{schedule.cinema.name}</strong>
                    <span>{schedule.cinema.address}</span>
                    <small>{availableShowtimes} suất còn vé</small>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="checkout-step">
            <div className="checkout-step__header">
              <span>2</span>
              <div>
                <h2>Chọn địa điểm & giờ xem</h2>
                <p>Khung giờ hết ghế sẽ bị khóa và không thể chọn.</p>
              </div>
            </div>

            {activeSchedule ? (
              <div className="showtime-picker">
                {activeSchedule.showtimes.map((showtime) => {
                  const availableSeats = getAvailableSeatCount(showtime);
                  const soldOut = availableSeats === 0;
                  const active = showtime.id === selectedShowtime?.id;

                  return (
                    <button
                      type="button"
                      className={`showtime-picker__item ${active ? 'showtime-picker__item--active' : ''}`}
                      key={showtime.id}
                      onClick={() => handleShowtimeChange(showtime)}
                      disabled={soldOut || hasActiveHold}
                    >
                      <strong>{showtime.timeLabel}</strong>
                      <span>{showtime.dateLabel} · {showtime.format}</span>
                      <small>{soldOut ? 'Hết ghế' : `${availableSeats} ghế trống`}</small>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="showtime-picker__empty">
                <strong>Chọn rạp để xem suất chiếu</strong>
                <p>Số ghế trống chỉ được tính sau khi bạn chọn rạp và suất chiếu cụ thể.</p>
              </div>
            )}
          </section>

          <section className="checkout-step checkout-step--seat-map">
            <div className="checkout-step__header">
              <span>3</span>
              <div>
                <h2>Chọn ghế</h2>
                <p>Ghế đã bán hoặc đang khóa sẽ không thể chọn.</p>
              </div>
            </div>

            {selectedShowtime ? (
              <div className="seat-map-card">
                <div className="seat-map-card__screen">
                  <span>Màn hình</span>
                </div>

                <div className="seat-map-card__rows" aria-label="Sơ đồ ghế">
                  {seatRows.map(([row, seats]) => (
                    <div className="seat-row" key={row}>
                      <span className="seat-row__label">{row}</span>
                      <div className="seat-row__seats">
                        {seats.map((seat) => {
                          const selected = selectedSeatIds.includes(seat.id);
                          const disabled = seat.status !== 'available' || hasActiveHold;

                          return (
                            <button
                              type="button"
                              className={getSeatClassName(seat, selected)}
                              key={seat.id}
                              onClick={() => handleSeatToggle(seat)}
                              disabled={disabled}
                              aria-pressed={selected}
                              aria-label={`Ghế ${seat.label}`}
                              title={`${seat.label} · ${formatCurrency(getSeatPrice(selectedTicketType, seat))}`}
                            >
                              {seat.number}
                            </button>
                          );
                        })}
                      </div>
                      <span className="seat-row__label">{row}</span>
                    </div>
                  ))}
                </div>

                <div className="seat-map-card__legend">
                  <span><i className="legend-seat legend-seat--taken" /> Đã bán</span>
                  <span><i className="legend-seat legend-seat--available" /> Còn trống</span>
                  <span><i className="legend-seat legend-seat--selected" /> Bạn chọn</span>
                </div>
              </div>
            ) : (
              <div className="seat-map-card seat-map-card--empty">
                <strong>Chọn suất chiếu để mở sơ đồ ghế</strong>
                <p>Sau khi chọn giờ xem, các ghế còn trống sẽ được enable ở bước này.</p>
              </div>
            )}
          </section>
        </div>

        <aside className="checkout-summary checkout-summary--movie">
          <div className="checkout-summary__header">
            <span>Tóm tắt đặt vé</span>
          </div>

          <HoldTimer
            description={holdTimerDescription}
            label={holdTimerLabel}
            status={holdTimerStatus}
            value={holdTimerValue}
          />

          <dl className="checkout-summary__rows">
            <div>
              <dt>Phim</dt>
              <dd>{event.title}</dd>
            </div>
            <div>
              <dt>Rạp</dt>
              <dd>{activeSchedule?.cinema.name ?? 'Chưa chọn'}</dd>
            </div>
            <div>
              <dt>Suất chiếu</dt>
              <dd>{selectedShowtime ? `${selectedShowtime.dateLabel}, ${selectedShowtime.timeLabel}` : 'Chưa chọn'}</dd>
            </div>
            <div>
              <dt>Phòng</dt>
              <dd>{selectedShowtime?.hallName ?? 'Chưa chọn'}</dd>
            </div>
            <div>
              <dt>Ghế</dt>
              <dd>{selectedSeats.length ? selectedSeats.map((seat) => seat.label).join(', ') : 'Chưa chọn'}</dd>
            </div>
            <div>
              <dt>Giá vé</dt>
              <dd>{selectedTicketType ? getPriceLabel(selectedTicketType) : 'Chưa chọn'}</dd>
            </div>
            <div>
              <dt>Tạm tính</dt>
              <dd>{totalPrice === 0 ? 'Miễn phí' : formatCurrency(totalPrice)}</dd>
            </div>
          </dl>

          {booking.error ? <p className="checkout-page__error">{booking.error}</p> : null}

          {booking.session ? (
            <div className={`checkout-summary__session ${holdExpired ? 'checkout-summary__session--expired' : ''}`}>
              <strong>{holdExpired ? 'Phiên giữ ghế đã hết hạn' : `Đã giữ ${booking.session.quantity} ghế`}</strong>
              <p>
                Session: <span>{booking.session.id}</span>
              </p>
              <p>
                {holdExpired
                  ? 'Ghế đã được mở lại. Hãy đặt lại để chọn và giữ ghế mới.'
                  : 'Hoàn tất thanh toán trước khi đồng hồ về 00:00.'}
              </p>
            </div>
          ) : (
            <div className="checkout-summary__session checkout-summary__session--muted">
              <strong>Chưa giữ ghế</strong>
              <p>Chọn một hoặc nhiều ghế rồi bấm “Giữ ghế tạm thời” để chạy đồng hồ 15 phút.</p>
            </div>
          )}

          {holdExpired ? (
            <p className="checkout-page__error" role="alert">{SEAT_HOLD_EXPIRED_MESSAGE}</p>
          ) : null}
          {payment.error ? <p className="checkout-page__error">{payment.error}</p> : null}

          <div className="checkout-summary__actions">
            <button
              type="button"
              className="checkout-summary__action checkout-summary__action--primary"
              onClick={handleReserve}
              disabled={booking.loading || !canUseReserveAction}
            >
              {holdExpired ? 'Đặt lại' : booking.loading ? 'Đang giữ ghế...' : hasActiveHold ? 'Đã giữ ghế' : 'Giữ ghế tạm thời'}
            </button>
            <button
              type="button"
              className="checkout-summary__action checkout-summary__action--primary"
              onClick={handlePayment}
              disabled={!canPay}
            >
              {payment.loading ? 'Đang xử lý...' : 'Thanh toán'}
            </button>
            <button
              type="button"
              className="checkout-summary__action checkout-summary__action--danger"
              onClick={handleCancelBooking}
              disabled={booking.loading}
            >
              {booking.loading ? 'Đang hủy...' : 'Hủy đặt vé'}
            </button>
          </div>
        </aside>
      </section>
    </MainLayout>
  );
};
