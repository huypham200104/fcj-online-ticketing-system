export class Order {
  constructor({ id, userId, bookingSessionId, totalAmount, status, paymentMethod, idempotencyKey, createdAt }) {
    this.id = id;
    this.userId = userId;
    this.bookingSessionId = bookingSessionId;
    this.totalAmount = totalAmount;
    this.status = status; // 'pending', 'paid', 'failed', 'cancelled'
    this.paymentMethod = paymentMethod;
    this.idempotencyKey = idempotencyKey || null;
    this.createdAt = createdAt || new Date().toISOString();
  }
}
