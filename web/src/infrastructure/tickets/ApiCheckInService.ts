import { apiRequest } from '@/infrastructure/api/httpClient';
import type { BackendCheckInRecord, BackendEvent, BackendShowTime } from '@/infrastructure/api/backendTypes';

export type CheckInTicketResult = BackendCheckInRecord;

export interface CheckInShowTimeOption {
  id: string;
  eventTitle: string;
  venueName: string;
  roomName: string;
  date: string;
  time: string;
}

interface QrPayload {
  ticketId?: string;
  qrPayload: string;
}

function parseQrValue(value: string): QrPayload {
  const trimmed = value.trim();

  try {
    const parsed = JSON.parse(trimmed) as Partial<QrPayload>;
    if (typeof parsed.ticketId === 'string' && typeof parsed.qrPayload === 'string') {
      return { ticketId: parsed.ticketId.trim(), qrPayload: parsed.qrPayload.trim() };
    }
  } catch {
    // Try URL/query formats below.
  }

  try {
    const url = trimmed.startsWith('http')
      ? new URL(trimmed)
      : new URL(`https://cinematicpulse.local/check-in?${trimmed.replace(/^\?/, '')}`);
    const ticketId = url.searchParams.get('ticketId');
    const qrPayload = url.searchParams.get('qrPayload');

    if (qrPayload) {
      return {
        ticketId: ticketId?.trim() || undefined,
        qrPayload: qrPayload.trim(),
      };
    }
  } catch {
    // Fall through to the friendly validation error below.
  }

  if (/^[a-f0-9]{64}$/i.test(trimmed)) {
    return { qrPayload: trimmed };
  }

  throw new Error('Mã QR không đúng định dạng từ hệ thống.');
}

export class ApiCheckInService {
  async checkIn(qrValue: string, showTimeId?: string): Promise<CheckInTicketResult> {
    const payload = parseQrValue(qrValue);
    return apiRequest<BackendCheckInRecord>('/tickets/checkin', {
      method: 'POST',
      body: { ...payload, showTimeId: showTimeId || undefined },
    });
  }

  async checkInImage(file: File, showTimeId?: string): Promise<CheckInTicketResult> {
    const formData = new FormData();
    formData.append('qrImage', file);
    if (showTimeId) formData.append('showTimeId', showTimeId);

    return apiRequest<BackendCheckInRecord>('/tickets/checkin/image', {
      method: 'POST',
      body: formData,
    });
  }

  async listHistory(limit = 50): Promise<CheckInTicketResult[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    return apiRequest<BackendCheckInRecord[]>(`/tickets/checkin/history?${params.toString()}`);
  }

  async listCheckInShowTimes(): Promise<CheckInShowTimeOption[]> {
    const events = await apiRequest<BackendEvent[]>('/events', { auth: false });
    const entries = await Promise.all(
      events.map(async (event) => {
        const showtimes = await apiRequest<BackendShowTime[]>(`/events/${event.id}/showtimes`, { auth: false });
        return showtimes.map((showtime): CheckInShowTimeOption => ({
          id: showtime.id,
          eventTitle: event.name,
          venueName: showtime.venueName ?? event.location,
          roomName: showtime.roomName ?? showtime.roomId,
          date: showtime.date,
          time: showtime.time,
        }));
      }),
    );

    return entries.flat().sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  }
}
