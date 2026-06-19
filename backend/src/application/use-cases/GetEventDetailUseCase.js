import { NotFoundError } from '../../domain/errors/AppError.js';

export class GetEventDetailUseCase {
  constructor(eventRepository) {
    this.eventRepository = eventRepository;
  }

  async execute(eventId) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }
    return event;
  }
}
