export class TicketController {
  constructor(getMyTicketsUseCase, generateTicketQRUseCase, checkInTicketUseCase, getCheckInHistoryUseCase) {
    this.getMyTicketsUseCase = getMyTicketsUseCase;
    this.generateTicketQRUseCase = generateTicketQRUseCase;
    this.checkInTicketUseCase = checkInTicketUseCase;
    this.getCheckInHistoryUseCase = getCheckInHistoryUseCase;

    this.getMyTickets = this.getMyTickets.bind(this);
    this.getTicketQR = this.getTicketQR.bind(this);
    this.checkIn = this.checkIn.bind(this);
    this.getCheckInHistory = this.getCheckInHistory.bind(this);
  }

  async getMyTickets(req, res, next) {
    try {
      const userId = req.user.id;
      const tickets = await this.getMyTicketsUseCase.execute(userId);
      res.json({ success: true, data: tickets, total: tickets.length });
    } catch (error) {
      next(error);
    }
  }

  async getTicketQR(req, res, next) {
    try {
      const userId = req.user.id;
      const ticketId = req.params.id;
      
      const qrCode = await this.generateTicketQRUseCase.execute(ticketId, userId);
      res.json({ success: true, data: { qrCode } });
    } catch (error) {
      next(error);
    }
  }

  async checkIn(req, res, next) {
    try {
      const { ticketId, qrPayload } = req.body;
      const record = await this.checkInTicketUseCase.execute({ ticketId, qrPayload, staffUser: req.user });
      
      res.json({ success: true, data: record, message: 'Check-in thành công' });
    } catch (error) {
      next(error);
    }
  }

  async getCheckInHistory(req, res, next) {
    try {
      const requestedLimit = Number(req.query.limit ?? 50);
      const limit = Number.isFinite(requestedLimit)
        ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 100)
        : 50;
      const staffId = req.user.role === 'admin' && req.query.scope === 'all' ? undefined : req.user.id;
      const records = await this.getCheckInHistoryUseCase.execute({ limit, staffId });

      res.json({ success: true, data: records, total: records.length });
    } catch (error) {
      next(error);
    }
  }
}
