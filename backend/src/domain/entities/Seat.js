export class Seat {
  constructor({ id, roomId, row, number, type, status, price }) {
    this.id = id;
    this.roomId = roomId;
    this.row = row;       // e.g. 'A', 'B' (or 'GA' for general admission)
    this.number = number; // e.g. 1, 2, 3
    this.type = type;     // 'standard', 'vip', 'sweetbox', 'standing'
    this.status = status; // 'available', 'locked', 'sold'
    this.price = price;
  }

  get isAvailable() {
    return this.status === 'available';
  }
}
