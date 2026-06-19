import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop({ children }: { children: React.ReactNode }) {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname, search]);

  return children;
}
