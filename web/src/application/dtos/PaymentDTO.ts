import type { MockPaymentOutcome, PaymentResult } from '@/domain/entities/Payment';

export interface ProcessPaymentDTO {
  sessionId: string;
  outcome: MockPaymentOutcome;
}

export type PaymentResultDTO = PaymentResult;

