import type { AuthResponseDTO } from '@/application/dtos/AuthDTO';

const AUTH_SESSION_KEY = 'cinematic-pulse.auth-session';

export function saveAuthSession(session: AuthResponseDTO): void {
  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function updateAuthSessionUser(user: AuthResponseDTO['user']): AuthResponseDTO | null {
  const current = getAuthSession();
  if (!current) return null;

  const nextSession = {
    ...current,
    user: {
      ...current.user,
      ...user,
    },
  };
  saveAuthSession(nextSession);
  return nextSession;
}

export function getAuthSession(): AuthResponseDTO | null {
  const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthResponseDTO;
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function getAuthToken(): string | null {
  return getAuthSession()?.accessToken ?? null;
}

export function clearAuthSession(): void {
  window.localStorage.removeItem(AUTH_SESSION_KEY);
}
