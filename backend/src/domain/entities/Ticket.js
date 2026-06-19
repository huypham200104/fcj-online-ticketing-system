export class Ticket {
  constructor({ id, orderId, userId, showTimeId, seatId, status, qrCode, checkedInAt, checkedInBy }) {
    this.id = id;
    this.orderId = orderId;
    this.userId = userId;
    this.showTimeId = showTimeId;
    this.seatId = seatId;
    this.status = status; // 'valid', 'checked-in', 'expired', 'cancelled'
    this.qrCode = qrCode || null; // Will be populated with a QR string/payload
    this.checkedInAt = checkedInAt || null;
    this.checkedInBy = checkedInBy || null;
  }
}
