import type { Ticket, TicketStatus } from '@/domain/entities/Ticket';
import type { ITicketService } from '@/application/ports/ITicketService';
import { getAuthSession } from '@/infrastructure/api/authSession';
import { apiRequest } from '@/infrastructure/api/httpClient';
import type {
  BackendEvent,
  BackendSeat,
  BackendShowTime,
  BackendTicket,
} from '@/infrastructure/api/backendTypes';

interface TicketLookup {
  event: BackendEvent;
  showtime: BackendShowTime;
}

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

function mapStatus(status: BackendTicket['status']): TicketStatus {
  if (status === 'checked-in') return 'used';
  return status;
}

function getSeatLabel(seat?: BackendSeat): string | undefined {
  if (!seat) return undefined;
  return `${seat.row}${seat.number}`;
}

function toQrValue(ticketId: string, qrPayload: string): string {
  return JSON.stringify({ ticketId, qrPayload });
}

async function getTicketQrPayload(ticket: BackendTicket): Promise<string> {
  if (ticket.qrCode) return ticket.qrCode;

  const qr = await apiRequest<{ qrCode: string }>(`/tickets/${ticket.id}/qr`);
  return qr.qrCode;
}

async function buildShowtimeLookup(): Promise<Map<string, TicketLookup>> {
  const events = await apiRequest<BackendEvent[]>('/events', { auth: false });
  const entries = await Promise.all(
    events.map(async (event) => {
      const showtimes = await apiRequest<BackendShowTime[]>(`/events/${event.id}/showtimes`, { auth: false });
      return showtimes.map((showtime): [string, TicketLookup] => [showtime.id, { event, showtime }]);
    }),
  );

  return new Map(entries.flat());
}

export class ApiTicketService implements ITicketService {
  async listMyTickets(): Promise<Ticket[]> {
    const [tickets, lookup] = await Promise.all([
      apiRequest<BackendTicket[]>('/tickets/my-tickets'),
      buildShowtimeLookup(),
    ]);

    const seatsByShowtime = new Map<string, BackendSeat[]>();

    return Promise.all(
      tickets.map(async (ticket) => {
        const match = lookup.get(ticket.showTimeId);
        const event = match?.event;
        const showtime = match?.showtime;

        if (showtime && !seatsByShowtime.has(showtime.id)) {
          seatsByShowtime.set(showtime.id, await apiRequest<BackendSeat[]>(`/showtimes/${showtime.id}/seats`, { auth: false }));
        }

        const [seat, qrPayload] = await Promise.all([
          Promise.resolve(seatsByShowtime.get(ticket.showTimeId)?.find((item) => item.id === ticket.seatId)),
          getTicketQrPayload(ticket),
        ]);
        const ticketType = event?.ticketTypes[0];

        return {
          id: ticket.id,
          code: ticket.id.slice(0, 8).toUpperCase(),
          eventId: event ? String(event.id) : ticket.showTimeId,
          eventTitle: event?.name ?? 'Sự kiện',
          ticketTypeName: ticketType?.name ?? 'Vé',
          seatLabel: getSeatLabel(seat),
          holderName: getAuthSession()?.user.name ?? 'Khách Cinematic',
          eventDateLabel: showtime ? toDateLabel(showtime.date, showtime.time) : 'Đang cập nhật',
          venueName: showtime?.venueName ?? event?.location ?? 'Đang cập nhật',
          venueAddress: showtime?.venueAddress ?? event?.location ?? 'Đang cập nhật',
          purchasedAt: new Date().toISOString(),
          status: mapStatus(ticket.status),
          qrValue: toQrValue(ticket.id, qrPayload),
        };
      }),
    );
  }

  async getTicketById(ticketId: string): Promise<Ticket | null> {
    const tickets = await this.listMyTickets();
    const ticket = tickets.find((item) => item.id === ticketId);
    if (!ticket) return null;

    const qr = await apiRequest<{ qrCode: string }>(`/tickets/${ticketId}/qr`);
    return {
      ...ticket,
      qrValue: toQrValue(ticket.id, qr.qrCode),
    };
  }
}
