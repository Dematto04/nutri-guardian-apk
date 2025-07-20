import { MealPlanService } from '@/service/mealPlan.service';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedButton } from './ThemedButton';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface SmartGenerationOptions {
  availableCuisineTypes: string[];
  budgetRangeOptions: string[];
  mealTypeOptions: string[];
  planTypeOptions: string[];
  cookingTimeRange: {
    minCookingTime: number;
    maxCookingTime: number;
    defaultMaxCookingTime: number;
    recommendedTimeRanges: number[];
  };
}

interface MealPlanPreferences {
  cuisineTypes: string[];
  maxCookingTime: number;
  budgetRange: 'low' | 'medium' | 'high';
  preferredMealTypes: string[];
  includeLeftovers: boolean;
  varietyMode: boolean;
}

interface SmartMealPlanGeneratorProps {
  onGenerated: (mealPlan: any) => void;
  onCancel: () => void;
}

export function SmartMealPlanGenerator({ onGenerated, onCancel }: SmartMealPlanGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [options, setOptions] = useState<SmartGenerationOptions | null>(null);
  
  // Form state
  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [planType, setPlanType] = useState<'Personal' | 'Family' | 'Weekly' | 'Monthly'>('Weekly');
  
  // Preferences state
  const [preferences, setPreferences] = useState<MealPlanPreferences>({
    cuisineTypes: [],
    maxCookingTime: 45,
    budgetRange: 'medium',
    preferredMealTypes: ['breakfast', 'lunch', 'dinner'],
    includeLeftovers: true,
    varietyMode: true,
  });

  useEffect(() => {
    loadGenerationOptions();
  }, []);

  const loadGenerationOptions = async () => {
    try {
      setOptionsLoading(true);
      const response = await MealPlanService.getSmartGenerationOptions();
      console.log({
        response
      });
      
      
      if (response.data?.isSucceeded) {
        setOptions(response.data.data);
        
        // Set default preferences based on available options
        if (response.data.data.availableCuisineTypes?.length > 0) {
          setPreferences(prev => ({
            ...prev,
            cuisineTypes: response.data.data.availableCuisineTypes.slice(0, 2), // Default to first 2 cuisines
            maxCookingTime: response.data.data.cookingTimeRange?.defaultMaxCookingTime || 45,
          }));
        }
      }
    } catch (error) {
      console.error('Error loading generation options:', error);
      Alert.alert('Lỗi', 'Không thể tải tùy chọn tạo kế hoạch');
    } finally {
      setOptionsLoading(false);
    }
  };

  const toggleCuisineType = (cuisine: string) => {
    setPreferences(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter(c => c !== cuisine)
        : [...prev.cuisineTypes, cuisine]
    }));
  };

  const toggleMealType = (mealType: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredMealTypes: prev.preferredMealTypes.includes(mealType)
        ? prev.preferredMealTypes.filter(m => m !== mealType)
        : [...prev.preferredMealTypes, mealType]
    }));
  };

  const handleQuickGenerate = async () => {
    if (!planName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên kế hoạch');
      return;
    }

    if (preferences.cuisineTypes.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một loại ẩm thực');
      return;
    }

    if (preferences.preferredMealTypes.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một loại bữa ăn');
      return;
    }

    try {
      setLoading(true);
      
      const smartMealPlanRequest = {
        name: planName,
        startDate,
        endDate,
        planType,
        preferences,
      };

      const response = await MealPlanService.generateSmartMealPlan(smartMealPlanRequest);
      
      if (response.data?.isSucceeded) {
        onGenerated(response.data.data);
      } else {
        Alert.alert(
          'Lỗi tạo kế hoạch',
          response.data?.messages?.Error || 'Không thể tạo kế hoạch bữa ăn thông minh'
        );
      }
    } catch (error: any) {
      console.error('Error generating smart meal plan:', error);
      Alert.alert(
        'Lỗi',
        error.message || 'Đã xảy ra lỗi khi tạo kế hoạch bữa ăn'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickWeekGenerate = async () => {
    try {
      setLoading(true);
      const response = await MealPlanService.quickGenerateWeeklyPlan(
        planName || 'Kế hoạch tuần này',
        preferences.cuisineTypes.length > 0 ? preferences.cuisineTypes : ['Italian', 'Asian'],
        preferences.maxCookingTime
      );
      
      if (response.data?.isSucceeded) {
        onGenerated(response.data.data);
      } else {
        Alert.alert('Lỗi', 'Không thể tạo kế hoạch tuần nhanh');
      }
    } catch (error) {
      console.error('Error quick generating weekly plan:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tạo kế hoạch tuần');
    } finally {
      setLoading(false);
    }
  };

  if (optionsLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Đang tải tùy chọn...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            🎯 Tạo Kế Hoạch Thông Minh
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            AI sẽ tự động tạo kế hoạch bữa ăn phù hợp với sở thích của bạn
          </ThemedText>
        </View>

        {/* Quick Actions
        <View style={styles.quickActions}>
          <ThemedButton
            title="🚀 Tạo Tuần Nhanh"
            onPress={handleQuickWeekGenerate}
            style={styles.quickButton}
            disabled={loading}
          />
        </View> */}

        {/* Basic Info */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>📝 Thông tin cơ bản</ThemedText>
          
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Tên kế hoạch</ThemedText>
            <TextInput
              style={styles.textInput}
              value={planName}
              onChangeText={setPlanName}
              placeholder="VD: Kế hoạch tuần này"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.dateInputGroup}>
              <ThemedText style={styles.label}>Từ ngày</ThemedText>
              <Text style={styles.dateText}>{startDate}</Text>
            </View>
            <View style={styles.dateInputGroup}>
              <ThemedText style={styles.label}>Đến ngày</ThemedText>
              <Text style={styles.dateText}>{endDate}</Text>
            </View>
          </View>
        </View>

        {/* Cuisine Preferences */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🍽️ Sở thích ẩm thực</ThemedText>
          <View style={styles.cuisineGrid}>
            {options?.availableCuisineTypes?.map((cuisine) => (
              <TouchableOpacity
                key={cuisine}
                style={[
                  styles.cuisineChip,
                  preferences.cuisineTypes.includes(cuisine) && styles.cuisineChipSelected
                ]}
                onPress={() => toggleCuisineType(cuisine)}
              >
                <Text style={[
                  styles.cuisineChipText,
                  preferences.cuisineTypes.includes(cuisine) && styles.cuisineChipTextSelected
                ]}>
                  {cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cooking Time */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>⏱️ Thời gian nấu ăn</ThemedText>
          <View style={styles.sliderContainer}>
            <ThemedText style={styles.sliderLabel}>
              Tối đa {preferences.maxCookingTime} phút
            </ThemedText>
            <Slider
              style={styles.slider}
              minimumValue={options?.cookingTimeRange?.minCookingTime || 5}
              maximumValue={options?.cookingTimeRange?.maxCookingTime || 180}
              value={preferences.maxCookingTime}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, maxCookingTime: Math.round(value) }))}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#E0E0E0"
            />
            <View style={styles.timeRangeLabels}>
              <Text style={styles.timeLabel}>5 phút</Text>
              <Text style={styles.timeLabel}>3 giờ</Text>
            </View>
          </View>
        </View>

        {/* Budget Range */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>💰 Mức chi tiêu</ThemedText>
          <View style={styles.budgetOptions}>
            {options?.budgetRangeOptions?.map((budget) => (
              <TouchableOpacity
                key={budget}
                style={[
                  styles.budgetOption,
                  preferences.budgetRange === budget && styles.budgetOptionSelected
                ]}
                onPress={() => setPreferences(prev => ({ ...prev, budgetRange: budget as any }))}
              >
                <Ionicons
                  name={preferences.budgetRange === budget ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={preferences.budgetRange === budget ? '#007AFF' : '#999'}
                />
                <Text style={[
                  styles.budgetOptionText,
                  preferences.budgetRange === budget && styles.budgetOptionTextSelected
                ]}>
                  {budget === 'low' ? 'Tiết kiệm' : budget === 'medium' ? 'Trung bình' : 'Cao cấp'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Meal Types */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🍽️ Loại bữa ăn</ThemedText>
          <View style={styles.mealTypeGrid}>
            {options?.mealTypeOptions?.map((mealType) => (
              <TouchableOpacity
                key={mealType}
                style={[
                  styles.mealTypeChip,
                  preferences.preferredMealTypes.includes(mealType) && styles.mealTypeChipSelected
                ]}
                onPress={() => toggleMealType(mealType)}
              >
                <Text style={[
                  styles.mealTypeChipText,
                  preferences.preferredMealTypes.includes(mealType) && styles.mealTypeChipTextSelected
                ]}>
                  {mealType === 'Bữa sáng' ? '🌅 Sáng' :
                   mealType === 'Bữa trưa' ? '☀️ Trưa' :
                   mealType === 'Bữa tối' ? '🌙 Tối' : '🍿 Snack'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Advanced Options */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>⚙️ Tùy chọn nâng cao</ThemedText>
          
          <TouchableOpacity
            style={styles.toggleOption}
            onPress={() => setPreferences(prev => ({ ...prev, includeLeftovers: !prev.includeLeftovers }))}
          >
            <View style={styles.toggleOptionContent}>
              <Ionicons
                name={preferences.includeLeftovers ? 'checkbox' : 'square-outline'}
                size={20}
                color={preferences.includeLeftovers ? '#007AFF' : '#999'}
              />
              <View style={styles.toggleOptionText}>
                <ThemedText style={styles.toggleOptionTitle}>Bao gồm thức ăn thừa</ThemedText>
                <ThemedText style={styles.toggleOptionSubtitle}>Tái sử dụng thức ăn để giảm lãng phí</ThemedText>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleOption}
            onPress={() => setPreferences(prev => ({ ...prev, varietyMode: !prev.varietyMode }))}
          >
            <View style={styles.toggleOptionContent}>
              <Ionicons
                name={preferences.varietyMode ? 'checkbox' : 'square-outline'}
                size={20}
                color={preferences.varietyMode ? '#007AFF' : '#999'}
              />
              <View style={styles.toggleOptionText}>
                <ThemedText style={styles.toggleOptionTitle}>Chế độ đa dạng</ThemedText>
                <ThemedText style={styles.toggleOptionSubtitle}>Tạo nhiều món khác nhau</ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <ThemedButton
            title={loading ? "Đang tạo..." : "🎯 Tạo Kế Hoạch Thông Minh"}
            onPress={handleQuickGenerate}
            style={styles.generateButton}
            disabled={loading}
          />
          
          <ThemedButton
            title="Hủy"
            onPress={onCancel}
            variant="secondary"
            style={styles.cancelButton}
            disabled={loading}
          />
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <ThemedText style={styles.generatingText}>
              AI đang tạo kế hoạch bữa ăn tối ưu cho bạn...
            </ThemedText>
          </View>
        )}
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
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActions: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 1,
  },
  quickButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputGroup: {
    flex: 1,
  },
  dateText: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    textAlign: 'center',
  },
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cuisineChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cuisineChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  cuisineChipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  cuisineChipTextSelected: {
    color: 'white',
  },
  sliderContainer: {
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    color: '#007AFF',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#007AFF',
  },
  timeRangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
  },
  budgetOptions: {
    gap: 12,
  },
  budgetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  budgetOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  budgetOptionText: {
    fontSize: 16,
    color: '#333',
  },
  budgetOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealTypeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 80,
    alignItems: 'center',
  },
  mealTypeChipSelected: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  mealTypeChipText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  mealTypeChipTextSelected: {
    color: 'white',
  },
  toggleOption: {
    marginBottom: 12,
  },
  toggleOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleOptionText: {
    flex: 1,
  },
  toggleOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  toggleOptionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    padding: 20,
    gap: 12,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  generatingText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
}); 