import type { ProcessPaymentDTO, PaymentResultDTO } from '@/application/dtos/PaymentDTO';

export interface IPaymentService {
  processPayment(dto: ProcessPaymentDTO): Promise<PaymentResultDTO>;
}

