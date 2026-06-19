import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckoutPage } from './CheckoutPage';

const event = {
  id: 2,
  name: 'Phim CGV Premiere',
  description: 'Suất chiếu phim lớn mở bán hôm nay',
  location: 'CGV Vincom Bà Triệu, Hà Nội',
  date: '2026-12-20',
  time: '20:00',
  image: 'https://via.placeholder.com/400x250?text=CGV+Movie',
  ticketTypes: [
    { id: 4, name: 'Ghế thường', price: 120000, quantity: 200, available: 120 },
    { id: 5, name: 'Ghế Recliner', price: 200000, quantity: 50, available: 25 },
  ],
};

const showtimes = [
  {
    id: 'st2',
    eventId: 2,
    roomId: 'r1',
    date: '2026-12-20',
    time: '20:00',
    roomName: 'Cinema 1',
    roomType: 'standard',
    venueName: 'CGV Landmark 81',
    venueAddress: 'B1, Landmark 81',
  },
];

const seats = [
  { id: 'seat-r1-A1', roomId: 'r1', row: 'A', number: 1, type: 'standard', status: 'available', price: 100000 },
  { id: 'seat-r1-A2', roomId: 'r1', row: 'A', number: 2, type: 'standard', status: 'available', price: 100000 },
  { id: 'seat-r1-A3', roomId: 'r1', row: 'A', number: 3, type: 'standard', status: 'sold', price: 100000 },
];

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith('/api/events/2')) return jsonResponse(event);
        if (url.endsWith('/api/events/2/showtimes')) return jsonResponse(showtimes);
        if (url.endsWith('/api/showtimes/st2/seats')) return jsonResponse(seats);
        if (url.endsWith('/api/bookings/lock-seats')) {
          return jsonResponse({
            id: 'session-expired',
            userId: 'customer-1',
            showTimeId: 'st2',
            seatIds: ['seat-r1-A1', 'seat-r1-A2'],
            status: 'pending',
            expiresAt: new Date(Date.now() - 1000).toISOString(),
          });
        }
        return jsonResponse([]);
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders ticket selection from backend event data', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/checkout?eventId=2&ticketTypeId=4&cinemaId=cgv-landmark-81-b1-landmark-81&showtimeId=st2',
        ]}
      >
        <CheckoutPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /Phim CGV Premiere/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CGV Landmark 81/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /20:00/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ghế A1' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Ghế A3' })).toBeDisabled();
  });

  it('waits for cinema selection before showing available seat counts', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/checkout?eventId=2&ticketTypeId=4']}>
        <CheckoutPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Chọn rạp để xem suất chiếu')).toBeInTheDocument();
    expect(screen.queryByText('2 ghế trống')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /CGV Landmark 81/i }));

    expect(await screen.findByText('2 ghế trống')).toBeInTheDocument();
  });

  it('allows selecting multiple seats before holding them', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter
        initialEntries={[
          '/checkout?eventId=2&ticketTypeId=4&cinemaId=cgv-landmark-81-b1-landmark-81&showtimeId=st2',
        ]}
      >
        <CheckoutPage />
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole('button', { name: 'Ghế A1' }));
    await user.click(screen.getByRole('button', { name: 'Ghế A2' }));

    expect(screen.getByRole('button', { name: 'Ghế A1' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Ghế A2' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Giữ ghế tạm thời' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Đã hết 15 phút giữ ghế, vui lòng đặt lại.');
    expect(screen.getByRole('button', { name: 'Thanh toán' })).toBeDisabled();
  });
});
