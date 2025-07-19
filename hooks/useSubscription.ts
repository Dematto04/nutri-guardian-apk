import { FeatureUsage, SubscriptionStatus } from '@/dtos/subscription/subscription.dto';
import { SubscriptionService } from '@/service/subscription.service';
import { useCallback, useEffect, useState } from 'react';

export function useSubscription() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubscriptionStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SubscriptionService.getSubscriptionStatus();
      
      if (result.isSucceeded) {
        setSubscriptionStatus(result.data);
      } else {
        setError(result.message || 'Failed to load subscription status');
      }
    } catch (err: any) {
      console.error('Error loading subscription status:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscriptionStatus();
  }, [loadSubscriptionStatus]);

  const hasActiveSubscription = subscriptionStatus?.hasActiveSubscription || false;

  const checkFeatureAccess = useCallback(async (featureName: string): Promise<FeatureUsage | null> => {
    try {
      const result = await SubscriptionService.canUseFeature(featureName);
      return result.isSucceeded ? result.data : null;
    } catch (error) {
      console.error(`Error checking feature access for ${featureName}:`, error);
      return null;
    }
  }, []);

  const trackFeatureUsage = useCallback(async (featureName: string, count: number = 1): Promise<boolean> => {
    try {
      const result = await SubscriptionService.trackUsage({ featureName, count });
      return result.isSucceeded;
    } catch (error) {
      console.error(`Error tracking usage for ${featureName}:`, error);
      return false;
    }
  }, []);

  const canUseSmartMealGeneration = useCallback(async (): Promise<{ canUse: boolean; reason?: string }> => {
    if (!hasActiveSubscription) {
      return { canUse: false, reason: 'Cần đăng ký gói Premium để sử dụng tính năng này' };
    }

    const featureAccess = await checkFeatureAccess('smart_meal_generation');
    if (!featureAccess) {
      return { canUse: false, reason: 'Không thể kiểm tra quyền truy cập tính năng' };
    }

    if (!featureAccess.canUse) {
      return { canUse: false, reason: 'Bạn đã sử dụng hết lượt tạo thực đơn thông minh trong ngày' };
    }

    return { canUse: true };
  }, [hasActiveSubscription, checkFeatureAccess]);

  const canUseRecipeGeneration = useCallback(async (): Promise<{ canUse: boolean; reason?: string }> => {
    const featureAccess = await checkFeatureAccess('recipe_generation');
    if (!featureAccess) {
      return { canUse: false, reason: 'Không thể kiểm tra quyền truy cập tính năng' };
    }

    if (!featureAccess.canUse) {
      if (!hasActiveSubscription) {
        return { canUse: false, reason: 'Bạn đã sử dụng hết lượt miễn phí. Nâng cấp để tiếp tục sử dụng' };
      }
      return { canUse: false, reason: 'Bạn đã sử dụng hết lượt tạo công thức trong ngày' };
    }

    return { canUse: true };
  }, [hasActiveSubscription, checkFeatureAccess]);

  const useSmartMealGeneration = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    const accessCheck = await canUseSmartMealGeneration();
    if (!accessCheck.canUse) {
      return { success: false, message: accessCheck.reason };
    }

    const tracked = await trackFeatureUsage('smart_meal_generation');
    if (!tracked) {
      return { success: false, message: 'Không thể ghi nhận việc sử dụng tính năng' };
    }

    // Refresh subscription status after usage
    await loadSubscriptionStatus();
    
    return { success: true };
  }, [canUseSmartMealGeneration, trackFeatureUsage, loadSubscriptionStatus]);

  const useRecipeGeneration = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    const accessCheck = await canUseRecipeGeneration();
    if (!accessCheck.canUse) {
      return { success: false, message: accessCheck.reason };
    }

    const tracked = await trackFeatureUsage('recipe_generation');
    if (!tracked) {
      return { success: false, message: 'Không thể ghi nhận việc sử dụng tính năng' };
    }

    // Refresh subscription status after usage
    await loadSubscriptionStatus();
    
    return { success: true };
  }, [canUseRecipeGeneration, trackFeatureUsage, loadSubscriptionStatus]);

  return {
    subscriptionStatus,
    loading,
    error,
    hasActiveSubscription,
    loadSubscriptionStatus,
    checkFeatureAccess,
    canUseSmartMealGeneration,
    canUseRecipeGeneration,
    useSmartMealGeneration,
    useRecipeGeneration,
  };
} 