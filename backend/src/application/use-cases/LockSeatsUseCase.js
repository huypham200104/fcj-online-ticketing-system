import { BookingSession } from '../../domain/entities/BookingSession.js';
import { AppError } from '../../domain/errors/AppError.js';
import crypto from 'crypto';

const DEFAULT_SEAT_LOCK_TTL_MINUTES = 15;
const MAX_SEATS_PER_SESSION = 8;

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

    if (seatIds.length > MAX_SEATS_PER_SESSION) {
      throw new AppError(`Chỉ được chọn tối đa ${MAX_SEATS_PER_SESSION} ghế mỗi lần mua`, 400);
    }

    const uniqueSeatIds = [...new Set(seatIds)];
    if (uniqueSeatIds.length !== seatIds.length) {
      throw new AppError('Danh sách ghế có ghế bị trùng.', 400);
    }

    // 1. Kiểm tra xem các ghế này có đang bị lock hoặc đã bán không
    const activeSessions = await this.bookingRepository.findActiveSessionsByShowTime(showTimeId);
    await this.seatRepository.syncLocksForShowTime(
      showTimeId,
      new Set(activeSessions.map(session => session.id))
    );
    
    const lockedSeatIds = new Set();
    for (const session of activeSessions) {
      for (const id of session.seatIds) {
        lockedSeatIds.add(id);
      }
    }

    const allSeats = await this.seatRepository.getSeatsForShowTime(showTimeId, undefined);
    const seatsById = new Map(allSeats.map(seat => [seat.id, seat]));

    for (const seatId of seatIds) {
      const seat = seatsById.get(seatId);
      if (!seat) {
        throw new AppError(`Ghế ${seatId} không tồn tại.`, 400);
      }
      if (seat.status === 'sold') {
        throw new AppError(`Ghế ${seatId} đã được bán. Vui lòng chọn ghế khác.`, 409);
      }
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
    await this.seatRepository.lockSeatsForSession({
      showTimeId,
      seatIds,
      sessionId: newSession.id
    });

    return newSession;
  }
}
