import { useState } from 'react';
import type { MockPaymentOutcome, PaymentResult } from '@/domain/entities/Payment';
import { ProcessMockPaymentUseCase } from '@/application/use-cases/payment/ProcessMockPaymentUseCase';
import { MockPaymentService } from '@/infrastructure/payment/MockPaymentService';

const processMockPaymentUseCase = new ProcessMockPaymentUseCase(new MockPaymentService());

export function usePayment() {
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = async (sessionId: string, outcome: MockPaymentOutcome) => {
    setLoading(true);
    setError(null);

    try {
      const paymentResult = await processMockPaymentUseCase.execute({ sessionId, outcome });
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

