import api from "@/config/api";
import { UsageHistory } from "@/dtos/subscription/subscription.dto";
import {
  CancelSubscriptionRequest,
  CreateSubscriptionRequest,
  HistoryFilterRequest,
  TrackUsageRequest,
  UpgradeSubscriptionRequest
} from "@/dtos/subscription/subscription.request.dto";
import {
  FeatureUsageResponse,
  MessageResponse,
  PaginatedResponse,
  SubscriptionPlansResponse,
  SubscriptionStatusResponse,
  UsageHistoryResponse,
  UserSubscriptionResponse
} from "@/dtos/subscription/subscription.response.dto";

export class SubscriptionService {
  // User Subscription Management
  // 📍 API endpoint patterns (matching auth service pattern - no /api/ prefix):
  // - '/usersubscription/status' - Get current user subscription status
  // - '/subscription/plans' - Get available subscription plans
  
  /**
   * Get current user's subscription status and limits
   */
  static async getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
    console.log('🔍 API Base URL:', process.env.EXPO_PUBLIC_API_URL);
    console.log('🔍 Calling:', '/usersubscription/status');
    
    const response = await api.get('/usersubscription/status');
    console.log('✅ Response status:', response.status);
    console.log('Response:', response.data);
    return response.data;
  }

  /**
   * Create a new subscription for current user
   */
  static async createSubscription(request: CreateSubscriptionRequest): Promise<UserSubscriptionResponse> {
    const response = await api.post('/usersubscription', request);
    return response.data;
  }

  /**
   * Cancel current subscription
   */
  static async cancelSubscription(request?: CancelSubscriptionRequest): Promise<MessageResponse> {
    const response = await api.post('/usersubscription/cancel', request);
    return response.data;
  }

  /**
   * Renew expired subscription
   */
  static async renewSubscription(): Promise<UserSubscriptionResponse> {
    const response = await api.post('/usersubscription/renew');
    return response.data;
  }

  /**
   * Upgrade to a higher-tier plan
   */
  static async upgradeSubscription(request: UpgradeSubscriptionRequest): Promise<UserSubscriptionResponse> {
    const response = await api.post('/usersubscription/upgrade', request);
    return response.data;
  }

  /**
   * Check if user can use a specific feature
   */
  static async canUseFeature(featureName: string, limitType: 'daily' | 'monthly' = 'daily'): Promise<FeatureUsageResponse> {
    const response = await api.get(`/usersubscription/can-use/${featureName}?limitType=${limitType}`);
    return response.data;
  }

  /**
   * Track feature usage
   */
  static async trackUsage(request: TrackUsageRequest): Promise<MessageResponse> {
    const response = await api.post('/usersubscription/track-usage', request);
    return response.data;
  }

  /**
   * Get subscription history
   */
  static async getSubscriptionHistory(filter?: HistoryFilterRequest): Promise<PaginatedResponse<UsageHistory>> {
    const response = await api.get('/usersubscription/history/subscriptions', { params: filter });
    return response.data;
  }

  /**
   * Get usage history
   */
  static async getUsageHistory(filter?: HistoryFilterRequest): Promise<UsageHistoryResponse> {
    const response = await api.get('/usersubscription/history/usage', { params: filter });
    return response.data;
  }

  // Public Subscription Plans

  /**
   * Get all active subscription plans (public)
   */
  static async getAvailablePlans(): Promise<SubscriptionPlansResponse> {
    console.log('🔍 API Base URL:', process.env.EXPO_PUBLIC_API_URL);
    console.log('🔍 Calling:', '/subscription/plans');
    
    const response = await api.get('/subscription/plans');
    console.log('✅ Response status:', response.status);
    return response.data;
  }

  /**
   * Get specific plan details (public)
   */
  static async getPlanById(planId: number): Promise<SubscriptionPlansResponse> {
    const response = await api.get(`/subscription/plans/${planId}`);
    return response.data;
  }

  // Helper methods for common use cases

  /**
   * Check if user has active subscription
   */
  static async hasActiveSubscription(): Promise<boolean> {
    try {
      const status = await this.getSubscriptionStatus();
      return status.isSucceeded && status.data.hasActiveSubscription;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  /**
   * Check if user can use smart meal generation
   */
  static async canUseSmartMealGeneration(): Promise<boolean> {
    try {
      const result = await this.canUseFeature('smart_meal_generation', 'daily');
      return result.isSucceeded && result.data.canUse;
    } catch (error) {
      console.error('Error checking smart meal generation access:', error);
      return false;
    }
  }

  /**
   * Check if user can use recipe generation
   */
  static async canUseRecipeGeneration(): Promise<boolean> {
    try {
      const result = await this.canUseFeature('recipe_generation', 'daily');
      return result.isSucceeded && result.data.canUse;
    } catch (error) {
      console.error('Error checking recipe generation access:', error);
      return false;
    }
  }

  /**
   * Track smart meal generation usage
   */
  static async trackSmartMealGeneration(count: number = 1): Promise<void> {
    try {
      await this.trackUsage({
        featureName: 'smart_meal_generation',
        count
      });
    } catch (error) {
      console.error('Error tracking smart meal generation usage:', error);
    }
  }

  /**
   * Track recipe generation usage
   */
  static async trackRecipeGeneration(count: number = 1): Promise<void> {
    try {
      await this.trackUsage({
        featureName: 'recipe_generation',
        count
      });
    } catch (error) {
      console.error('Error tracking recipe generation usage:', error);
    }
  }
} 