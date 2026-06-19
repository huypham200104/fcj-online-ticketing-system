export class BookingSession {
  constructor({ id, userId, showTimeId, seatIds, status, expiresAt }) {
    this.id = id;
    this.userId = userId;
    this.showTimeId = showTimeId;
    this.seatIds = seatIds; // array of seat IDs
    this.status = status; // 'pending', 'confirmed', 'expired', 'cancelled'
    this.expiresAt = expiresAt; // timestamp
  }

  isExpired() {
    return new Date() > new Date(this.expiresAt);
  }
}
