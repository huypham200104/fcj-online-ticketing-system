export type TicketStatus = 'valid' | 'used' | 'expired' | 'cancelled';

export interface Ticket {
  id: string;
  code: string;
  eventId: string;
  eventTitle: string;
  ticketTypeName: string;
  seatLabel?: string;
  holderName: string;
  eventDateLabel: string;
  venueName: string;
  venueAddress: string;
  purchasedAt: string;
  status: TicketStatus;
  qrValue: string;
}
