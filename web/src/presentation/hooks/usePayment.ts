import { useState } from 'react';
import type { PaymentResult } from '@/domain/entities/Payment';
import type { BookingSession } from '@/domain/entities/BookingSession';
import { ProcessPaymentUseCase } from '@/application/use-cases/payment/ProcessPaymentUseCase';
import { ApiPaymentService } from '@/infrastructure/payment/ApiPaymentService';

const processPaymentUseCase = new ProcessPaymentUseCase(new ApiPaymentService());

export function usePayment() {
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = async (session: BookingSession) => {
    setLoading(true);
    setError(null);

    try {
      const paymentResult = await processPaymentUseCase.execute({
        sessionId: session.id,
        totalAmount: session.totalPrice,
      });
      setResult(paymentResult);
      return paymentResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xử lý thanh toán');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, processPayment };
}
