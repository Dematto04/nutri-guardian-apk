import { Colors } from "@/constants/Colors";
import { MealPlanService } from "@/service/mealPlan.service";
import { Ionicons } from "@expo/vector-icons";
import {
    ScrollView
} from "@gluestack-ui/themed";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface MealEntry {
  id: number;
  mealDate: string;
  mealType: string;
  mealName: string;
  servings: number;
  notes: string;
  recipeId?: number;
  productId?: number;
  recipe?: {
    id: number;
    name: string;
    prepTime: number;
    cookTime: number;
  };
  isCompleted: boolean;
}

interface MealPlan {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  planType: string;
  notes: string;
  totalMeals: number;
  completedMeals: number;
  createdAt: string;
  mealEntries: MealEntry[];
}

interface MealPlanResponse {
  isSucceeded: boolean;
  timestamp: string;
  messages: {
    Success: string[];
  };
  data: {
    items: MealPlan[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  pagination: null;
}

function TrackingScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [todaysMeals, setTodaysMeals] = useState<MealEntry[]>([]);
  const isFocused = useIsFocused();
  const router = useRouter();

  const getMealPlan = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setError(null);

    try {
      const res = await MealPlanService.getMealPlan();
      const responseData = res.data as MealPlanResponse;

      if (responseData.isSucceeded && responseData.data?.items) {
        setMealPlans(responseData.data.items);
        extractTodaysMeals(responseData.data.items);
      } else {
        setError("Không thể tải dữ liệu kế hoạch bữa ăn");
      }
    } catch (error) {
      console.log("Get meal plan error", { error });
      setError("Đã xảy ra lỗi khi tải kế hoạch bữa ăn");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const extractTodaysMeals = (plans: MealPlan[]) => {
    const today = new Date().toISOString().split('T')[0];
    const todayMeals: MealEntry[] = [];
    
    plans.forEach(plan => {
      const todayEntries = plan.mealEntries?.filter(entry => 
        entry.mealDate === today
      ) || [];
      todayMeals.push(...todayEntries);
    });
    
    // Sort by meal type order
    const mealOrder = { 'breakfast': 1, 'lunch': 2, 'dinner': 3, 'snack': 4 };
    todayMeals.sort((a, b) => 
      (mealOrder[a.mealType as keyof typeof mealOrder] || 99) - 
      (mealOrder[b.mealType as keyof typeof mealOrder] || 99)
    );
    
    setTodaysMeals(todayMeals);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    getMealPlan(false);
  };

  const handleMealCompletion = async (planId: number, entryId: number, isCompleted: boolean) => {
    try {
      await MealPlanService.toggleMealCompletion(planId, entryId, !isCompleted);
      
      // Update local state
      setMealPlans(prev => prev.map(plan => {
        if (plan.id === planId) {
          const updatedEntries = plan.mealEntries.map(entry => 
            entry.id === entryId ? { ...entry, isCompleted: !isCompleted } : entry
          );
          const completedCount = updatedEntries.filter(e => e.isCompleted).length;
          
          return {
            ...plan,
            mealEntries: updatedEntries,
            completedMeals: completedCount
          };
        }
        return plan;
      }));
      
      // Update today's meals
      setTodaysMeals(prev => prev.map(entry => 
        entry.id === entryId ? { ...entry, isCompleted: !isCompleted } : entry
      ));
      
      Toast.show({
        type: "success",
        text1: !isCompleted ? "Bữa ăn đã hoàn thành! 🎉" : "Đã hủy hoàn thành",
        text2: !isCompleted ? "Tuyệt vời! Bạn đang tiến bộ rất tốt" : "Bữa ăn được đánh dấu chưa hoàn thành",
      });
    } catch (error) {
      console.error('Error toggling meal completion:', error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể cập nhật trạng thái bữa ăn",
      });
    }
  };

  const getRecommendations = async (mealType: string) => {
    try {
      const preferences = {
        cuisineTypes: ['Italian', 'Asian'], // Could be saved in user preferences
        maxCookingTime: 45,
        budgetRange: 'medium' as const,
        preferredMealTypes: [mealType],
        includeLeftovers: true,
        varietyMode: true,
      };
      
      const response = await MealPlanService.getRecipeRecommendations(mealType, preferences);
      
      if (response.data?.isSucceeded) {
        const recipeIds = response.data.data;
        Alert.alert(
          "Gợi ý món ăn",
          `Tìm thấy ${recipeIds.length} món ${mealType} phù hợp với bạn!`,
          [
            { text: "Xem chi tiết", onPress: () => {/* Navigate to recommendations */} },
            { text: "Đóng", style: "cancel" }
          ]
        );
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải gợi ý món ăn",
      });
    }
  };

