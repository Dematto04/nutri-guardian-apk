import { Colors } from "@/constants/Colors";
import { MealPlanService } from "@/service/mealPlan.service";
import { mealPlanDetailScreenStyles as styles } from "@/styles/tracking/detail-meal-plan.style";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Progress } from "@gluestack-ui/themed";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

// Types for recipe in meal entries
interface Recipe {
  id: number;
  businessId: string;
  name: string;
  description: string;
  cuisineType: string;
  mealType: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficultyLevel: string;
  ratingAverage: number | null;
  ratingCount: number | null;
  likesCount: number | null;
  savesCount: number | null;
  isCustom: boolean;
  isPublic: boolean;
  createAt: string;
  updateAt: string;
  thumbnailImageUrl: string | null;
}

// Types for meal entries
interface MealEntry {
  id: number;
  mealDate: string;
  mealType: string;
  mealName: string;
  servings: number;
  notes: string;
  recipeId: number | null;
  productId: number | null;
  recipe: Recipe | null;
  isCompleted: boolean;
}

// Normalized meal type
enum NormalizedMealType {
  BREAKFAST = '1',
  LUNCH = '2',
  DINNER = '3'
}

// Type for normalized meal entry
interface NormalizedMealEntry extends MealEntry {
  normalizedType: NormalizedMealType;
}

// Type for meal plan detail
interface MealPlanDetail {
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

// Type for API response
interface MealPlanDetailResponse {
  isSucceeded: boolean;
  timestamp: string;
  messages: {
    Success: string[];
  };
  data: MealPlanDetail;
  pagination: null;
}

// Type for calendar marked dates
interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    selected?: boolean;
    selectedColor?: string;
    dotColor?: string;
  };
}

