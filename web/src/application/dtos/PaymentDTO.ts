import type { PaymentResult } from '@/domain/entities/Payment';

export interface ProcessPaymentDTO {
  sessionId: string;
  totalAmount: number;
  paymentMethod?: string;
}

export type PaymentResultDTO = PaymentResult;
