import { FeatureUsage, SubscriptionPlan, SubscriptionStatus, UsageHistory, UserSubscription } from './subscription.dto';

export interface ApiResponse<T> {
  isSucceeded: boolean;
  data: T;
  message?: string;
  errorType?: string;
}

export interface SubscriptionStatusResponse extends ApiResponse<SubscriptionStatus> {}

export interface UserSubscriptionResponse extends ApiResponse<UserSubscription> {}

export interface SubscriptionPlansResponse extends ApiResponse<SubscriptionPlan[]> {}

export interface SubscriptionPlanResponse extends ApiResponse<SubscriptionPlan> {}

export interface FeatureUsageResponse extends ApiResponse<FeatureUsage> {}

export interface UsageHistoryResponse extends ApiResponse<UsageHistory[]> {}

export interface MessageResponse extends ApiResponse<null> {
  message: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
} 