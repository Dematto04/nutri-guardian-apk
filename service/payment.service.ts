import api from "@/config/api";
import {
  CreatePaymentRequest,
  PaymentHistoryRequest
} from "@/dtos/payment/payment.request.dto";
import {
  CancelPaymentResponse,
  CreatePaymentResponse,
  PaginatedPaymentResponse,
  PaymentStatusResponse,
  PaymentTransactionResponse
} from "@/dtos/payment/payment.response.dto";

export class PaymentService {
  
  /**
   * Create a new payment with PayOS
   */
  static async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    // Set backend API URLs for payment callbacks (not frontend URLs)
    const paymentRequest = {
      amount: request.amount,
      description: request.description,
      userSubscriptionId: request.userSubscriptionId,
      ReturnUrl: `${process.env.EXPO_PUBLIC_API_URL}/payment/return`,
      CancelUrl: `${process.env.EXPO_PUBLIC_API_URL}/payment/cancel`
    };
    
    const response = await api.post('/payment/create', paymentRequest);
    return response.data;
  }

  /**
   * Create a new payment with PayOS for embedded flow
   */
  static async createEmbeddedPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    // For embedded payments, also use backend API endpoints for callbacks
    const paymentRequest = {
      amount: request.amount,
      description: request.description,
      userSubscriptionId: request.userSubscriptionId,
      ReturnUrl: `${process.env.EXPO_PUBLIC_API_URL}/payment/return`,
      CancelUrl: `${process.env.EXPO_PUBLIC_API_URL}/payment/cancel`
    };
    
    const response = await api.post('/payment/create', paymentRequest);
    return response.data;
  }

  /**
   * Get payment status by transaction ID
   */
  static async getPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
    const response = await api.get(`/payment/status/${transactionId}`);
    return response.data;
  }

  /**
   * Get payment transaction details
   */
  static async getPaymentTransaction(transactionId: number): Promise<PaymentTransactionResponse> {
    const response = await api.get(`/payment/transaction/${transactionId}`);
    return response.data;
  }

  /**
   * Cancel a pending payment
   */
  static async cancelPayment(orderCode: number): Promise<CancelPaymentResponse> {
    const response = await api.post(`/payment/cancel/${orderCode}`);
    return response.data;
  }

  /**
   * Get payment history for current user
   */
  static async getPaymentHistory(filter?: PaymentHistoryRequest): Promise<PaginatedPaymentResponse> {
    const response = await api.get('/payment/history', { params: filter });
    return response.data;
  }

  /**
   * Poll payment status until completion (for frontend to check payment result)
   */
  static async pollPaymentStatus(
    transactionId: string,
    maxAttempts: number = 30,
    intervalMs: number = 2000
  ): Promise<{
    success: boolean;
    status: string;
    message: string;
    data?: any;
  }> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.getPaymentStatus(transactionId);
        
        if (response.isSucceeded) {
          const paymentData = response.data;
          
          // Check PayOS status codes per API guide
          if (paymentData.code === '00') {
            return {
              success: true,
              status: 'success',
              message: 'Payment completed successfully',
              data: paymentData
            };
          } else if (paymentData.code === '01') {
            return {
              success: false,
              status: 'failed',
              message: 'Payment failed'
            };
          } else if (paymentData.code === '02') {
            return {
              success: false,
              status: 'cancelled',
              message: 'Payment was cancelled'
            };
          }
          // If code is not final status, continue polling
        }
        
        // Wait before next attempt
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
      } catch (error) {
        console.error(`Polling attempt ${attempt + 1} failed:`, error);
        
        // If this is the last attempt, return error
        if (attempt === maxAttempts - 1) {
          return {
            success: false,
            status: 'error',
            message: 'Failed to check payment status'
          };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    
    return {
      success: false,
      status: 'timeout',
      message: 'Payment status check timed out'
    };
  }

  /**
   * Create payment for subscription
   */
  static async createSubscriptionPayment(
    userSubscriptionId: number,
    amount: number,
    planName: string
  ): Promise<CreatePaymentResponse> {
    const requestBody = {
      amount: amount,
      description: `${planName} - Monthly Subscription`,
      userSubscriptionId: userSubscriptionId
    };

    return this.createPayment(requestBody);
  }

  /**
   * Create payment for subscription (embedded version)
   */
  static async createEmbeddedSubscriptionPayment(
    userSubscriptionId: number,
    amount: number,
    planName: string
  ): Promise<CreatePaymentResponse> {
    const requestBody = {
      amount: amount,
      description: `${planName} - Monthly Subscription`,
      userSubscriptionId: userSubscriptionId
    };

    console.log('🔧 Creating payment with backend API:', requestBody);
    
    const response = await this.createEmbeddedPayment(requestBody);
    console.log('✅ Payment API response:', response);
    
    return response;
  }
} 