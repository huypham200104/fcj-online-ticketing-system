export class SearchEventsUseCase {
  constructor(eventRepository) {
    this.eventRepository = eventRepository;
  }

  async execute(location) {
    if (!location) {
      throw new Error('Location query parameter is required'); // Will use ValidationError later
    }
    return await this.eventRepository.findByLocation(location);
  }
}
