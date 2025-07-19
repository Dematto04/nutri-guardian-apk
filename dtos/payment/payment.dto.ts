export interface PaymentLink {
  bin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  orderCode: number;
  currency: string;
  paymentLinkId: string;
  status: string;
  checkoutUrl: string;
  paymentUrl: string;
  transactionId: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate: string;
  failureReason?: string;
  userSubscriptionId: number;
  qrCode: string;
}

export interface PaymentData {
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
}

export interface WebhookData {
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
}

export interface PaymentTransaction {
  id: number;
  userId: number;
  userSubscriptionId: number | null;
  planId: number | null;
  amount: number;
  currency: string;
  description: string;
  paymentMethod: string;
  status: 'Pending' | 'Success' | 'Failed' | 'Cancelled';
  payosOrderCode: number;
  payosPaymentLinkId: string;
  payosTransactionId: string | null;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
} 