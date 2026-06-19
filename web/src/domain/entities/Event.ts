export type EventCategory = 'Phim' | 'Concert';

export type EventVisualTone = 'primary' | 'accent' | 'info';

export interface EventVenue {
  name: string;
  address: string;
  city: string;
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'VND';
  totalStock: number;
  remainingStock: number;
  maxPerOrder: number;
}

export type MovieSeatStatus = 'available' | 'taken' | 'locked';

export interface MovieSeat {
  id: string;
  row: string;
  number: number;
  label: string;
  status: MovieSeatStatus;
  priceModifier: number;
}

export interface MovieCinema {
  id: string;
  name: string;
  address: string;
  city: string;
}

export interface MovieShowtime {
  id: string;
  cinemaId: string;
  startsAt: string;
  dateLabel: string;
  timeLabel: string;
  hallName: string;
  format: string;
  ticketTypeId: string;
  seats: MovieSeat[];
}

export interface MovieSchedule {
  cinema: MovieCinema;
  showtimes: MovieShowtime[];
}

export interface TicketEvent {
  id: string;
  title: string;
  category: EventCategory;
  shortDescription: string;
  description: string;
  dateLabel: string;
  startDateTime: string;
  endDateTime: string;
  venue: EventVenue;
  organizer: string;
  priceFrom: number;
  salesProgress: number;
  visualTone: EventVisualTone;
  ticketTypes: TicketType[];
  posterUrl?: string;
  rating?: string;
  duration?: string;
  genre?: string;
  movieSchedules?: MovieSchedule[];
}

export interface HomeBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  tag: string;
}

export interface HomeStat {
  label: string;
  value: string;
  helper: string;
  icon: string;
}

export interface HomeFeed {
  events: TicketEvent[];
  categories: string[];
  stats: HomeStat[];
  featuredEvent: TicketEvent;
  banners: HomeBanner[];
  nowShowingMovies: TicketEvent[];
  upcomingConcerts: TicketEvent[];
}
