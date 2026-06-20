import { apiRequest } from '@/infrastructure/api/httpClient';
import type { BackendCustomerOrderDetail } from '@/infrastructure/api/backendTypes';

export type CustomerOrderDetail = BackendCustomerOrderDetail;

export class ApiOrderService {
  listMyOrders(): Promise<CustomerOrderDetail[]> {
    return apiRequest<CustomerOrderDetail[]>('/orders/my-orders');
  }

  getOrder(orderId: string): Promise<CustomerOrderDetail> {
    return apiRequest<CustomerOrderDetail>(`/orders/${orderId}`);
  }
}
