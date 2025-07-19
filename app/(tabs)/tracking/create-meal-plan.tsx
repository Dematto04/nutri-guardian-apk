import { Colors } from "@/constants/Colors";
import { MealPlanService } from "@/service/mealPlan.service";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ScrollView } from "@gluestack-ui/themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";

import { SmartMealPlanGenerator } from "@/components/SmartMealPlanGenerator";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { useSubscription } from "@/hooks/useSubscription";
import React, { useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";

type MealPlanCreateRequest = {
  name: string;
  startDate: string;
  endDate: string;
  planType: 'Personal' | 'Family' | 'Weekly' | 'Monthly';
  notes: string;
}

export default function CreateMealPlanScreen() {
  // Animation refs
  const buttonScale = useRef(new Animated.Value(1)).current;
  const router = useRouter()
  
  // Subscription hook
  const { hasActiveSubscription } = useSubscription();
  
  // Mode selection
  const [creationMode, setCreationMode] = useState<'select' | 'manual' | 'smart'>('select');
  
  // Form state
  const [formData, setFormData] = useState<MealPlanCreateRequest>({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0], // Default to 1 week plan
    planType: 'Weekly',
    notes: ''
  });

  // UI state
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Hàm validate form cho manual mode
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên kế hoạch';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
    } else if (formData.endDate < formData.startDate) {
      newErrors.endDate = 'Ngày kết thúc không được trước ngày bắt đầu';
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
    setCreationMode('select');
  };

  // Xử lý submit form manual
  const handleManualSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log({formData});
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
      console.error('Create meal plan error:', error);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Mode Selection Screen
  if (creationMode === 'select') {
    return (
      <SubscriptionGate featureName="meal-planning">
        <View style={styles.container}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Tạo Kế Hoạch Bữa Ăn</Text>
              <Text style={styles.subtitle}>
                Chọn cách bạn muốn tạo kế hoạch bữa ăn
              </Text>
            </View>

            {/* Smart Generation Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setCreationMode('smart')}
              activeOpacity={0.7}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="sparkles" size={32} color="#007AFF" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>🎯 Tạo Thông Minh</Text>
                <Text style={styles.optionDescription}>
                  AI sẽ tự động tạo kế hoạch bữa ăn phù hợp với sở thích và nhu cầu của bạn
                </Text>
                <View style={styles.optionFeatures}>
                  <Text style={styles.featureItem}>• Chọn theo ẩm thực yêu thích</Text>
                  <Text style={styles.featureItem}>• Điều chỉnh thời gian nấu ăn</Text>
                  <Text style={styles.featureItem}>• Tự động tính toán dinh dưỡng</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#007AFF" />
            </TouchableOpacity>

            {/* Manual Creation Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setCreationMode('manual')}
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
                  <Text style={styles.featureItem}>• Thêm món theo ý thích</Text>
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
                <Text style={[styles.optionTitle, styles.disabledText]}>📋 Mẫu Có Sẵn</Text>
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
  if (creationMode === 'smart') {
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
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.container} onPress={Keyboard.dismiss}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header with back button */}
            <View style={styles.manualHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCreationMode('select')}
              >
                <Ionicons name="chevron-back" size={24} color="#007AFF" />
                <Text style={styles.backButtonText}>Quay lại</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Tạo Kế Hoạch Thủ Công</Text>
            </View>

            {/* Rest of manual form... */}
            <View style={styles.formContainer}>
              {/* Form fields remain the same as before */}
              <View style={[styles.inputContainer, focusedInput === 'name' && styles.inputFocused]}>
                <Text style={styles.label}>
                  <MaterialIcons name="edit" size={16} color={Colors.light.tint} />
                  {' '}Tên kế hoạch
                </Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData(prev => ({...prev, name: text}));
                    if (errors.name) setErrors(prev => ({...prev, name: ''}));
                  }}
                  placeholder="VD: Kế hoạch giảm cân tuần này"
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Plan Type Selector */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  <MaterialIcons name="category" size={16} color={Colors.light.tint} />
                  {' '}Loại kế hoạch
                </Text>
                <View style={styles.planTypeContainer}>
                  {(['Personal', 'Family', 'Weekly', 'Monthly'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.planTypeOption,
                        formData.planType === type && styles.planTypeSelected
                      ]}
                      onPress={() => setFormData(prev => ({...prev, planType: type}))}
                    >
                      <Text style={[
                        styles.planTypeText,
                        formData.planType === type && styles.planTypeTextSelected
                      ]}>
                        {type === 'Personal' ? 'Cá nhân' :
                         type === 'Family' ? 'Gia đình' :
                         type === 'Weekly' ? 'Tuần' : 'Tháng'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date inputs remain the same... */}
              <View style={styles.dateRow}>
                <View style={[styles.dateContainer, focusedInput === 'startDate' && styles.inputFocused]}>
                  <Text style={styles.label}>
                    <AntDesign name="calendar" size={16} color={Colors.light.tint} />
                    {' '}Ngày bắt đầu
                  </Text>
                  <TouchableOpacity 
                    style={[styles.dateInput, errors.startDate && styles.inputError]}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {formatDisplayDate(formData.startDate)}
                    </Text>
                    <AntDesign name="calendar" size={20} color={Colors.light.tint} />
                  </TouchableOpacity>
                  {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
                </View>

                <View style={[styles.dateContainer, focusedInput === 'endDate' && styles.inputFocused]}>
                  <Text style={styles.label}>
                    <AntDesign name="calendar" size={16} color={Colors.light.tint} />
                    {' '}Ngày kết thúc
                  </Text>
                  <TouchableOpacity 
                    style={[styles.dateInput, errors.endDate && styles.inputError]}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {formatDisplayDate(formData.endDate)}
                    </Text>
                    <AntDesign name="calendar" size={20} color={Colors.light.tint} />
                  </TouchableOpacity>
                  {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
                </View>
              </View>

              <View style={[styles.inputContainer, focusedInput === 'notes' && styles.inputFocused]}>
                <Text style={styles.label}>
                  <MaterialIcons name="notes" size={16} color={Colors.light.tint} />
                  {' '}Ghi chú (tùy chọn)
                </Text>
                <TextInput
                  style={[styles.textArea]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData(prev => ({...prev, notes: text}))}
                  placeholder="Thêm ghi chú về kế hoạch của bạn..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  onFocus={() => setFocusedInput('notes')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Date Pickers */}
            {showStartDatePicker && (
              <DateTimePicker
                value={new Date(formData.startDate)}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(false);
                  if (selectedDate) {
                    setFormData(prev => ({
                      ...prev, 
                      startDate: selectedDate.toISOString().split('T')[0]
                    }));
                    if (errors.startDate) setErrors(prev => ({...prev, startDate: ''}));
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
                    setFormData(prev => ({
                      ...prev, 
                      endDate: selectedDate.toISOString().split('T')[0]
                    }));
                    if (errors.endDate) setErrors(prev => ({...prev, endDate: ''}));
                  }
                }}
              />
            )}
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Animated.View style={[{transform: [{scale: buttonScale}]}]}>
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={() => {
                  animateButton();
                  handleManualSubmit();
                }}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? '🔄 Đang tạo...' : '✨ Tạo kế hoạch'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </SubscriptionGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 0,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  optionFeatures: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  disabledCard: {
    opacity: 0.7,
  },
  disabledText: {
    color: '#999',
  },
  comingSoon: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  manualHeader: {
    padding: 24,
    paddingBottom: 0,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    marginLeft: 8,
    color: '#007AFF',
    fontSize: 16,
  },
  formContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#334155',
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 120,
    textAlignVertical: 'top',
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dateInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dateText: {
    fontSize: 16,
    color: '#334155',
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#93c5fd',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
    backgroundColor: Colors.primary,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    
  },
  inputFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  calendarIcon: {
    marginLeft: 8,
    color: '#64748b',
  },
  inputLabel: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    top: -10,
    left: 12,
    zIndex: 1,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  planTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  planTypeOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  planTypeSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  planTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  planTypeTextSelected: {
    color: 'white',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dateContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 0,
  },
});
