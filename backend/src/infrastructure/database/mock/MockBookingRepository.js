import { BookingSession } from '../../../domain/entities/BookingSession.js';

// In-memory Map as a substitute for Redis
const bookingSessionsDB = new Map();

export class MockBookingRepository {
  async save(bookingSession) {
    bookingSessionsDB.set(bookingSession.id, bookingSession);
    return bookingSession;
  }

  async findById(id) {
    const data = bookingSessionsDB.get(id);
    return data ? new BookingSession(data) : null;
  }

  async cancel(sessionId) {
    const session = bookingSessionsDB.get(sessionId);
    if (!session) return null;

    const cancelledSession = new BookingSession({
      ...session,
      status: 'cancelled'
    });
    bookingSessionsDB.set(sessionId, cancelledSession);
    return cancelledSession;
  }

  async fail(sessionId) {
    const session = bookingSessionsDB.get(sessionId);
    if (!session) return null;

    const failedSession = new BookingSession({
      ...session,
      status: 'failed'
    });
    bookingSessionsDB.set(sessionId, failedSession);
    return failedSession;
  }

  async findActiveSessionsByShowTime(showTimeId) {
    const activeSessions = [];
    const now = new Date();
    
    for (const [id, session] of bookingSessionsDB.entries()) {
      if (session.showTimeId === showTimeId && session.status === 'pending') {
        if (new Date(session.expiresAt) > now) {
          activeSessions.push(new BookingSession(session));
        } else {
          // Auto-expire
          session.status = 'expired';
          bookingSessionsDB.set(id, session);
        }
      }
    }
    return activeSessions;
  }
}
