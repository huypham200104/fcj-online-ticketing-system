import { AppError } from '../../domain/errors/AppError.js';

export class OrderController {
  constructor({ orderRepository, ticketRepository, bookingRepository, showTimeRepository, eventRepository, venueRepository, seatRepository }) {
    this.orderRepository = orderRepository;
    this.ticketRepository = ticketRepository;
    this.bookingRepository = bookingRepository;
    this.showTimeRepository = showTimeRepository;
    this.eventRepository = eventRepository;
    this.venueRepository = venueRepository;
    this.seatRepository = seatRepository;

    this.getMyOrders = this.getMyOrders.bind(this);
    this.getOrderDetail = this.getOrderDetail.bind(this);
  }

  async getMyOrders(req, res, next) {
    try {
      const orders = await this.orderRepository.findByUserId(req.user.id);
      const details = await Promise.all(
        orders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(order => this.toCustomerOrder(order))
      );

      res.json({ success: true, data: details, total: details.length });
    } catch (error) {
      next(error);
    }
  }

  async getOrderDetail(req, res, next) {
    try {
      const order = await this.orderRepository.findById(req.params.id);
      if (!order) throw new AppError('Không tìm thấy đơn hàng', 404);
      if (order.userId !== req.user.id) throw new AppError('Bạn không có quyền xem đơn hàng này', 403);

      res.json({ success: true, data: await this.toCustomerOrder(order) });
    } catch (error) {
      next(error);
    }
  }

  async toCustomerOrder(order) {
    const session = await this.bookingRepository.findById(order.bookingSessionId);
    const showTime = session ? await this.showTimeRepository.findById(session.showTimeId) : null;
    const event = showTime ? await this.eventRepository.findById(showTime.eventId) : null;
    const room = showTime ? await this.venueRepository.getRoomById(showTime.roomId) : null;
    const venue = room ? await this.venueRepository.getVenueById(room.venueId) : null;
    const roomSeats = room ? await this.seatRepository.getSeatsByRoomId(room.id) : [];
    const tickets = await this.ticketRepository.findByOrderId(order.id);
    const seats = tickets.map(ticket => {
      const seat = roomSeats.find(item => item.id === ticket.seatId);
      return {
        id: ticket.seatId,
        label: seat ? `${seat.row}${seat.number}` : ticket.seatId,
        type: seat?.type || null,
        price: seat?.price || 0
      };
    });

    return {
      order,
      tickets,
      event: event ? {
        id: event.id,
        name: event.name,
        type: event.type,
        image: event.image,
        location: event.location
      } : null,
      showTime: showTime ? {
        id: showTime.id,
        date: showTime.date,
        time: showTime.time,
        format: showTime.format
      } : null,
      venue: venue ? {
        id: venue.id,
        name: venue.name,
        address: venue.address,
        city: venue.city
      } : null,
      room: room ? {
        id: room.id,
        name: room.name,
        type: room.type
      } : null,
      seats
    };
  }
}
