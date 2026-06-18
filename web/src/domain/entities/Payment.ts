export type MockPaymentOutcome = 'success' | 'failed';

export type PaymentFailureReason = 'payment_failed' | 'session_expired' | 'session_not_found';

export interface PaymentResult {
  status: MockPaymentOutcome;
  sessionId: string;
  ticketIds: string[];
  reason?: PaymentFailureReason;
  message: string;
}

