import type { Ticket } from '@/domain/entities/Ticket';

export const mockTickets: Ticket[] = [
  {
    id: 'ticket-demo-summer-001',
    code: 'TS-SV26-001',
    eventId: 'evt-summer-vibes-2026',
    eventTitle: 'Summer Vibes 2026',
    ticketTypeName: 'VIP',
    holderName: 'Demo User',
    eventDateLabel: '26 Thg 7, 19:00',
    venueName: 'Sân vận động Quân khu 7',
    venueAddress: '202 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận',
    purchasedAt: '2026-06-18T09:30:00+07:00',
    status: 'valid',
    qrValue: 'ticketspace://check-in/ticket-demo-summer-001',
  },
  {
    id: 'ticket-demo-indie-002',
    code: 'TS-SIN-002',
    eventId: 'evt-saigon-indie-night',
    eventTitle: 'Saigon Indie Night',
    ticketTypeName: 'Balcony',
    holderName: 'Demo User',
    eventDateLabel: '15 Thg 8, 20:00',
    venueName: 'Nhà hát Hòa Bình',
    venueAddress: '240 Đường 3/2, Phường 12, Quận 10',
    purchasedAt: '2026-06-17T21:15:00+07:00',
    status: 'used',
    qrValue: 'ticketspace://check-in/ticket-demo-indie-002',
  },
];

