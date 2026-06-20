import { Ticket } from '../../../domain/entities/Ticket.js';
import crypto from 'crypto';

const ticketsDB = new Map();
const checkInHistoryDB = [];

export class MockTicketRepository {
  async save(ticket) {
    ticketsDB.set(ticket.id, ticket);
    return ticket;
  }

  async findById(id) {
    const data = ticketsDB.get(id);
    return data ? new Ticket(data) : null;
  }

  async findByUserId(userId) {
    const userTickets = [];
    for (const ticket of ticketsDB.values()) {
      if (ticket.userId === userId) {
        userTickets.push(new Ticket(ticket));
      }
    }
    return userTickets;
  }

  async findByOrderId(orderId) {
    const orderTickets = [];
    for (const ticket of ticketsDB.values()) {
      if (ticket.orderId === orderId) {
        orderTickets.push(new Ticket(ticket));
      }
    }
    return orderTickets;
  }

  async findAll() {
    return Array.from(ticketsDB.values()).map(ticket => new Ticket(ticket));
  }

  async recordCheckInAttempt(attempt) {
    const entry = {
      id: attempt.id || crypto.randomUUID(),
      scannedAt: attempt.scannedAt || new Date().toISOString(),
      status: attempt.status,
      ticketId: attempt.ticketId || 'unknown',
      message: attempt.message,
      staff: attempt.staff || null,
      ticket: attempt.ticket || null
    };

    checkInHistoryDB.unshift(entry);
    return entry;
  }

  async getCheckInHistory({ limit = 50, staffId } = {}) {
    const records = staffId
      ? checkInHistoryDB.filter(entry => entry.staff?.id === staffId)
      : checkInHistoryDB;

    return records.slice(0, limit);
  }
}
