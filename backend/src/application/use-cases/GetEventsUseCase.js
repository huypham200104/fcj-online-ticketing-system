export class GetEventsUseCase {
  constructor(eventRepository) {
    this.eventRepository = eventRepository;
  }

  async execute() {
    return await this.eventRepository.findAll();
  }
}
