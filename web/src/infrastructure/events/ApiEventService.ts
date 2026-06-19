import type {
  EventCategory,
  EventVisualTone,
  HomeBanner,
  HomeFeed,
  MovieSchedule,
  MovieSeat,
  MovieShowtime,
  TicketEvent,
  TicketType,
} from '@/domain/entities/Event';
import type { IEventService } from '@/application/ports/IEventService';
import type { PaginatedResult } from '@/shared/types/ApiResponse';
import { apiRequest, apiRequestEnvelope } from '@/infrastructure/api/httpClient';
import type { BackendEvent, BackendSeat, BackendShowTime } from '@/infrastructure/api/backendTypes';

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

function toTimeLabel(time: string): string {
  return time.length === 5 ? time : time.slice(0, 5);
}

function getCategory(event: BackendEvent): EventCategory {
  const text = `${event.type ?? ''} ${event.name} ${event.description} ${event.location}`.toLowerCase();
  return text.includes('phim') || text.includes('movie') || text.includes('cgv') ? 'Phim' : 'Concert';
}

function getVisualTone(index: number): EventVisualTone {
  return (['primary', 'accent', 'info'] as const)[index % 3];
}

function splitVenue(location: string) {
  const [name, ...rest] = location.split(',').map((part) => part.trim()).filter(Boolean);
  const city = rest.at(-1) ?? 'Việt Nam';

  return {
    name: name || location,
    address: rest.length ? rest.join(', ') : location,
    city,
  };
}

function mapTicketTypes(event: BackendEvent): TicketType[] {
  return event.ticketTypes.map((ticketType) => ({
    id: String(ticketType.id),
    name: ticketType.name,
    description: `${ticketType.available}/${ticketType.quantity} vé còn mở bán`,
    price: ticketType.price,
    currency: 'VND',
    totalStock: ticketType.quantity,
    remainingStock: ticketType.available,
    maxPerOrder: Math.max(1, Math.min(8, ticketType.available || ticketType.quantity)),
  }));
}

function mapSeat(seat: BackendSeat, basePrice: number): MovieSeat {
  const status = seat.status === 'sold' ? 'taken' : seat.status;

  return {
    id: seat.id,
    row: seat.row,
    number: seat.number,
    label: `${seat.row}${seat.number}`,
    status,
    priceModifier: seat.price - basePrice,
  };
}

