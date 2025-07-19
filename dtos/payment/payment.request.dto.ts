export interface CreatePaymentRequest {
  amount: number;
  description: string;
  userSubscriptionId: number;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface ConfirmWebhookRequest {
  code: string;
  desc: string;
  data: {
    orderCode: number;
    amount: number;
    description: string;
    accountNumber: string;
    reference: string;
    transactionDateTime: string;
    currency: string;
    paymentLinkId: string;
    code: string;
    desc: string;
    counterAccountBankId: string | null;
    counterAccountBankName: string | null;
    counterAccountName: string | null;
    counterAccountNumber: string | null;
    virtualAccountName: string | null;
    virtualAccountNumber: string | null;
  };
  signature: string;
}

export interface CancelPaymentRequest {
  orderCode: number;
  cancellationReason?: string;
}

export interface PaymentHistoryRequest {
  fromDate?: string;
  toDate?: string;
  status?: 'Pending' | 'Success' | 'Failed' | 'Cancelled';
  pageNumber?: number;
  pageSize?: number;
} 