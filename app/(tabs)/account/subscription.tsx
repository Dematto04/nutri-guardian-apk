import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SubscriptionPlan, SubscriptionStatus } from "@/dtos/subscription/subscription.dto";
import { PaymentService } from "@/service/payment.service";
import { SubscriptionService } from "@/service/subscription.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

export default function SubscriptionScreen() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);

  // Load data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadSubscriptionData();
    }, [])
  );

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [statusResult, plansResult] = await Promise.all([
        SubscriptionService.getSubscriptionStatus(),
        SubscriptionService.getAvailablePlans()
      ]);

      if (statusResult.isSucceeded) {
        console.log({statusResult});
        
        console.log('📊 Status data:', JSON.stringify(statusResult.data, null, 2));
        setSubscriptionStatus(statusResult.data);
      }

      if (plansResult.isSucceeded) {
        console.log('📋 Plans data:', JSON.stringify(plansResult.data, null, 2));
        setAvailablePlans(plansResult.data);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      Toast.show({
        type: "error",
        text1: "Lỗi tải dữ liệu",
        text2: "Không thể tải thông tin đăng ký",
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubscriptionData();
    setRefreshing(false);
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
      // Create subscription
      const subscriptionResult = await SubscriptionService.createSubscription({
        planId: plan.id
      });

      if (!subscriptionResult.isSucceeded) {
        throw new Error(subscriptionResult.message || 'Failed to create subscription');
      }

      const subscription = subscriptionResult.data;

      // Create payment for embedded flow
      const paymentResult = await PaymentService.createEmbeddedSubscriptionPayment(
        subscription.id,
        plan.price,
        plan.name
      );

      if (!paymentResult.isSucceeded) {
        throw new Error(paymentResult.message || 'Failed to create payment');
      }

      const paymentUrl = paymentResult.data?.paymentUrl || paymentResult.data?.checkoutUrl;
      const transactionId = paymentResult.data?.transactionId || paymentResult.data?.orderCode?.toString();
      
      if (!paymentUrl) {
        throw new Error('Không nhận được link thanh toán từ server');
      }
      
      console.log('✅ Subscribe payment created:', { paymentUrl, transactionId });

      // Navigate to embedded payment screen with paymentUrl
      const encodedPaymentUrl = encodeURIComponent(paymentUrl);
      router.push(`/payment/embedded?checkoutUrl=${encodedPaymentUrl}&orderCode=${paymentResult.data?.orderCode}&transactionId=${transactionId || 'subscribe'}` as any);

    } catch (error: any) {
      console.error('Error creating subscription:', error);
      Toast.show({
        type: "error",
        text1: "Lỗi đăng ký",
        text2: error.message || "Không thể tạo đăng ký",
      });
    }
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    try {
      if (!subscriptionStatus?.currentSubscription) {
        throw new Error('Không tìm thấy thông tin đăng ký hiện tại');
      }

      // Use the same payment flow as subscribe for upgrades
      const paymentResult = await PaymentService.createEmbeddedSubscriptionPayment(
        subscriptionStatus.currentSubscription.id,
        plan.price,
        plan.name
      );

      if (paymentResult.isSucceeded) {
        const paymentUrl = paymentResult.data?.paymentUrl || paymentResult.data?.checkoutUrl;
        const transactionId = paymentResult.data?.transactionId || paymentResult.data?.orderCode?.toString();
        
        if (!paymentUrl) {
          throw new Error('Không nhận được link thanh toán từ server');
        }
        
        console.log('✅ Upgrade payment created:', { paymentUrl, transactionId });
        
        // Navigate to embedded payment with paymentUrl (not checkoutUrl)
        const encodedPaymentUrl = encodeURIComponent(paymentUrl);
        router.push(`/payment/embedded?checkoutUrl=${encodedPaymentUrl}&orderCode=${paymentResult.data?.orderCode}&transactionId=${transactionId || 'upgrade'}` as any);
      } else {
        throw new Error(paymentResult.message || 'Payment creation failed');
      }
    } catch (error: any) {
      console.error('Error creating upgrade payment:', error);
      Toast.show({
        type: "error",
        text1: "Lỗi tạo thanh toán",
        text2: error.message || "Không thể tạo thanh toán cho nâng cấp",
      });
    }
  };

  const handleCancel = async () => {
    try {
      const result = await SubscriptionService.cancelSubscription({
        cancellationReason: "User requested cancellation"
      });

      if (result.isSucceeded) {
        Toast.show({
          type: "success",
          text1: "Hủy đăng ký thành công",
          text2: "Gói đăng ký đã được hủy",
        });
        loadSubscriptionData();
      } else {
        throw new Error(result.message || 'Cancellation failed');
      }
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      Toast.show({
        type: "error",
        text1: "Lỗi hủy đăng ký",
        text2: error.message || "Không thể hủy gói đăng ký",
      });
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' VNĐ';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return '#4CAF50';
      case 'Pending':
        return '#FF9500';
      case 'Expired':
        return '#F44336';
      case 'Cancelled':
        return '#9E9E9E';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active':
        return 'Đang hoạt động';
      case 'Pending':
        return 'Chờ thanh toán';
      case 'Expired':
        return 'Đã hết hạn';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getFeatureName = (featureName: string) => {
    switch (featureName) {
      case 'smart_meal_generation':
        return 'Tạo thực đơn thông minh';
      case 'recipe_generation':
        return 'Tạo công thức';
      case 'Recipe Search':
        return 'Tìm kiếm công thức';
      case 'Basic Meal Planning':
        return 'Lập kế hoạch bữa ăn cơ bản';
      case 'Allergen Alerts':
        return 'Cảnh báo dị ứng';
      case 'Profile Management':
        return 'Quản lý hồ sơ';
      case 'Community Access':
        return 'Truy cập cộng đồng';
      case 'Advanced Analytics':
        return 'Phân tích nâng cao';
      case 'Premium Support':
        return 'Hỗ trợ cao cấp';
      case 'Custom Recipes':
        return 'Công thức tùy chỉnh';
      case 'Shopping Lists':
        return 'Danh sách mua sắm';
      case 'Nutrition Tracking':
        return 'Theo dõi dinh dưỡng';
      case 'Family Sharing':
        return 'Chia sẻ gia đình';
      case 'Offline Access':
        return 'Truy cập ngoại tuyến';
      case 'Export Data':
        return 'Xuất dữ liệu';
      case 'API Access':
        return 'Truy cập API';
      case 'White Label':
        return 'Thương hiệu tùy chỉnh';
      default:
        return featureName;
    }
  };

  // Helper function to safely get string values
  const safeString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (value === null || value === undefined) return '';
    return JSON.stringify(value);
  };

  // Helper function to safely get number values
  const safeNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText>Đang tải...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Current Subscription Status */}
        {subscriptionStatus?.hasActiveSubscription && subscriptionStatus.currentSubscription && (
          <View style={styles.currentSubscriptionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Gói đăng ký hiện tại
              </ThemedText>
            </View>

            <View style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <ThemedText type="subtitle" style={styles.planName}>
                  {safeString(subscriptionStatus.currentSubscription?.planName)}
                </ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscriptionStatus.currentSubscription.status) }]}>
                  <ThemedText style={styles.statusText}>
                    {getStatusText(subscriptionStatus.currentSubscription.status)}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.subscriptionDetails}>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Giá:</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {formatPrice(safeNumber(subscriptionStatus.currentSubscription.planPrice))}/{safeString(subscriptionStatus.currentSubscription.billingCycle)}
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Ngày bắt đầu:</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {new Date(subscriptionStatus.currentSubscription.startDate).toLocaleDateString('vi-VN')}
                  </ThemedText>
                </View>
                {subscriptionStatus.currentSubscription.endDate && (
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Ngày hết hạn:</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {new Date(subscriptionStatus.currentSubscription.endDate).toLocaleDateString('vi-VN')}
                    </ThemedText>
                  </View>
                )}
                {subscriptionStatus.currentSubscription.daysRemaining && (
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Còn lại:</ThemedText>
                    <ThemedText style={[styles.detailValue, { color: subscriptionStatus.currentSubscription.daysRemaining <= 7 ? '#F44336' : '#4CAF50' }]}>
                      {safeString(subscriptionStatus.currentSubscription.daysRemaining)} ngày
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Usage Information */}
              {subscriptionStatus.planLimits && Object.keys(subscriptionStatus.planLimits).length > 0 && (
                <View style={styles.usageContainer}>
                  <ThemedText style={styles.usageTitle}>Sử dụng trong tháng:</ThemedText>
                  {Object.entries(subscriptionStatus.planLimits).map(([feature, limit]) => {
                    const used = safeNumber(subscriptionStatus.currentUsage?.[feature]);
                    const limitNumber = safeNumber(limit);
                    
                    if (limitNumber === 0) return null;
                    
                    const percentage = (used / limitNumber) * 100;
                    
                    return (
                      <View key={feature} style={styles.usageRow}>
                        <View style={styles.usageInfo}>
                          <ThemedText style={styles.featureName}>
                            {getFeatureName(feature)}
                          </ThemedText>
                          <ThemedText style={styles.usageText}>
                            {used}/{limitNumber}
                          </ThemedText>
                        </View>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%` }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {subscriptionStatus.currentSubscription.status === 'Active' && (
                  <ThemedButton
                    title="Hủy đăng ký"
                    onPress={handleCancel}
                    variant="secondary"
                    style={styles.cancelButton}
                  />
                )}
              </View>
            </View>
          </View>
        )}

        {/* Available Plans */}
        <View style={styles.plansContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetags" size={24} color="#007AFF" />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {subscriptionStatus?.hasActiveSubscription ? 'Nâng cấp gói' : 'Chọn gói đăng ký'}
            </ThemedText>
          </View>

          {availablePlans.map((plan) => {
            const isCurrentPlan = subscriptionStatus?.currentSubscription?.planId === plan.id;
            const canUpgrade = subscriptionStatus?.hasActiveSubscription && 
                             subscriptionStatus.currentSubscription &&
                             safeNumber(subscriptionStatus.currentSubscription.planPrice) < safeNumber(plan.price);

            return (
              <View key={plan.id} style={[styles.planCard, isCurrentPlan && styles.currentPlanCard]}>
                <View style={styles.planHeader}>
                  <ThemedText type="subtitle" style={styles.planTitle}>
                    {safeString(plan.name)}
                  </ThemedText>
                  {isCurrentPlan && (
                    <View style={styles.currentPlanBadge}>
                      <ThemedText style={styles.currentPlanText}>Hiện tại</ThemedText>
                    </View>
                  )}
                </View>

                <ThemedText style={styles.planDescription}>
                  {safeString(plan.description)}
                </ThemedText>

                <ThemedText type="title" style={styles.planPrice}>
                  {formatPrice(safeNumber(plan.price))}
                  <ThemedText style={styles.billingCycle}>/{safeString(plan.billingCycle)}</ThemedText>
                </ThemedText>

                {/* Features */}
                <View style={styles.featuresContainer}>
                  {Array.isArray(plan.features) && plan.features.map((feature, index) => {
                    if (!feature || typeof feature !== 'object') {
                      return null;
                    }
                    
                    const featureId = feature.id || `feature-${index}`;
                    const featureName = safeString(feature.featureName );
                    const featureDescription = safeString(feature.description);
                    const isEnabled = feature.isEnabled !== false; // Default to true if not specified
                    
                    if (!isEnabled) return null;
                    
                    return (
                      <View key={featureId} style={styles.featureRow}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <ThemedText style={styles.featureText}>
                          {featureDescription || featureName}
                        </ThemedText>
                      </View>
                    );
                  })}
                </View>

                {/* Action Button */}
                {!isCurrentPlan && (
                  <ThemedButton
                    title={subscriptionStatus?.hasActiveSubscription ? 
                      (canUpgrade ? "Nâng cấp" : "Không thể nâng cấp") : 
                      "Đăng ký"}
                    onPress={() => subscriptionStatus?.hasActiveSubscription ? 
                      handleUpgrade(plan) : 
                      handleSubscribe(plan)}
                    disabled={subscriptionStatus?.hasActiveSubscription && !canUpgrade}
                    style={styles.subscribeButton}
                  />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  currentSubscriptionContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subscriptionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subscriptionDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  usageContainer: {
    marginBottom: 16,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  usageRow: {
    marginBottom: 12,
  },
  usageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  featureName: {
    fontSize: 14,
    color: '#333',
  },
  usageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  plansContainer: {
    padding: 16,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currentPlanCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  currentPlanBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  currentPlanText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
  },
  billingCycle: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#666',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
  },
});