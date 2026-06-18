export const MOCK_STORAGE_KEYS = {
  bookingSessions: 'ticketspace.bookingSessions',
  purchasedTickets: 'ticketspace.purchasedTickets',
} as const;

export function readMockStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeMockStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

