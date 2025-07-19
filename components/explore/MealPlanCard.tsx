import { mealPlanEntryDrawerStyles as styles } from "@/styles/explore/meal-plan-entry.style";
import { Text, TouchableOpacity, View } from "react-native";
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
  mealEntries: any[];
}
interface IMealPlanCardProps {
  item: MealPlan;
  selectedMealPlanId: number;
  setSelectedMealPlanId: (id: number) => void;
}



const MealPlanCard = ({
  item,
  selectedMealPlanId,
  setSelectedMealPlanId,
}: IMealPlanCardProps) => {
  const isSelected = selectedMealPlanId === item.id;
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
  return (
    <TouchableOpacity
      style={[styles.mealPlanCard, isSelected && styles.selectedCard]}
      onPress={() => setSelectedMealPlanId(item.id)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Meal plan ${item.name}`}
      accessibilityHint="Tap to select this meal plan"
      className="mt-3"
    >
      {/* Selection indicator */}
      <View style={styles.cardHeader}>
        <View
          style={[styles.radioButton, isSelected && styles.radioButtonSelected]}
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
    </TouchableOpacity>
  );
};

export default MealPlanCard;
