import { NotFoundError } from '../../domain/errors/AppError.js';

export class GetShowTimeSeatsUseCase {
  constructor(showTimeRepository, seatRepository, bookingRepository) {
    this.showTimeRepository = showTimeRepository;
    this.seatRepository = seatRepository;
    this.bookingRepository = bookingRepository;
  }

  async execute(showTimeId) {
    const showTime = await this.showTimeRepository.findById(showTimeId);
    if (!showTime) {
      throw new NotFoundError('ShowTime');
    }

    if (this.bookingRepository) {
      const activeSessions = await this.bookingRepository.findActiveSessionsByShowTime(showTimeId);
      await this.seatRepository.syncLocksForShowTime(
        showTimeId,
        new Set(activeSessions.map(session => session.id))
      );
    }

    return this.seatRepository.getSeatsForShowTime(showTimeId, showTime.roomId);
  }
}
