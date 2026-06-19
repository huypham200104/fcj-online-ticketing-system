import { AppError } from '../../domain/errors/AppError.js';

export class CheckInTicketUseCase {
  constructor(ticketRepository, showTimeRepository, eventRepository, venueRepository, seatRepository, userRepository) {
    this.ticketRepository = ticketRepository;
    this.showTimeRepository = showTimeRepository;
    this.eventRepository = eventRepository;
    this.venueRepository = venueRepository;
    this.seatRepository = seatRepository;
    this.userRepository = userRepository;
  }

  async execute({ ticketId, qrPayload, staffUser }) {
    const scannedAt = new Date().toISOString();
    const staffProfile = staffUser?.id ? await this.userRepository.findById(staffUser.id) : null;
    const staff = {
      id: staffUser?.id || 'unknown',
      email: staffUser?.email || null,
      name: staffProfile?.name || staffUser?.email || 'Nhân viên'
    };

    try {
      if (!ticketId || !qrPayload) {
        throw new AppError('Thiếu mã vé hoặc QR payload', 400);
      }

      const ticket = await this.ticketRepository.findById(ticketId);
      
      if (!ticket) {
        throw new AppError('Vé không tồn tại', 404);
      }

      if (ticket.qrCode !== qrPayload) {
        throw new AppError('Mã QR không hợp lệ', 400);
      }

      if (ticket.status === 'checked-in') {
        throw new AppError('Vé này đã được sử dụng để vào rạp', 409);
      }

      if (ticket.status !== 'valid') {
        throw new AppError(`Trạng thái vé không hợp lệ để check-in: ${ticket.status}`, 400);
      }

      const showTime = await this.showTimeRepository.findById(ticket.showTimeId);
      if (showTime && showTime.isPast()) {
        throw new AppError('Suất chiếu đã kết thúc, không thể check-in', 400);
      }

      ticket.status = 'checked-in';
      ticket.checkedInAt = scannedAt;
      ticket.checkedInBy = staff.id;
      await this.ticketRepository.save(ticket);

      const result = await this.toCheckInRecord({
        ticket,
        status: 'success',
        message: 'Check-in thành công.',
        scannedAt,
        staff
      });

      return this.ticketRepository.recordCheckInAttempt(result);
    } catch (error) {
      await this.ticketRepository.recordCheckInAttempt({
        ticketId: ticketId || 'unknown',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Không thể check-in vé.',
        scannedAt,
        staff
      });
      throw error;
    }
  }

  async toCheckInRecord({ ticket, status, message, scannedAt, staff }) {
    const details = ticket ? await this.toStaffTicketInfo(ticket) : null;

    return {
      ticketId: ticket?.id || 'unknown',
      status,
      message,
      scannedAt,
      staff,
      ticket: details
    };
  }

  async toStaffTicketInfo(ticket) {
    const showTime = await this.showTimeRepository.findById(ticket.showTimeId);
    const event = showTime ? await this.eventRepository.findById(showTime.eventId) : null;
    const room = showTime ? await this.venueRepository.getRoomById(showTime.roomId) : null;
    const venue = room ? await this.venueRepository.getVenueById(room.venueId) : null;
    const seats = room ? await this.seatRepository.getSeatsByRoomId(room.id) : [];
    const seat = seats.find(item => item.id === ticket.seatId);
    const holder = await this.userRepository.findById(ticket.userId);

    return {
      id: ticket.id,
      code: ticket.id.slice(0, 8).toUpperCase(),
      status: ticket.status,
      holderName: holder?.name || 'Khách Cinematic',
      eventTitle: event?.name || 'Sự kiện',
      eventType: event?.type || null,
      showTimeId: ticket.showTimeId,
      eventDate: showTime?.date || null,
      eventTime: showTime?.time || null,
      seatLabel: seat ? `${seat.row}${seat.number}` : null,
      roomName: room?.name || null,
      venueName: venue?.name || event?.location || 'Đang cập nhật',
      venueAddress: venue ? `${venue.address}, ${venue.city}` : event?.location || 'Đang cập nhật',
      checkedInAt: ticket.checkedInAt,
      checkedInBy: ticket.checkedInBy
    };
  }
}
