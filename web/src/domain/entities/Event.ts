export type EventCategory = 'Concert' | 'Workshop' | 'Theater' | 'Sport' | 'Festival';

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
}

export interface HomeStat {
  label: string;
  value: string;
  helper: string;
}

export interface HomeFeed {
  events: TicketEvent[];
  categories: string[];
  stats: HomeStat[];
  featuredEvent: TicketEvent;
}

