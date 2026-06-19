export interface BackendEvent {
  id: number | string;
  name: string;
  type?: string;
  description: string;
  location: string;
  date: string;
  time: string;
  duration?: number;
  image?: string;
  ticketTypes: BackendTicketType[];
}

export interface BackendTicketType {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  available: number;
}

export interface BackendShowTime {
  id: string;
  eventId: number | string;
  roomId: string;
  date: string;
  time: string;
  roomName?: string | null;
  roomType?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
}

export interface BackendSeat {
  id: string;
  roomId: string;
  row: string;
  number: number;
  type: string;
  status: 'available' | 'locked' | 'sold';
  price: number;
}

export interface BackendBookingSession {
  id: string;
  userId: string;
  showTimeId: string;
  seatIds: string[];
  status: 'pending' | 'confirmed' | 'expired';
  expiresAt: string;
}

export interface BackendOrder {
  id: string;
  userId: string;
  bookingSessionId: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  createdAt: string;
}

export interface BackendTicket {
  id: string;
  orderId: string;
  userId: string;
  showTimeId: string;
  seatId: string;
  status: 'valid' | 'checked-in' | 'expired' | 'cancelled';
  qrCode: string | null;
  checkedInAt?: string | null;
  checkedInBy?: string | null;
}

export interface BackendStaffTicketInfo {
  id: string;
  code: string;
  status: BackendTicket['status'];
  holderName: string;
  eventTitle: string;
  eventType: string | null;
  showTimeId: string;
  eventDate: string | null;
  eventTime: string | null;
  seatLabel: string | null;
  roomName: string | null;
  venueName: string;
  venueAddress: string;
  checkedInAt: string | null;
  checkedInBy: string | null;
}

export interface BackendCheckInRecord {
  id: string;
  ticketId: string;
  scannedAt: string;
  status: 'success' | 'failed';
  message: string;
  staff: {
    id: string;
    email: string | null;
    name: string;
  } | null;
  ticket: BackendStaffTicketInfo | null;
}
