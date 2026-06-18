import React from 'react';
import './Badge.css';

type BadgeTone = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
}

export const Badge: React.FC<BadgeProps> = ({ children, tone = 'neutral' }) => {
  return <span className={`badge badge--${tone}`}>{children}</span>;
};

