import { BookingSession } from '../../domain/entities/BookingSession.js';
import { AppError } from '../../domain/errors/AppError.js';
import crypto from 'crypto';

const DEFAULT_SEAT_LOCK_TTL_MINUTES = 15;

function getSeatLockTtlMs() {
  const configuredMinutes = Number(process.env.SEAT_LOCK_TTL_MINUTES ?? DEFAULT_SEAT_LOCK_TTL_MINUTES);
  const safeMinutes = Number.isFinite(configuredMinutes) && configuredMinutes > 0
    ? configuredMinutes
    : DEFAULT_SEAT_LOCK_TTL_MINUTES;

  return safeMinutes * 60 * 1000;
}

export class LockSeatsUseCase {
  constructor(bookingRepository, seatRepository) {
    this.bookingRepository = bookingRepository;
    this.seatRepository = seatRepository;
  }

  async execute({ userId, showTimeId, seatIds }) {
    if (!seatIds || seatIds.length === 0) {
      throw new AppError('Phải chọn ít nhất 1 ghế', 400);
    }

    // 1. Kiểm tra xem các ghế này có đang bị lock bởi người khác không
    const activeSessions = await this.bookingRepository.findActiveSessionsByShowTime(showTimeId);
    
    const lockedSeatIds = new Set();
    for (const session of activeSessions) {
      for (const id of session.seatIds) {
        lockedSeatIds.add(id);
      }
    }

    for (const seatId of seatIds) {
      if (lockedSeatIds.has(seatId)) {
        throw new AppError(`Ghế ${seatId} đang được giữ bởi người khác. Vui lòng chọn ghế khác.`, 409);
      }
    }

    // 2. Tạo phiên giữ ghế theo TTL backend.
    const expiresAt = new Date(Date.now() + getSeatLockTtlMs()).toISOString();
    
    const newSession = new BookingSession({
      id: crypto.randomUUID(),
      userId,
      showTimeId,
      seatIds,
      status: 'pending',
      expiresAt
    });

    await this.bookingRepository.save(newSession);

    return newSession;
  }
}
