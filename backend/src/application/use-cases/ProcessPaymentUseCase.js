import { AppError } from '../../domain/errors/AppError.js';

export class ProcessPaymentUseCase {
  async execute({ orderId, paymentMethod }) {
    // Trong môi trường thật, sẽ gọi tới API của Stripe / VNPay / MoMo
    // Mock xử lý thanh toán: 80% thành công, 20% thất bại
    const isSuccess = Math.random() > 0.2;

    if (!isSuccess) {
      throw new AppError('Thanh toán thất bại từ cổng thanh toán.', 402);
    }

    return {
      transactionId: `mock-txn-${Date.now()}`,
      status: 'success'
    };
  }
}
