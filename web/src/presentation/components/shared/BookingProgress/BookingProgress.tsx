import React from 'react';
import { Link } from 'react-router-dom';
import './BookingProgress.css';

export interface BookingProgressStep {
  id: string;
  label: string;
  to?: string;
  disabled?: boolean;
}

interface BookingProgressProps {
  steps: BookingProgressStep[];
  activeStepId: string;
  className?: string;
}

function getStepState(index: number, activeIndex: number, disabled?: boolean): string {
  if (disabled) return 'disabled';
  if (index < activeIndex) return 'complete';
  if (index === activeIndex) return 'active';
  return 'upcoming';
}

export const BookingProgress: React.FC<BookingProgressProps> = ({
  steps,
  activeStepId,
  className = '',
}) => {
  const activeIndex = Math.max(0, steps.findIndex((step) => step.id === activeStepId));

  return (
    <nav className={`booking-progress ${className}`} aria-label="Tiến trình đặt vé">
      <ol className="booking-progress__list">
        {steps.map((step, index) => {
          const state = getStepState(index, activeIndex, step.disabled);
          const content = (
            <>
              <span className="booking-progress__number">{index + 1}</span>
              <span className="booking-progress__label">{step.label}</span>
            </>
          );

          return (
            <li className={`booking-progress__item booking-progress__item--${state}`} key={step.id}>
              {step.to && !step.disabled ? (
                <Link to={step.to} aria-current={state === 'active' ? 'step' : undefined}>
                  {content}
                </Link>
              ) : (
                <span aria-current={state === 'active' ? 'step' : undefined}>{content}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
