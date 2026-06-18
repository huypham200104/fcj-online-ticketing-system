import { useEffect, useMemo, useState } from 'react';

function getRemainingMs(expiresAt?: string): number {
  if (!expiresAt) return 0;
  return Math.max(0, new Date(expiresAt).getTime() - Date.now());
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function useCountdown(expiresAt?: string) {
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(expiresAt));

  useEffect(() => {
    if (!expiresAt) return undefined;

    const tick = () => {
      setRemainingMs(getRemainingMs(expiresAt));
    };

    const starter = window.setTimeout(tick, 0);
    const timer = window.setInterval(() => {
      tick();
    }, 1000);

    return () => {
      window.clearTimeout(starter);
      window.clearInterval(timer);
    };
  }, [expiresAt]);

  return useMemo(
    () => ({
      remainingMs,
      formatted: formatRemaining(remainingMs),
      isExpired: Boolean(expiresAt) && remainingMs <= 0,
    }),
    [expiresAt, remainingMs],
  );
}
