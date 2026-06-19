export type PaymentStatus = 'success' | 'failed';

export type PaymentFailureReason = 'payment_failed' | 'session_expired' | 'session_not_found';

export interface PaymentResult {
  status: PaymentStatus;
  sessionId: string;
  ticketIds: string[];
  reason?: PaymentFailureReason;
  message: string;
}
