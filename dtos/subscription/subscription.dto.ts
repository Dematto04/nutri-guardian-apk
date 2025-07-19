export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: string;
  usageQuota: number;
  isActive: boolean;
  createdAt: string;
  features: SubscriptionFeature[];
}

export interface SubscriptionFeature {
  id: number;
  planId: number;
  featureName: string;
  description: string;
  isEnabled: boolean;
  createdAt: string;
}

export interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  planName: string;
  planPrice: number;
  currency: string;
  billingCycle: string;
  startDate: string;
  endDate: string | null;
  status: 'Pending' | 'Active' | 'Expired' | 'Cancelled';
  createdAt: string;
  isActive: boolean;
  daysRemaining: number | null;
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  currentSubscription: UserSubscription | null;
  planLimits: Record<string, number>;
  currentUsage: Record<string, number>;
}

export interface FeatureUsage {
  canUse: boolean;
  remaining: number | null;
  total: number | null;
  resetDate: string | null;
}

export interface UsageHistory {
  id: number;
  userId: number;
  featureName: string;
  usageCount: number;
  date: string;
  historyType: string;
} 