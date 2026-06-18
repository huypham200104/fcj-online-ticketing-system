import React from 'react';
import './PageState.css';

type PageStateVariant = 'loading' | 'error' | 'empty';

interface PageStateProps {
  variant: PageStateVariant;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageState: React.FC<PageStateProps> = ({
  variant,
  title,
  description,
  action,
}) => {
  return (
    <section className={`page-state page-state--${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      {variant === 'loading' ? <span className="page-state__spinner" aria-hidden="true" /> : null}
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      {action ? <div className="page-state__action">{action}</div> : null}
    </section>
  );
};

