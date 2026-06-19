export class GetMyTicketsUseCase {
  constructor(ticketRepository) {
    this.ticketRepository = ticketRepository;
  }

  async execute(userId) {
    const tickets = await this.ticketRepository.findByUserId(userId);
    return tickets;
  }
}
