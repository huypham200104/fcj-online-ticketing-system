import crypto from 'crypto';

const TICKET_QR_SECRET =
  process.env.TICKET_QR_SECRET ??
  process.env.AUTH_TOKEN_SECRET ??
  'dev-only-change-me-cinematic-pulse-ticket-qr-secret-32-bytes-min';

export function createTicketQrPayload(ticketId, userId) {
  return crypto
    .createHmac('sha256', TICKET_QR_SECRET)
    .update(`${ticketId}:${userId}`)
    .digest('base64url');
}
