import type { BookingSession } from '@/domain/entities/BookingSession';
import type { CreateBookingSessionDTO } from '@/application/dtos/BookingDTO';
import type { IBookingService } from '@/application/ports/IBookingService';
import { apiRequest } from '@/infrastructure/api/httpClient';
import type {
  BackendBookingSession,
  BackendEvent,
  BackendSeat,
  BackendShowTime,
} from '@/infrastructure/api/backendTypes';
import { getBookingSession, removeBookingSession, saveBookingSession } from './bookingSessionCache';

function toDateLabel(date: string, time: string): string {
  const parsed = new Date(`${date}T${time}:00`);
  if (Number.isNaN(parsed.getTime())) return `${date}, ${time}`;

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

function getSeatLabel(seat: BackendSeat): string {
  return `${seat.row}${seat.number}`;
}

function mapStatus(status: BackendBookingSession['status']): BookingSession['status'] {
  if (status === 'confirmed') return 'paid';
  if (status === 'expired') return 'expired';
  return 'active';
}

function getTicketType(event: BackendEvent, ticketTypeId?: string) {
  return event.ticketTypes.find((item) => String(item.id) === ticketTypeId) ?? event.ticketTypes[0];
}

export class ApiBookingService implements IBookingService {
  async createSession(dto: CreateBookingSessionDTO): Promise<BookingSession> {
    const event = await apiRequest<BackendEvent>(`/events/${dto.eventId}`, { auth: false });
    const showtimes = await apiRequest<BackendShowTime[]>(`/events/${dto.eventId}/showtimes`, { auth: false });
    const showtime = showtimes.find((item) => item.id === dto.showtimeId) ?? showtimes[0];

    if (!showtime) {
      throw new Error('Backend chưa có suất chiếu cho sự kiện này.');
    }

    const seats = await apiRequest<BackendSeat[]>(`/showtimes/${showtime.id}/seats`, { auth: false });
    const requestedSeatIds =
      dto.seatIds && dto.seatIds.length > 0
        ? dto.seatIds
        : seats.filter((seat) => seat.status === 'available').slice(0, dto.quantity).map((seat) => seat.id);
    const selectedSeats = seats.filter((seat) => requestedSeatIds.includes(seat.id));

    if (selectedSeats.length !== requestedSeatIds.length) {
      throw new Error('Một hoặc nhiều ghế không tồn tại trong suất chiếu này.');
    }

    const unavailableSeat = selectedSeats.find((seat) => seat.status !== 'available');
    if (unavailableSeat) {
      throw new Error(`Ghế ${getSeatLabel(unavailableSeat)} không còn trống.`);
    }

    const backendSession = await apiRequest<BackendBookingSession>('/bookings/lock-seats', {
      method: 'POST',
      body: {
        showTimeId: showtime.id,
        seatIds: requestedSeatIds,
      },
    });
    const ticketType = getTicketType(event, dto.ticketTypeId);
    const unitPrice = ticketType?.price ?? selectedSeats[0]?.price ?? 0;
    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0) || unitPrice * dto.quantity;
    const session: BookingSession = {
      id: backendSession.id,
      eventId: String(event.id),
      eventTitle: event.name,
      ticketTypeId: String(ticketType?.id ?? dto.ticketTypeId),
      ticketTypeName: ticketType?.name ?? 'Vé',
      cinemaId: showtime.venueName ?? showtime.roomId,
      cinemaName: showtime.venueName ?? event.location,
      cinemaAddress: showtime.venueAddress ?? event.location,
      showtimeId: showtime.id,
      showtimeLabel: toDateLabel(showtime.date, showtime.time),
      hallName: showtime.roomName ?? showtime.roomId,
      seatIds: selectedSeats.map((seat) => seat.id),
      seatLabels: selectedSeats.map(getSeatLabel),
      quantity: selectedSeats.length || dto.quantity,
      unitPrice,
      totalPrice,
      currency: 'VND',
      createdAt: new Date().toISOString(),
      expiresAt: backendSession.expiresAt,
      status: mapStatus(backendSession.status),
    };

    saveBookingSession(session);
    return session;
  }

  async getSession(sessionId: string): Promise<BookingSession | null> {
    return getBookingSession(sessionId);
  }

  async cancelSession(sessionId: string): Promise<void> {
    await apiRequest<BackendBookingSession>(`/bookings/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    removeBookingSession(sessionId);
  }
}
