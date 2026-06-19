export class Order {
  constructor({ id, userId, bookingSessionId, totalAmount, status, paymentMethod, createdAt }) {
    this.id = id;
    this.userId = userId;
    this.bookingSessionId = bookingSessionId;
    this.totalAmount = totalAmount;
    this.status = status; // 'pending', 'paid', 'failed', 'cancelled'
    this.paymentMethod = paymentMethod;
    this.createdAt = createdAt || new Date().toISOString();
  }
}
