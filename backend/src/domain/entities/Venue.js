export class Venue {
  constructor({ id, name, address, city, status = 'active' }) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.city = city;
    this.status = status;
  }
}

export class Room {
  constructor({ id, venueId, name, type, status = 'active', rows = 6, seatsPerRow = 12 }) {
    this.id = id;
    this.venueId = venueId;
    this.name = name;
    this.type = type; // 'standard', 'imax', 'stage'
    this.status = status;
    this.rows = rows;
    this.seatsPerRow = seatsPerRow;
  }
}