  useEffect(() => {
    if (isFocused) {
      getMealPlan();
    }
  }, [isFocused]);

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const calculateCompletion = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍿';
      default: return '🍽️';
    }
  };

  const getMealTypeName = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'Sáng';
      case 'lunch': return 'Trưa';
      case 'dinner': return 'Tối';
      case 'snack': return 'Snack';
      default: return mealType;
    }
  };

  const renderTodaysMeals = () => {
    if (todaysMeals.length === 0) {
      return (
        <View style={styles.emptyTodayContainer}>
          <Ionicons name="restaurant-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyTodayText}>Chưa có bữa ăn nào hôm nay</Text>
          <TouchableOpacity
            style={styles.addMealButton}
            onPress={() => router.push('/(tabs)/tracking/create-meal-plan')}
          >
            <Text style={styles.addMealButtonText}>+ Thêm kế hoạch</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.todaySection}>
        <View style={styles.todaySectionHeader}>
          <Text style={styles.todaySectionTitle}>🍽️ Bữa ăn hôm nay</Text>
          <TouchableOpacity onPress={() => getRecommendations('dinner')}>
            <Ionicons name="sparkles" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        
        {todaysMeals.map((meal) => (
          <TouchableOpacity
            key={meal.id}
            style={[
              styles.todayMealCard,
              meal.isCompleted && styles.todayMealCardCompleted
            ]}
            onPress={() => handleMealCompletion(
              // Find the plan ID for this meal
              mealPlans.find(plan => plan.mealEntries.some(e => e.id === meal.id))?.id || 0,
              meal.id,
              meal.isCompleted
            )}
          >
            <View style={styles.todayMealLeft}>
              <View style={styles.mealCheckbox}>
                <Ionicons
                  name={meal.isCompleted ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={meal.isCompleted ? "#4CAF50" : "#94a3b8"}
                />
              </View>
              <View style={styles.todayMealContent}>
                <Text style={styles.todayMealType}>
                  {getMealTypeIcon(meal.mealType)} {getMealTypeName(meal.mealType)}
                </Text>
                <Text style={[
                  styles.todayMealName,
                  meal.isCompleted && styles.todayMealNameCompleted
                ]}>
                  {meal.mealName}
                </Text>
                {meal.recipe && (
                  <Text style={styles.todayMealTime}>
                    ⏱️ {meal.recipe.prepTime + meal.recipe.cookTime} phút
                  </Text>
                )}
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.recommendButton}
              onPress={(e) => {
                e.stopPropagation();
                getRecommendations(meal.mealType);
              }}
            >
              <Ionicons name="bulb-outline" size={16} color="#007AFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMealPlanCard = (mealPlan: MealPlan) => {
    const completionPercentage = calculateCompletion(mealPlan.completedMeals, mealPlan.totalMeals);
    const isActive = new Date(mealPlan.startDate) <= new Date() && new Date() <= new Date(mealPlan.endDate);
    
    return (
      <TouchableOpacity
        key={mealPlan.id}
        style={[styles.mealPlanCard, isActive && styles.activeMealPlanCard]}
        onPress={() => router.push(`/(tabs)/tracking/meal-plan-detail?id=${mealPlan.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.mealPlanHeader}>
          <View style={styles.mealPlanTitleRow}>
            <Text style={styles.mealPlanTitle}>{mealPlan.name}</Text>
            {isActive && (
              <View style={styles.activeLabel}>
                <Text style={styles.activeLabelText}>Đang hoạt động</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.mealPlanDate}>
            {formatDisplayDate(mealPlan.startDate)} - {formatDisplayDate(mealPlan.endDate)}
          </Text>
          
          <View style={styles.mealPlanStats}>
            <View style={styles.statItem}>
              <Ionicons name="restaurant" size={16} color="#64748b" />
              <Text style={styles.statText}>{mealPlan.totalMeals} bữa ăn</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.statText}>{mealPlan.completedMeals} hoàn thành</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={16} color="#64748b" />
              <Text style={styles.statText}>{mealPlan.planType}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Tiến độ</Text>
            <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill,
                  { width: `${completionPercentage}%` }
                ]}
              />
            </View>
          </View>
        </View>

        {mealPlan.notes && (
          <Text style={styles.mealPlanNotes} numberOfLines={2}>
            💭 {mealPlan.notes}
          </Text>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
                          onPress={(e) => {
                e.stopPropagation();
                // Navigate to smart add component
                router.push(`/(tabs)/tracking/add-smart-meals?mealPlanId=${mealPlan.id}&mealPlanName=${encodeURIComponent(mealPlan.name)}` as any);
              }}
          >
            <Ionicons name="sparkles" size={14} color="#007AFF" />
            <Text style={styles.quickActionText}>Smart Add</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/(tabs)/tracking/meal-plan-detail?id=${mealPlan.id}`);
            }}
          >
            <Ionicons name="eye" size={14} color="#007AFF" />
            <Text style={styles.quickActionText}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Đang tải kế hoạch bữa ăn...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => getMealPlan()}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎯 Theo dõi bữa ăn</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/(tabs)/tracking/create-meal-plan')}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Today's Meals Section */}
        {renderTodaysMeals()}

        {/* Meal Plans Section */}
        <View style={styles.mealPlansSection}>
          <Text style={styles.sectionTitle}>📋 Kế hoạch của bạn</Text>
          
          {mealPlans.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#94a3b8" />
              <Text style={styles.emptyTitle}>Chưa có kế hoạch bữa ăn</Text>
              <Text style={styles.emptyDescription}>
                Tạo kế hoạch bữa ăn đầu tiên để bắt đầu hành trình ăn uống lành mạnh
              </Text>
              <TouchableOpacity
                style={styles.createFirstPlanButton}
                onPress={() => router.push('/(tabs)/tracking/create-meal-plan')}
              >
                <Text style={styles.createFirstPlanText}>🎯 Tạo kế hoạch thông minh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            mealPlans.map(renderMealPlanCard)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  createButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todaySection: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  todaySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todaySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  emptyTodayContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyTodayText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
    marginBottom: 16,
  },
  addMealButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addMealButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  todayMealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  todayMealCardCompleted: {
    opacity: 0.7,
  },
  todayMealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealCheckbox: {
    marginRight: 12,
  },
  todayMealContent: {
    flex: 1,
  },
  todayMealType: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  todayMealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  todayMealNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  todayMealTime: {
    fontSize: 12,
    color: '#64748b',
  },
  recommendButton: {
    padding: 8,
  },
  mealPlansSection: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createFirstPlanButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstPlanText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  mealPlanCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#e2e8f0',
  },
  activeMealPlanCard: {
    borderLeftColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  mealPlanHeader: {
    marginBottom: 12,
  },
  mealPlanTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealPlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  activeLabel: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeLabelText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  mealPlanDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  mealPlanStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#64748b',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarBackground: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  mealPlanNotes: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
  },
  quickActionText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default TrackingScreen;
