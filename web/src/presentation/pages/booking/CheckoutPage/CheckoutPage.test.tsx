import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CheckoutPage } from './CheckoutPage';

describe('CheckoutPage', () => {
  it('renders ticket selection from mock event data', async () => {
    render(
      <MemoryRouter initialEntries={['/checkout?eventId=evt-summer-vibes-2026&ticketTypeId=summer-standard']}>
        <CheckoutPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /Đặt vé Summer Vibes 2026/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Standard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /VIP/i })).toBeInTheDocument();
  });
});
