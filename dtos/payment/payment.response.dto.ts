import { PaymentData, PaymentLink, PaymentTransaction } from './payment.dto';

export interface ApiResponse<T> {
  isSucceeded: boolean;
  data: T;
  message?: string;
  errorType?: string;
}

export interface CreatePaymentResponse extends ApiResponse<PaymentLink> {}

export interface PaymentStatusResponse extends ApiResponse<PaymentData> {}

export interface PaymentTransactionResponse extends ApiResponse<PaymentTransaction> {}

export interface PaymentHistoryResponse extends ApiResponse<PaymentTransaction[]> {}

export interface WebhookResponse {
  success: boolean;
  message: string;
}

export interface CancelPaymentResponse extends ApiResponse<{
  orderCode: number;
  status: string;
  message: string;
}> {}

export interface PaginatedPaymentResponse extends ApiResponse<PaymentTransaction[]> {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
} 