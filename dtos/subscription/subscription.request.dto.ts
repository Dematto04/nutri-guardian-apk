export interface CreateSubscriptionRequest {
  planId: number;
}

export interface CancelSubscriptionRequest {
  cancellationReason?: string;
}

export interface UpgradeSubscriptionRequest {
  newPlanId: number;
}

export interface TrackUsageRequest {
  featureName: string;
  count: number;
}

export interface CreatePlanRequest {
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: string;
  usageQuota: number;
  isActive: boolean;
  features: CreateFeatureRequest[];
}

export interface CreateFeatureRequest {
  featureName: string;
  description: string;
  isEnabled: boolean;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  billingCycle?: string;
  usageQuota?: number;
  isActive?: boolean;
}

export interface HistoryFilterRequest {
  fromDate?: string;
  toDate?: string;
  historyType?: string;
  pageNumber?: number;
  pageSize?: number;
} 