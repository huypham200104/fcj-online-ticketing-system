import { AppError } from '../../domain/errors/AppError.js';

export class CancelBookingSessionUseCase {
  constructor(bookingRepository, seatRepository) {
    this.bookingRepository = bookingRepository;
    this.seatRepository = seatRepository;
  }

  async execute({ sessionId, userId }) {
    const session = await this.bookingRepository.findById(sessionId);

    if (!session) {
      throw new AppError('Không tìm thấy phiên giữ vé', 404);
    }

    if (session.userId !== userId) {
      throw new AppError('Bạn không có quyền hủy phiên giữ vé này', 403);
    }

    if (session.status === 'confirmed') {
      throw new AppError('Vé đã thanh toán nên không thể hủy phiên giữ chỗ.', 400);
    }

    if (session.status === 'cancelled') {
      return session;
    }

    const cancelled = await this.bookingRepository.cancel(sessionId);
    await this.seatRepository.releaseSeatsForSession(sessionId);
    return cancelled;
  }
}