export default function MealPlanDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [mealPlanDetail, setMealPlanDetail] = useState<MealPlanDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Helper function to normalize meal types
  const normalizeMealType = (mealType: string): NormalizedMealType => {
    if (mealType === "Bữa sáng" || mealType === "Breakfast" || mealType === "1") {
      return NormalizedMealType.BREAKFAST;
    } else if (mealType === "Bữa trưa" || mealType === "Lunch" || mealType === "2") {
      return NormalizedMealType.LUNCH;
    } else if (mealType === "Bữa tối" || mealType === "Dinner" || mealType === "3") {
      return NormalizedMealType.DINNER;
    } else {
      // Default to breakfast if unspecified
      return NormalizedMealType.BREAKFAST;
    }
  };

  // Format display date
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // Get meal type display name
  const getMealTypeDisplayName = (type: NormalizedMealType): string => {
    switch (type) {
      case NormalizedMealType.BREAKFAST:
        return "🥐 Bữa sáng";
      case NormalizedMealType.LUNCH:
        return "🍱 Bữa trưa";
      case NormalizedMealType.DINNER:
        return "🍜 Bữa tối";
      default:
        return "Bữa ăn";
    }
  };

  // Fetch meal plan data
  const fetchMealPlanDetail = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setIsError(false);
    
    try {
      if (!id) {
        throw new Error("No meal plan id found");
      }
      
      const res = await MealPlanService.getMealPlanDetail(id as string);
      const responseData = res.data as MealPlanDetailResponse;
      
      if (responseData.isSucceeded && responseData.data) {
        setMealPlanDetail(responseData.data);
        
        // Set selected date to start date if today isn't within range
        const startDate = new Date(responseData.data.startDate);
        const endDate = new Date(responseData.data.endDate);
        const today = new Date();
        
        if (today < startDate || today > endDate) {
          setSelectedDate(responseData.data.startDate);
        }
      } else {
        throw new Error("API returned error");
      }
    } catch (error) {
      console.log({ error });
      setIsError(true);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [id]);
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchMealPlanDetail(false);
  };

  // Effect to fetch data on mount
  useEffect(() => {
    fetchMealPlanDetail();
  }, [fetchMealPlanDetail]);
  
  // Prepare marked dates for calendar
  const markedDates = useMemo(() => {
    if (!mealPlanDetail) return {};
    
    const dates: MarkedDates = {};
    
    // Mark all dates in the range
    const start = new Date(mealPlanDetail.startDate);
    const end = new Date(mealPlanDetail.endDate);
    
    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      const dateStr = day.toISOString().split('T')[0];
      dates[dateStr] = {
        marked: true,
        dotColor: Colors.primary
      };
    }
    
    // Mark selected date
    dates[selectedDate] = {
      ...dates[selectedDate],
      selected: true,
      selectedColor: Colors.primary
    };
    
    return dates;
  }, [mealPlanDetail, selectedDate]);
  
  // Get meals for selected date
  const mealsForSelectedDate = useMemo(() => {
    if (!mealPlanDetail) return [];
    
    // Filter entries for selected date
    const entries = mealPlanDetail.mealEntries.filter(
      entry => entry.mealDate === selectedDate
    );
    
    // Normalize meal types
    const normalizedEntries: NormalizedMealEntry[] = entries.map(entry => ({
      ...entry,
      normalizedType: normalizeMealType(entry.mealType)
    }));
    
    // For each meal type, get the first entry if available
    const mealsByType: Record<NormalizedMealType, NormalizedMealEntry | null> = {
      [NormalizedMealType.BREAKFAST]: null,
      [NormalizedMealType.LUNCH]: null,
      [NormalizedMealType.DINNER]: null
    };
    
    normalizedEntries.forEach(entry => {
      if (!mealsByType[entry.normalizedType]) {
        mealsByType[entry.normalizedType] = entry;
      }
    });
    
    return mealsByType;
  }, [mealPlanDetail, selectedDate]);
  
  // Jump to today
  const handleTodayPress = () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (mealPlanDetail) {
      const startDate = new Date(mealPlanDetail.startDate);
      const endDate = new Date(mealPlanDetail.endDate);
      const todayDate = new Date(today);
      
      // Check if today is within the meal plan range
      if (todayDate >= startDate && todayDate <= endDate) {
        setSelectedDate(today);
      } else {
        Alert.alert(
          "Thông báo", 
          "Ngày hôm nay không nằm trong khoảng thời gian của kế hoạch bữa ăn này."
        );
      }
    }
  };
  
  // Handle date selection in calendar
  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };
  
  // Handle meal completion toggle
  const handleToggleMealCompletion = (meal: NormalizedMealEntry) => {
    Alert.alert(
      "Thông báo",
      `${meal.isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu đã hoàn thành"} món ${meal.mealName}?`,
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xác nhận",
          onPress: () => {
            Alert.alert("Thông báo", "Đã cập nhật trạng thái món ăn");
          }
        }
      ]
    );
  };
  
  // Handle delete meal
  const handleDeleteMeal = (meal: NormalizedMealEntry) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa món ${meal.mealName} không?`,
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            Alert.alert("Thông báo", "Đã xóa món ăn");
          }
        }
      ]
    );
  };
  
  // Handle add meal
  const handleAddMeal = (mealType: NormalizedMealType) => {
    router.push("/(tabs)/explore")
  };
  
  // Handle view recipe detail
  const handleViewRecipe = (recipeId: number) => {
    // Navigate to recipe detail screen
    router.push({
      pathname: "/(tabs)/explore/recipe-detail/[id]",
      params: { id: recipeId }
    });
  };
  
  // Render meal card
  const renderMealCard = (mealType: NormalizedMealType) => {
    const meal = mealsForSelectedDate[mealType];
    
    return (
      <View style={styles.mealCard} key={mealType}>
        <Text style={styles.mealTypeTitle}>
          {getMealTypeDisplayName(mealType)}
        </Text>
        
        {meal ? (
          <View style={styles.mealContent}>
            <TouchableOpacity
              onPress={() => meal.recipeId ? handleViewRecipe(meal.recipeId) : null}
              style={[styles.mealInfo, meal.recipeId ? styles.mealInfoTappable : null]}
            >
              <Text style={styles.mealName}>{meal.mealName}</Text>
              
              <View style={styles.mealDetails}>
                {meal.servings > 0 && (
                  <View style={styles.mealDetailItem}>
                    <Feather name="users" size={14} color="#64748b" />
                    <Text style={styles.mealDetailText}>
                      {meal.servings} người
                    </Text>
                  </View>
                )}
                
                {meal.notes && (
                  <View style={styles.mealDetailItem}>
                    <Ionicons name="document-text-outline" size={14} color="#64748b" />
                    <Text style={styles.mealDetailText}>
                      {meal.notes}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            
            <View style={styles.mealActions}>
              <TouchableOpacity 
                style={[
                  styles.statusButton,
                  meal.isCompleted ? styles.completedButton : styles.incompletedButton
                ]}
                onPress={() => handleToggleMealCompletion(meal)}
              >
                <Text style={meal.isCompleted ? styles.completedText : styles.incompletedText}>
                  {meal.isCompleted ? '✅ Hoàn thành' : '⬜ Chưa ăn'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteMeal(meal)}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyMealContent}>
            <Text style={styles.emptyMealText}>Chưa có món ăn</Text>
            
            <TouchableOpacity
              style={styles.addMealButton}
              onPress={() => handleAddMeal(mealType)}
            >
              <Ionicons name="add" size={16} color={Colors.primary} />
              <Text style={styles.addMealButtonText}>Thêm món</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  
  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    if (!mealPlanDetail || mealPlanDetail.totalMeals === 0) return 0;
    return Math.round((mealPlanDetail.completedMeals / mealPlanDetail.totalMeals) * 100);
  }, [mealPlanDetail]);

  // Render loading skeleton
  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {/* Calendar skeleton */}
      <View style={styles.calendarSkeleton}>
        <View style={styles.calendarHeaderSkeleton} />
        <View style={styles.calendarDaysSkeleton}>
          {[...Array(7)].map((_, i) => (
            <View key={i} style={styles.calendarDaySkeleton} />
          ))}
        </View>
        <View style={styles.calendarWeekSkeleton}>
          {[...Array(7)].map((_, i) => (
            <View key={i} style={styles.calendarDayItemSkeleton} />
          ))}
        </View>
      </View>
      
      {/* Meals skeleton */}
      {[...Array(3)].map((_, i) => (
        <View key={i} style={styles.mealCardSkeleton}>
          <View style={styles.mealTypeSkeleton} />
          <View style={styles.mealContentSkeleton}>
            <View style={styles.mealNameSkeleton} />
            <View style={styles.mealDetailsSkeleton} />
            <View style={styles.mealActionsSkeleton} />
          </View>
        </View>
      ))}
      
      {/* Summary skeleton */}
      <View style={styles.summarySkeleton}>
        <View style={styles.summaryTextSkeleton} />
        <View style={styles.progressSkeleton} />
      </View>
    </View>
  );
  
  // Render error state
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={60} color="#ef4444" />
      <Text style={styles.errorText}>Không thể tải dữ liệu kế hoạch ăn</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => fetchMealPlanDetail()}
      >
        <Text style={styles.retryButtonText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  // Main render
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderSkeleton()}
      </SafeAreaView>
    );
  }
  
  if (isError || !mealPlanDetail) {
    return (
      <SafeAreaView style={styles.container}>
        {renderError()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header section */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{mealPlanDetail.name}</Text>
          <Text style={styles.headerSubtitle}>
            {formatDisplayDate(mealPlanDetail.startDate)} - {formatDisplayDate(mealPlanDetail.endDate)}
          </Text>
          {mealPlanDetail.notes && (
            <Text style={styles.headerNotes}>{mealPlanDetail.notes}</Text>
          )}
        </View>
        
        {/* Calendar section */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            minDate={mealPlanDetail.startDate}
            maxDate={mealPlanDetail.endDate}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: Colors.primary,
              todayTextColor: Colors.primary,
              arrowColor: Colors.primary,
              dotColor: Colors.primary,
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
              monthTextColor: Colors.primary,
              textMonthFontWeight: '700',
              calendarBackground: 'white',
              dayTextColor: '#334155',
              textSectionTitleColor: '#64748b',
              textSectionTitleDisabledColor: '#94a3b8',
              selectedDayTextColor: 'white',
              textDisabledColor: '#cbd5e1'
            }}
          />
          
          <TouchableOpacity
            style={styles.todayButton}
            onPress={handleTodayPress}
          >
            <Text style={styles.todayButtonText}>Hôm nay</Text>
          </TouchableOpacity>
        </View>
        
        {/* Selected day info */}
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>
            {formatDisplayDate(selectedDate)}
          </Text>
        </View>
        
        {/* Meals section */}
        <View style={styles.mealsContainer}>
          {renderMealCard(NormalizedMealType.BREAKFAST)}
          {renderMealCard(NormalizedMealType.LUNCH)}
          {renderMealCard(NormalizedMealType.DINNER)}
        </View>
        
        {/* Summary section */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Tổng kết kế hoạch</Text>
          
          <View style={styles.progressContainer}>
            <Progress value={completionPercentage} size="md" style={styles.progressBar}>
              <Progress.FilledTrack bg={completionPercentage > 0 ? "#22c55e" : "#cbd5e1"} />
            </Progress>
            
            <View style={styles.progressDetails}>
              <Text style={styles.progressText}>
                {mealPlanDetail.completedMeals}/{mealPlanDetail.totalMeals} bữa đã hoàn thành
              </Text>
              <Text style={styles.progressPercentage}>
                {completionPercentage}%
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


