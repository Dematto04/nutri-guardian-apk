import { Colors } from "@/constants/Colors";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ScrollView } from "@gluestack-ui/themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";

import { SmartMealPlanGenerator } from "@/components/SmartMealPlanGenerator";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { useSubscription } from "@/hooks/useSubscription";
import { MealPlanService } from "@/service/mealPlan.service";
import React, { useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type MealPlanCreateRequest = {
  name: string;
  startDate: string;
  endDate: string;
  planType: "Personal" | "Family" | "Weekly" | "Monthly";
  notes: string;
};

export default function CreateMealPlanScreen() {
  // Animation refs
  const buttonScale = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  // Subscription hook
  const { hasActiveSubscription } = useSubscription();

  // Mode selection
  const [creationMode, setCreationMode] = useState<
    "select" | "manual" | "smart"
  >("select");

  // Form state
  const [formData, setFormData] = useState<MealPlanCreateRequest>({
    name: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 7))
      .toISOString()
      .split("T")[0], // Default to 1 week plan
    planType: "Weekly",
    notes: "",
  });

  // UI state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Hàm validate form cho manual mode
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên kế hoạch";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Vui lòng chọn ngày kết thúc";
    } else if (formData.endDate < formData.startDate) {
      newErrors.endDate = "Ngày kết thúc không được trước ngày bắt đầu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle smart meal plan generation success
  const handleSmartGenerationSuccess = (mealPlan: any) => {
    Toast.show({
      type: "success",
      text1: "Tạo kế hoạch thành công! 🎉",
      text2: `${mealPlan.name} với ${mealPlan.totalMeals} bữa ăn`,
    });

    // Navigate back to tracking with the new meal plan
    router.back();
  };

  // Handle smart generation cancel
  const handleSmartGenerationCancel = () => {
    setCreationMode("select");
  };

  // Xử lý submit form manual
  const handleManualSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log({ formData });
      const response = await MealPlanService.createMealPlan(formData);

      if (response.data?.isSucceeded) {
        Toast.show({
          type: "success",
          text1: "Tạo kế hoạch thành công!",
          text2: "Bạn có thể bắt đầu thêm món ăn vào kế hoạch",
        });

        // Navigate back to tracking
        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi tạo kế hoạch",
          text2: response.data?.message || "Không thể tạo kế hoạch bữa ăn",
        });
      }
    } catch (error: any) {
      console.error("Create meal plan error:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error.message || "Đã xảy ra lỗi khi tạo kế hoạch",
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation cho button
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Mode Selection Screen
  if (creationMode === "select") {
    return (
      <SubscriptionGate featureName="meal-planning">
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.subtitle}>
                Chọn cách bạn muốn tạo kế hoạch bữa ăn
              </Text>
            </View>

            {/* Smart Generation Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setCreationMode("smart")}
              activeOpacity={0.7}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="sparkles" size={32} color="#007AFF" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>🎯 Tạo Thông Minh</Text>
                <Text style={styles.optionDescription}>
                  AI sẽ tự động tạo kế hoạch bữa ăn phù hợp với sở thích và nhu
                  cầu của bạn
                </Text>
                <View style={styles.optionFeatures}>
                  <Text style={styles.featureItem}>
                    • Chọn theo ẩm thực yêu thích
                  </Text>
                  <Text style={styles.featureItem}>
                    • Điều chỉnh thời gian nấu ăn
                  </Text>
                  <Text style={styles.featureItem}>
                    • Tự động tính toán dinh dưỡng
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#007AFF" />
            </TouchableOpacity>

            {/* Manual Creation Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setCreationMode("manual")}
              activeOpacity={0.7}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="create" size={32} color="#FF9500" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>📝 Tạo Thủ Công</Text>
                <Text style={styles.optionDescription}>
                  Tự tạo kế hoạch trống và thêm từng món ăn theo ý muốn
                </Text>
                <View style={styles.optionFeatures}>
                  <Text style={styles.featureItem}>• Kiểm soát hoàn toàn</Text>
                  <Text style={styles.featureItem}>
                    • Thêm món theo ý thích
                  </Text>
                  <Text style={styles.featureItem}>• Tùy chỉnh linh hoạt</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF9500" />
            </TouchableOpacity>

            {/* Quick Templates (Future feature) */}
            <TouchableOpacity
              style={[styles.optionCard, styles.disabledCard]}
              disabled={true}
              activeOpacity={0.7}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="albums" size={32} color="#999" />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, styles.disabledText]}>
                  📋 Mẫu Có Sẵn
                </Text>
                <Text style={[styles.optionDescription, styles.disabledText]}>
                  Chọn từ các mẫu kế hoạch được thiết kế sẵn
                </Text>
                <Text style={styles.comingSoon}>Sắp ra mắt</Text>
              </View>
              <Ionicons name="lock-closed" size={20} color="#999" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SubscriptionGate>
    );
  }

  // Smart Generation Mode
  if (creationMode === "smart") {
    return (
      <SubscriptionGate featureName="smart-meal-planning">
        <SmartMealPlanGenerator
          onGenerated={handleSmartGenerationSuccess}
          onCancel={handleSmartGenerationCancel}
        />
      </SubscriptionGate>
    );
  }

  // Manual Creation Mode
  return (
    <SubscriptionGate featureName="meal-planning">
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <View style={[styles.inputContainer]}>
              <Text style={styles.label}>
                <MaterialIcons name="edit" size={16} color={Colors.primary} />{" "}
                Tên kế hoạch
              </Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, name: text }));
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="VD: Kế hoạch giảm cân tuần này"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
                returnKeyType="next"
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                <MaterialIcons
                  name="category"
                  size={16}
                  color={Colors.primary}
                />{" "}
                Loại kế hoạch
              </Text>
              <View style={styles.planTypeContainer}>
                {(["Personal", "Family", "Weekly", "Monthly"] as const).map(
                  (type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.planTypeOption,
                        formData.planType === type && styles.planTypeSelected,
                      ]}
                      onPress={() =>
                        setFormData((prev) => ({ ...prev, planType: type }))
                      }
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.planTypeText,
                          formData.planType === type &&
                            styles.planTypeTextSelected,
                        ]}
                      >
                        {type === "Personal"
                          ? "Cá nhân"
                          : type === "Family"
                          ? "Gia đình"
                          : type === "Weekly"
                          ? "Tuần"
                          : "Tháng"}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            <View style={styles.dateRow}>
              <View
                style={[
                  styles.dateContainer,
                  focusedInput === "startDate" && styles.inputFocused,
                ]}
              >
                <Text style={styles.label}>
                  <AntDesign name="calendar" size={16} color={Colors.primary} />{" "}
                  Ngày bắt đầu
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dateInput,
                    errors.startDate && styles.inputError,
                  ]}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {formatDisplayDate(formData.startDate)}
                  </Text>
                  <AntDesign name="calendar" size={20} color={Colors.primary} />
                </TouchableOpacity>
                {errors.startDate && (
                  <Text style={styles.errorText}>{errors.startDate}</Text>
                )}
              </View>

              <View
                style={[
                  styles.dateContainer,
                  focusedInput === "endDate" && styles.inputFocused,
                ]}
              >
                <Text style={styles.label}>
                  <AntDesign name="calendar" size={16} color={Colors.primary} />{" "}
                  Ngày kết thúc
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dateInput,
                    errors.endDate && styles.inputError,
                  ]}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {formatDisplayDate(formData.endDate)}
                  </Text>
                  <AntDesign name="calendar" size={20} color={Colors.primary} />
                </TouchableOpacity>
                {errors.endDate && (
                  <Text style={styles.errorText}>{errors.endDate}</Text>
                )}
              </View>
            </View>

            <View style={[styles.inputContainer]}>
              <Text style={styles.label}>
                <MaterialIcons name="notes" size={16} color={Colors.primary} />{" "}
                Ghi chú (tùy chọn)
              </Text>
              <TextInput
                style={[styles.textArea, errors.notes && styles.inputError]}
                value={formData.notes}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, notes: text }))
                }
                placeholder="Thêm ghi chú về kế hoạch của bạn..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {showStartDatePicker && (
            <DateTimePicker
              value={new Date(formData.startDate)}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(false);
                if (selectedDate) {
                  setFormData((prev) => ({
                    ...prev,
                    startDate: selectedDate.toISOString().split("T")[0],
                  }));
                  if (errors.startDate)
                    setErrors((prev) => ({ ...prev, startDate: "" }));
                }
              }}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={new Date(formData.endDate)}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndDatePicker(false);
                if (selectedDate) {
                  setFormData((prev) => ({
                    ...prev,
                    endDate: selectedDate.toISOString().split("T")[0],
                  }));
                  if (errors.endDate)
                    setErrors((prev) => ({ ...prev, endDate: "" }));
                }
              }}
            />
          )}

          <View style={styles.buttonContainer}>
            <Animated.View style={[{ transform: [{ scale: buttonScale }] }]}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                ]}
                onPress={() => {
                  animateButton();
                  handleManualSubmit();
                }}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "🔄 Đang tạo..." : "✨ Tạo kế hoạch"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SubscriptionGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    width: "100%",
    alignSelf: "stretch",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
    width: "100%",
    alignSelf: "stretch",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 0,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
    width: "100%",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
    width: "100%",
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    width: "100%",
    alignSelf: "stretch",
  },
  inputContainer: {
    marginBottom: 24,
    width: "100%",
    alignSelf: "stretch",
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
    color: "#374151",
    fontWeight: "600",
    letterSpacing: 0.15,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    color: "#374151",
    minHeight: 56,
    width: "100%",
    alignSelf: "stretch",
  },
  textArea: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    color: "#374151",
    minHeight: 120,
    maxHeight: 160,
    width: "100%",
    alignSelf: "stretch",
    textAlignVertical: "top",
  },
  inputFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
  },
  inputError: {
    borderColor: "#ef4444",
    borderWidth: 2,
    shadowColor: "#ef4444",
    shadowOpacity: 0.1,
  },
  errorText: {
    color: "#ef4444",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    paddingLeft: 4,
    width: "100%",
  },
  planTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 12,
    width: "100%",
  },
  planTypeOption: {
    flex: 1,
    minWidth: "45%",
    maxWidth: "48%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  planTypeSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
  },
  planTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  planTypeTextSelected: {
    color: "#ffffff",
  },
  dateRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
    width: "100%",
    alignSelf: "stretch",
  },
  dateContainer: {
    flex: 1,
    width: "100%",
  },
  dateInput: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 56,
    width: "100%",
    alignSelf: "stretch",
  },
  dateText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 32,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    width: "100%",
    alignSelf: "stretch",
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 56,
    width: "100%",
    alignSelf: "stretch",
  },
  submitButtonDisabled: {
    opacity: 0.6,
    backgroundColor: "#9ca3af",
    shadowColor: "#9ca3af",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    width: "94%",
    alignSelf: "stretch",
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 6,
    lineHeight: 24,
  },
  optionDescription: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 12,
    lineHeight: 22,
  },
  optionFeatures: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
    lineHeight: 20,
  },
  disabledCard: {
    opacity: 0.6,
  },
  disabledText: {
    color: "#9ca3af",
  },
  comingSoon: {
    fontSize: 12,
    color: "#f59e0b",
    marginTop: 8,
    fontWeight: "600",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
});
