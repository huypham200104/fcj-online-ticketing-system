import type { BookingSession } from '@/domain/entities/BookingSession';

const BOOKING_SESSION_CACHE_KEY = 'cinematic-pulse.booking-sessions';

function readSessions(): BookingSession[] {
  const raw = window.sessionStorage.getItem(BOOKING_SESSION_CACHE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as BookingSession[];
  } catch {
    window.sessionStorage.removeItem(BOOKING_SESSION_CACHE_KEY);
    return [];
  }
}

export function saveBookingSession(session: BookingSession): void {
  const sessions = readSessions().filter((item) => item.id !== session.id);
  window.sessionStorage.setItem(BOOKING_SESSION_CACHE_KEY, JSON.stringify([session, ...sessions]));
}

export function getBookingSession(sessionId: string): BookingSession | null {
  return readSessions().find((session) => session.id === sessionId) ?? null;
}

export function removeBookingSession(sessionId: string): void {
  const sessions = readSessions().filter((session) => session.id !== sessionId);
  window.sessionStorage.setItem(BOOKING_SESSION_CACHE_KEY, JSON.stringify(sessions));
}
