/**
 * MealPlanAssignmentDrawer Component
 *
 * A modern, responsive React Native UI for selecting meal plans and assigning recipes.
 *
 * Features:
 * - Step 1: Select a meal plan from available options
 * - Step 2: View calendar with meal plan date range indicators
 * - Step 3: Select meal slots (Breakfast, Lunch, Dinner) for recipe assignment
 * - Smooth transitions between steps
 * - Loading states and skeleton loaders
 * - Responsive design for iOS and Android
 * - Built with Gluestack ActionSheet for native feel
 */

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Colors } from "@/constants/Colors";
import { MealPlanService } from "@/service/mealPlan.service";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

// Types for meal plan data
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

interface MealEntry {
  id: number;
  mealDate: string;
  mealType: string;
  mealName: string;
  servings: number;
  notes: string;
  recipeId: number;
  productId: number | null;
  recipe: Recipe;
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

interface MealPlanDetailResponse {
  isSucceeded: boolean;
  timestamp: string;
  messages: {
    Success: string[];
  };
  data: MealPlan;
  pagination: null;
}

interface MealSlot {
  type: "breakfast" | "lunch" | "dinner";
  label: string;
  icon: string;
  entries: MealEntry[];
}

type DrawerStep = "select-plan" | "calendar" | "meal-slots";

interface IMealPlanEntriesDrawerProps {
  showDrawer: boolean;
  setShowDrawer: (arg: boolean) => void;
  onMealPlanSelected?: (mealPlanId: number) => void;
  recipeId: number;
}


export default function MealPlanEntriesDrawer({
  showDrawer,
  setShowDrawer,
  onMealPlanSelected,
  recipeId,
}: IMealPlanEntriesDrawerProps) {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<DrawerStep>("select-plan");
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Animation values
  const slideAnim = useSharedValue(0);

  // Handle meal plan selection and fetch details
  const handleMealPlanSelection = async (plan: MealPlan) => {
    setLoadingDetail(true);
    try {
      const response: { data: MealPlanDetailResponse } =
        await MealPlanService.getMealPlanDetail(plan.id.toString());

      if (response.data) {
        setSelectedMealPlan(response.data.data);
        setCurrentStep("calendar");
        slideAnim.value = withSpring(1);
        onMealPlanSelected?.(plan.id);
      }
    } catch (error) {
      console.error("Error fetching meal plan detail:", error);
      // Fall back to mock data
    } finally {
      setLoadingDetail(false);
    }
  };
  // Handle date selection and move to meal slots step
  const handleDateSelection = (date: string) => {
    setSelectedDate(date);
    setCurrentStep("meal-slots");
    slideAnim.value = withSpring(2);
  };

  // Handle recipe assignment to meal slot
  const getMealTypeApi = useCallback((mealType: string) => {
    if (mealType === "breakfast") {
      return 1;
    } else if (mealType === "lunch") {
      return 2;
    } else if (mealType === "dinner") {
      return 3;
    }
  }, []);
  const handleMealSlotSelection = async (mealType: string) => {
    try {
      if (selectedMealPlan && selectedDate) {
        console.log(
          `Assigning recipe to ${mealType} on ${selectedDate} for meal plan ${selectedMealPlan.id}`
        );

        console.log({
          mealPlanId: selectedMealPlan.id,
          mealDate: selectedDate,
          mealType: getMealTypeApi(mealType),
          notes: "",
          recipeId: recipeId,
          servings: 1,
        });

        const res = await MealPlanService.mealPlanEntries(selectedMealPlan.id, {
          mealPlanId: selectedMealPlan.id,
          mealDate: selectedDate,
          mealType: getMealTypeApi(mealType),
          notes: "",
          recipeId: recipeId,
          servings: 1,
        });
        setShowDrawer(false);
        resetDrawer();
        console.log({
          res,
        });

        Alert.alert("Thêm thành công", "Công thức đã được thêm vào kế hoạch");
      }
    } catch (error) {
      console.log({
        error,
      });
      Alert.alert("Thêm thất bại", "Có lỗi xảy ra");
    }
  };

  // Reset drawer state
  const resetDrawer = () => {
    setSelectedMealPlan(null);
    setSelectedDate("");
    setCurrentStep("select-plan");
    slideAnim.value = 0;
  };

  // Handle drawer close
  const handleClose = () => {
    setShowDrawer(false);
    resetDrawer();
  };

  // Format date helper
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const end = new Date(endDate).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${start} - ${end}`;
  };

  // Normalize meal type for comparison
  const normalizeMealType = (mealType: string): string => {
    const normalized = mealType.toLowerCase();
    if (
      normalized.includes("sáng") ||
      normalized === "breakfast" ||
      normalized === "1"
    ) {
      return "breakfast";
    } else if (
      normalized.includes("trưa") ||
      normalized === "lunch" ||
      normalized === "2"
    ) {
      return "lunch";
    } else if (
      normalized.includes("tối") ||
      normalized.includes("chiều") ||
      normalized === "dinner" ||
      normalized === "3"
    ) {
      return "dinner";
    }
    return "other";
  };

  // Get meal entries for selected date
  const getMealEntriesForDate = (date: string): MealSlot[] => {
    if (!selectedMealPlan) return [];

    const dateEntries = selectedMealPlan.mealEntries.filter(
      (entry) => entry.mealDate === date
    );

    const slots: MealSlot[] = [
      {
        type: "breakfast",
        label: "Bữa sáng",
        icon: "sunny-outline",
        entries: [],
      },
      {
        type: "lunch",
        label: "Bữa trưa",
        icon: "partly-sunny-outline",
        entries: [],
      },
      { type: "dinner", label: "Bữa tối", icon: "moon-outline", entries: [] },
    ];

    dateEntries.forEach((entry) => {
      const normalizedType = normalizeMealType(entry.mealType);
      const slot = slots.find((s) => s.type === normalizedType);
      if (slot) {
        slot.entries.push(entry);
      }
    });

    return slots;
  };

  const getMealPlan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MealPlanService.getMealPlan();
      console.log("API Response:", JSON.stringify(res.data, null, 2));

      setMealPlans(res.data.data.items)
      console.log("mealPlans", res.data.data.items);
      
    } catch (error) {
      console.log({ error });
      // Fallback to test data on error
      console.log("Using test data due to API error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showDrawer) {
      getMealPlan();
    }
  }, [showDrawer, getMealPlan]);

  // Skeleton loader component
  const MealPlanSkeleton = () => {
    const shimmerValue = useSharedValue(0);

    React.useEffect(() => {
      const shimmerAnimation = () => {
        shimmerValue.value = withTiming(1, { duration: 1000 }, () => {
          shimmerValue.value = withTiming(
            0,
            { duration: 1000 },
            shimmerAnimation
          );
        });
      };
      shimmerAnimation();
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: 0.3 + shimmerValue.value * 0.7,
    }));

    return (
      <View style={styles.skeletonContainer}>
        {[1, 2, 3].map((item) => (
          <Animated.View
            key={item}
            style={[styles.skeletonCard, animatedStyle]}
          >
            <View style={styles.skeletonHeader} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLineShort} />
            <View style={styles.skeletonFooter}>
              <View style={styles.skeletonCircle} />
              <View style={styles.skeletonStats} />
            </View>
          </Animated.View>
        ))}
      </View>
    );
  };

  // Meal plan card component
  const MealPlanCard = ({ item }: { item: MealPlan }) => {
    const isSelected = selectedMealPlan?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.mealPlanCard, isSelected && styles.selectedCard]}
        onPress={() => handleMealPlanSelection(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Meal plan ${item.name}`}
        accessibilityHint="Tap to select this meal plan"
        disabled={loadingDetail}
      >
        {/* Selection indicator */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.radioButton,
              isSelected && styles.radioButtonSelected,
            ]}
          >
            {isSelected && <View style={styles.radioButtonInner} />}
          </View>
          <Text style={styles.mealPlanName} numberOfLines={2}>
            {item.name}
          </Text>
        </View>

        {/* Date range */}
        <Text style={styles.dateRange}>
          {formatDateRange(item.startDate, item.endDate)}
        </Text>

        {/* Notes */}
        {item.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}

        {/* Meal stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.totalMeals}</Text>
            <Text style={styles.statLabel}>Tổng bữa ăn</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.completedMeals}</Text>
            <Text style={styles.statLabel}>Đã hoàn thành</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    item.totalMeals > 0
                      ? (item.completedMeals / item.totalMeals) * 100
                      : 0
                  }%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {item.totalMeals > 0
              ? Math.round((item.completedMeals / item.totalMeals) * 100)
              : 0}
            %
          </Text>
        </View>

        {/* Loading overlay */}
        {loadingDetail && isSelected && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Calendar component with date range marking
  const CalendarStep = () => {
    if (!selectedMealPlan) return null;

    const startDate = new Date(selectedMealPlan.startDate);
    const endDate = new Date(selectedMealPlan.endDate);

    // Generate marked dates for the meal plan range
    const markedDates: any = {};
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split("T")[0];

      // Check if this date has meal entries
      const hasEntries = selectedMealPlan.mealEntries.some(
        (entry) => entry.mealDate === dateString
      );

      markedDates[dateString] = {
        marked: true,
        dotColor: hasEntries ? Colors.primary : "#E5E7EB",
        activeOpacity: 0.7,
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Mark selected date
    if (selectedDate) {
      markedDates[selectedDate] = {
        ...markedDates[selectedDate],
        selected: true,
        selectedColor: Colors.primary,
      };
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.stepHeader}>
          <TouchableOpacity
            onPress={() => {
              setCurrentStep("select-plan");
              slideAnim.value = withSpring(0);
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.stepTitle}>Chọn ngày</Text>
        </View>

        <Text style={styles.stepSubtitle}>
          Kế hoạch: {selectedMealPlan.name}
        </Text>

        <Calendar
          current={selectedMealPlan.startDate}
          minDate={selectedMealPlan.startDate}
          maxDate={selectedMealPlan.endDate}
          onDayPress={(day) => handleDateSelection(day.dateString)}
          markedDates={markedDates}
          theme={{
            selectedDayBackgroundColor: Colors.primary,
            selectedDayTextColor: "#ffffff",
            todayTextColor: Colors.primary,
            dayTextColor: "#2d4150",
            textDisabledColor: "#d9e1e8",
            dotColor: Colors.primary,
            selectedDotColor: "#ffffff",
            arrowColor: Colors.primary,
            disabledArrowColor: "#d9e1e8",
            monthTextColor: Colors.primary,
            indicatorColor: Colors.primary,
            textDayFontFamily: "monospace",
            textMonthFontFamily: "monospace",
            textDayHeaderFontFamily: "monospace",
            textDayFontWeight: "300",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "300",
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13,
          }}
        />
      </View>
    );
  };

  // Meal slots component
  const MealSlotsStep = () => {
    if (!selectedMealPlan || !selectedDate) return null;

    const formattedDate = new Date(selectedDate).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const mealSlots = getMealEntriesForDate(selectedDate);

    return (
      <View style={styles.mealSlotsContainer}>
        <View style={styles.stepHeader}>
          <TouchableOpacity
            onPress={() => {
              setCurrentStep("calendar");
              slideAnim.value = withSpring(1);
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.stepTitle}>Chọn bữa ăn</Text>
        </View>

        <Text style={styles.stepSubtitle}>{formattedDate}</Text>

        <ScrollView
          style={styles.mealSlotsList}
          showsVerticalScrollIndicator={false}
        >
          {mealSlots.map((slot, index) => (
            <TouchableOpacity
              key={slot.type}
              style={styles.mealSlotCard}
              onPress={() => handleMealSlotSelection(slot.type)}
              activeOpacity={0.7}
            >
              <View style={styles.mealSlotContent}>
                <View style={styles.mealSlotIcon}>
                  <Ionicons
                    name={slot.icon as any}
                    size={24}
                    color={Colors.primary}
                  />
                </View>
                <View style={styles.mealSlotInfo}>
                  <Text style={styles.mealSlotLabel}>{slot.label}</Text>
                  {slot.entries.length > 0 ? (
                    <View>
                      {slot.entries.map((entry, idx) => (
                        <View key={entry.id} style={styles.recipeItem}>
                          <Text style={styles.mealSlotRecipe} numberOfLines={1}>
                            {entry.recipe.name}
                          </Text>
                          <View style={styles.recipeDetails}>
                            <Text style={styles.recipeTime}>
                              ⏱️{" "}
                              {entry.recipe.prepTimeMinutes +
                                entry.recipe.cookTimeMinutes}{" "}
                              phút
                            </Text>
                            <Text style={styles.recipeDifficulty}>
                              📊 {entry.recipe.difficultyLevel}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.mealSlotEmpty}>Chưa có công thức</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Get step title based on current step
  const getStepTitle = () => {
    switch (currentStep) {
      case "select-plan":
        return "Chọn kế hoạch bữa ăn";
      case "calendar":
        return "Chọn ngày";
      case "meal-slots":
        return "Chọn bữa ăn";
      default:
        return "Chọn kế hoạch bữa ăn";
    }
  };

  // Log data for debugging
  useEffect(() => {
    if (showDrawer) {
      console.log("Drawer is open");
      console.log("Current step:", currentStep);
      console.log("Meal plans count:", mealPlans.length);
      console.log("Loading state:", loading);
      console.log(
        "Selected meal plan:",
        selectedMealPlan ? selectedMealPlan.id : "none"
      );
    }
  }, [showDrawer, currentStep, mealPlans.length, loading, selectedMealPlan]);

  return (
    <Actionsheet isOpen={showDrawer} onClose={handleClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent
        style={{
          backgroundColor: "white",
          paddingBottom: 20,
          minHeight: "80%",
        }}
      >
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <View style={styles.actionSheetHeader}>
          <Text style={styles.actionSheetTitle}>{getStepTitle()}</Text>
        </View>

        <View style={styles.actionSheetBody}>
          {currentStep === "select-plan" && (
            <View style={styles.container}>
              {loading ? (
                <MealPlanSkeleton />
              ) : (mealPlans.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Không có kế hoạch bữa ăn nào
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Hãy tạo kế hoạch mới để bắt đầu
                  </Text>
                  <TouchableOpacity
                    style={styles.debugButton}
                    onPress={() => {
                      getMealPlan();
                      Alert.alert("Debug", "Refreshing meal plans data");
                    }}
                  >
                    <Text style={styles.debugButtonText}>Refresh Data</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 400 }}
                >
                  {mealPlans.map((plan, index) => (
                    <View
                      key={plan.id}
                      style={index > 0 ? { marginTop: 12 } : {}}
                    >
                      <MealPlanCard item={plan} />
                    </View>
                  ))}
                </ScrollView>
              ))}
            </View>
          )}

          {currentStep === "calendar" && <CalendarStep />}
          {currentStep === "meal-slots" && <MealSlotsStep />}
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxHeight: 400,
  },
  listContainer: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },

  // ActionSheet styles
  actionSheetHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    width: "100%",
  },
  actionSheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  actionSheetBody: {
    width: "100%",
    height: 480,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },

  // Calendar styles
  calendarContainer: {
    flex: 1,
  },

  // Meal slots styles
  mealSlotsContainer: {
    flex: 1,
  },
  mealSlotsList: {
    flex: 1,
  },
  mealSlotCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mealSlotContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealSlotIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  mealSlotInfo: {
    flex: 1,
  },
  mealSlotLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  mealSlotRecipe: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 2,
  },
  mealSlotEmpty: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  recipeItem: {
    marginBottom: 8,
  },
  recipeDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  recipeTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  recipeDifficulty: {
    fontSize: 12,
    color: "#6B7280",
  },

  // Loading overlay
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },

  // Skeleton styles
  skeletonContainer: {
    paddingVertical: 8,
  },
  skeletonCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  skeletonHeader: {
    height: 20,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 12,
    width: "70%",
  },
  skeletonLine: {
    height: 14,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
    width: "100%",
  },
  skeletonLineShort: {
    height: 14,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 16,
    width: "60%",
  },
  skeletonFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skeletonCircle: {
    width: 24,
    height: 24,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
  },
  skeletonStats: {
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    width: "40%",
  },

  // Meal plan card styles
  mealPlanCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: "relative",
  },
  selectedCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: "#F0F9FF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 12,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  mealPlanName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    lineHeight: 22,
  },
  dateRange: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  notes: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 16,
    lineHeight: 20,
    fontStyle: "italic",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginRight: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    minWidth: 35,
    textAlign: "right",
  },

  // Footer styles
  footerButtons: {
    flexDirection: "row",
    width: "100%",
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },

  // Debug styles
  debugButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  debugButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
