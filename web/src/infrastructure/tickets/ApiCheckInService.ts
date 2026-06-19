import { apiRequest } from '@/infrastructure/api/httpClient';
import type { BackendCheckInRecord } from '@/infrastructure/api/backendTypes';

export type CheckInTicketResult = BackendCheckInRecord;

interface QrPayload {
  ticketId: string;
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

    if (ticketId && qrPayload) {
      return { ticketId: ticketId.trim(), qrPayload: qrPayload.trim() };
    }
  } catch {
    // Fall through to the friendly validation error below.
  }

  throw new Error('Mã QR không đúng định dạng từ hệ thống.');
}

export class ApiCheckInService {
  async checkIn(qrValue: string): Promise<CheckInTicketResult> {
    const payload = parseQrValue(qrValue);
    return apiRequest<BackendCheckInRecord>('/tickets/checkin', {
      method: 'POST',
      body: payload,
    });
  }

  async listHistory(limit = 50): Promise<CheckInTicketResult[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    return apiRequest<BackendCheckInRecord[]>(`/tickets/checkin/history?${params.toString()}`);
  }
}
