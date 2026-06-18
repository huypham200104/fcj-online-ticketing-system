import type { ProcessPaymentDTO, PaymentResultDTO } from '@/application/dtos/PaymentDTO';
import type { IPaymentService } from '@/application/ports/IPaymentService';

export class ProcessMockPaymentUseCase {
  private readonly paymentService: IPaymentService;

  constructor(paymentService: IPaymentService) {
    this.paymentService = paymentService;
  }

  execute(dto: ProcessPaymentDTO): Promise<PaymentResultDTO> {
    if (!dto.sessionId) {
      throw new Error('Missing booking session');
    }
    return this.paymentService.processPayment(dto);
  }
}

