export class Event {
  constructor({
    id,
    name,
    type,
    description,
    location,
    date,
    time,
    duration,
    image,
    ticketTypes = [],
    status,
    hidden,
    trailerUrl,
    director,
    cast = []
  }) {
    this.id = id;
    this.name = name;
    this.type = type; // 'movie' | 'concert'
    this.description = description;
    this.location = location; // General location
    this.date = date;
    this.time = time;
    this.duration = duration; // in minutes
    this.image = image;
    this.ticketTypes = ticketTypes;
    this.status = status || (this.isUpcoming() ? 'upcoming' : 'now-showing');
    this.hidden = Boolean(hidden);
    this.trailerUrl = trailerUrl || '';
    this.director = director || '';
    this.cast = cast;
  }

  isUpcoming() {
    const eventDate = new Date(`${this.date}T${this.time}`);
    return eventDate > new Date();
  }

  getTicketType(ticketTypeId) {
    return this.ticketTypes.find(t => t.id === ticketTypeId);
  }
}
