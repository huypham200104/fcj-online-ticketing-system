export class ShowTime {
  constructor({ id, eventId, roomId, date, time, format = '2D', basePrice = 0, status = 'scheduled' }) {
    this.id = id;
    this.eventId = eventId;
    this.roomId = roomId; // Room / Stage where it happens
    this.date = date;     // YYYY-MM-DD
    this.time = time;     // HH:mm
    this.format = format;
    this.basePrice = basePrice;
    this.status = status;
  }

  isPast() {
    const showDateTime = new Date(`${this.date}T${this.time}`);
    return showDateTime < new Date();
  }
}
