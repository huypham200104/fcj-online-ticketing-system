function toQrValue(ticket) {
  return JSON.stringify({
    ticketId: ticket.id,
    qrPayload: ticket.qrCode
  });
}

function getSeatLabel(seat) {
  if (!seat) return null;
  return `${seat.row}${seat.number}`;
}

export class SendTicketEmailUseCase {
  constructor({
    userRepository,
    showTimeRepository,
    eventRepository,
    venueRepository,
    seatRepository,
    ticketEmailService
  }) {
    this.userRepository = userRepository;
    this.showTimeRepository = showTimeRepository;
    this.eventRepository = eventRepository;
    this.venueRepository = venueRepository;
    this.seatRepository = seatRepository;
    this.ticketEmailService = ticketEmailService;
  }

  async execute({ order, tickets }) {
    const user = await this.userRepository.findById(order.userId);
    if (!user?.email) {
      return { status: 'skipped', reason: 'customer_email_not_found' };
    }

    const enrichedTickets = await Promise.all(
      tickets.map(ticket => this.toEmailTicket(ticket, user))
    );

    return this.ticketEmailService.sendTicketEmail({
      to: user.email,
      customerName: user.name,
      order,
      tickets: enrichedTickets
    });
  }

  async toEmailTicket(ticket, user) {
    const showTime = await this.showTimeRepository.findById(ticket.showTimeId);
    const event = showTime ? await this.eventRepository.findById(showTime.eventId) : null;
    const room = showTime ? await this.venueRepository.getRoomById(showTime.roomId) : null;
    const venue = room ? await this.venueRepository.getVenueById(room.venueId) : null;
    const seats = room ? await this.seatRepository.getSeatsByRoomId(room.id) : [];
    const seat = seats.find(item => item.id === ticket.seatId);

    return {
      id: ticket.id,
      code: ticket.id.slice(0, 8).toUpperCase(),
      holderName: user.name || user.email,
      eventTitle: event?.name || 'Su kien',
      eventDate: showTime?.date || null,
      eventTime: showTime?.time || null,
      seatLabel: getSeatLabel(seat),
      venueName: venue?.name || event?.location || 'Dang cap nhat',
      venueAddress: venue ? `${venue.address}, ${venue.city}` : event?.location || 'Dang cap nhat',
      qrValue: toQrValue(ticket)
    };
  }
}