function getCinemaId(showtime: BackendShowTime): string {
  const raw = `${showtime.venueName ?? 'venue'}-${showtime.venueAddress ?? showtime.roomId}`;
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getTicketTypeForShowtime(event: TicketEvent, showtime: BackendShowTime): string {
  const ticketTypes = event.ticketTypes;
  if (showtime.roomType === 'imax' && ticketTypes[1]) return ticketTypes[1].id;
  return ticketTypes[0]?.id ?? '';
}

async function getMovieSchedules(event: TicketEvent): Promise<MovieSchedule[]> {
  if (event.category !== 'Phim') return [];

  const showtimes = await apiRequest<BackendShowTime[]>(`/events/${event.id}/showtimes`, { auth: false });
  const schedules = new Map<string, MovieSchedule>();

  await Promise.all(
    showtimes.map(async (showtime) => {
      const cinemaId = getCinemaId(showtime);
      const ticketTypeId = getTicketTypeForShowtime(event, showtime);
      const basePrice = event.ticketTypes.find((ticketType) => ticketType.id === ticketTypeId)?.price ?? event.priceFrom;
      const seats = await apiRequest<BackendSeat[]>(`/showtimes/${showtime.id}/seats`, { auth: false });
      const schedule =
        schedules.get(cinemaId) ??
        {
          cinema: {
            id: cinemaId,
            name: showtime.venueName ?? event.venue.name,
            address: showtime.venueAddress ?? event.venue.address,
            city: event.venue.city,
          },
          showtimes: [],
        };

      const mappedShowtime: MovieShowtime = {
        id: showtime.id,
        cinemaId,
        startsAt: `${showtime.date}T${showtime.time}:00`,
        dateLabel: toDateLabel(showtime.date, showtime.time).split(' ')[0] ?? showtime.date,
        timeLabel: toTimeLabel(showtime.time),
        hallName: showtime.roomName ?? showtime.roomId,
        format: showtime.roomType === 'imax' ? 'IMAX' : '2D',
        ticketTypeId,
        seats: seats.map((seat) => mapSeat(seat, basePrice)),
      };

      schedule.showtimes.push(mappedShowtime);
      schedules.set(cinemaId, schedule);
    }),
  );

  return Array.from(schedules.values()).map((schedule) => ({
    ...schedule,
    showtimes: schedule.showtimes.sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  }));
}

async function mapEvent(event: BackendEvent, index: number, includeSchedules = false): Promise<TicketEvent> {
  const ticketTypes = mapTicketTypes(event);
  const category = getCategory(event);
  const venue = splitVenue(event.location);
  const priceFrom = ticketTypes.length ? Math.min(...ticketTypes.map((ticketType) => ticketType.price)) : 0;
  const totalStock = event.ticketTypes.reduce((sum, ticketType) => sum + ticketType.quantity, 0);
  const remainingStock = event.ticketTypes.reduce((sum, ticketType) => sum + ticketType.available, 0);
  const mapped: TicketEvent = {
    id: String(event.id),
    title: event.name,
    category,
    shortDescription: event.description,
    description: event.description,
    dateLabel: toDateLabel(event.date, event.time),
    startDateTime: `${event.date}T${event.time}:00`,
    endDateTime: `${event.date}T${event.time}:00`,
    venue,
    organizer: category === 'Phim' ? 'Cinematic Pulse Cinema' : 'Cinematic Pulse Events',
    priceFrom,
    salesProgress: totalStock ? Math.round(((totalStock - remainingStock) / totalStock) * 100) : 0,
    visualTone: getVisualTone(index),
    ticketTypes,
    posterUrl: event.image,
    rating: category === 'Phim' ? 'P' : undefined,
    duration: category === 'Phim' ? `${event.duration ?? 120} phút` : undefined,
    genre: category === 'Phim' ? 'Điện ảnh' : 'Live event',
  };

  return {
    ...mapped,
    movieSchedules: includeSchedules ? await getMovieSchedules(mapped) : undefined,
  };
}

function toBanner(event: TicketEvent): HomeBanner {
  return {
    id: `banner-${event.id}`,
    title: event.title,
    subtitle: event.shortDescription,
    imageUrl: event.posterUrl ?? '',
    link: `/events/${event.id}`,
    tag: event.category,
  };
}

export class ApiEventService implements IEventService {
  async getHomeFeed(): Promise<HomeFeed> {
    const events = await this.listEvents();
    const categories = ['Tất cả', ...Array.from(new Set(events.map((event) => event.category)))];

    return {
      events,
      categories,
      stats: [
        { label: 'Sự kiện đang mở bán', value: String(events.length), helper: 'Dữ liệu từ backend', icon: 'ticket' },
        {
          label: 'Vé còn lại',
          value: String(events.reduce((sum, event) => sum + event.ticketTypes.reduce((sub, ticket) => sub + ticket.remainingStock, 0), 0)),
          helper: 'Theo tồn kho API',
          icon: 'qr',
        },
        {
          label: 'Rạp và địa điểm',
          value: String(new Set(events.map((event) => event.venue.name)).size),
          helper: 'Đang phục vụ',
          icon: 'pin',
        },
      ],
      featuredEvent: events[0],
      banners: events.slice(0, 3).map(toBanner),
      nowShowingMovies: events.filter((event) => event.category === 'Phim').slice(0, 8),
      upcomingConcerts: events.filter((event) => event.category === 'Concert').slice(0, 6),
    };
  }

  async listEvents(): Promise<TicketEvent[]> {
    const events = await apiRequest<BackendEvent[]>('/events', { auth: false });
    return Promise.all(events.map((event, index) => mapEvent(event, index)));
  }

  async listEventsPage(
    category: TicketEvent['category'],
    page: number,
    pageSize: number,
    filters?: { q?: string; city?: string },
  ): Promise<PaginatedResult<TicketEvent>> {
    const params = new URLSearchParams({
      type: category === 'Phim' ? 'movie' : 'concert',
      page: String(page),
      pageSize: String(pageSize),
    });
    if (filters?.q) params.set('q', filters.q);
    if (filters?.city) params.set('city', filters.city);
    const response = await apiRequestEnvelope<BackendEvent[]>(`/events?${params.toString()}`, { auth: false });
    const items = await Promise.all((response.data ?? []).map((event, index) => mapEvent(event, index)));

    return {
      items,
      total: response.total ?? items.length,
      page: response.page ?? page,
      pageSize: response.pageSize ?? pageSize,
      totalPages: response.totalPages ?? 1,
    };
  }

  async getEventById(eventId: string): Promise<TicketEvent | null> {
    try {
      const event = await apiRequest<BackendEvent>(`/events/${eventId}`, { auth: false });
      return mapEvent(event, Number(eventId) || 0, true);
    } catch {
      return null;
    }
  }
}
