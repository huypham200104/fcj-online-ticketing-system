export class GetCheckInHistoryUseCase {
  constructor(ticketRepository) {
    this.ticketRepository = ticketRepository;
  }

  async execute({ limit = 50, staffId } = {}) {
    return this.ticketRepository.getCheckInHistory({ limit, staffId });
  }
}
