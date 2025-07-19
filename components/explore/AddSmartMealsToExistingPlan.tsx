import { MealPlanService } from '@/service/mealPlan.service';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

interface MealPlanPreferences {
  cuisineTypes: string[];
  maxCookingTime: number;
  budgetRange: 'low' | 'medium' | 'high';
  preferredMealTypes: string[];
  includeLeftovers: boolean;
  varietyMode: boolean;
}

interface GenerateSmartMealsRequest {
  preferences: MealPlanPreferences;
  targetDates: string[];
  mealTypes: string[];
  replaceExisting?: boolean;
  preserveFavorites?: boolean;
}

const AddSmartMealsToExistingPlan: React.FC = () => {
  const router = useRouter();
  const { mealPlanId, mealPlanName } = useLocalSearchParams<{ 
    mealPlanId: string; 
    mealPlanName: string;
  }>();

  // State management
  const [loading, setLoading] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(['Italian', 'Asian']);
  const [cookingTime, setCookingTime] = useState<number>(45);
  const [budgetRange, setBudgetRange] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>(['breakfast', 'lunch', 'dinner']);
  const [includeLeftovers, setIncludeLeftovers] = useState<boolean>(true);
  const [varietyMode, setVarietyMode] = useState<boolean>(true);
  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);
  const [preserveFavorites, setPreserveFavorites] = useState<boolean>(true);
  const [targetDays, setTargetDays] = useState<number>(7);

  // Available options
  const cuisineOptions = [
    'Italian', 'Asian', 'Mexican', 'Mediterranean', 'American',
    'Indian', 'Thai', 'Japanese', 'French', 'Vietnamese'
  ];

  const mealTypeOptions = [
    { key: 'breakfast', label: 'Sáng', icon: 'sunny' },
    { key: 'lunch', label: 'Trưa', icon: 'partly-sunny' },
    { key: 'dinner', label: 'Tối', icon: 'moon' },
    { key: 'snack', label: 'Ăn vặt', icon: 'cafe' }
  ];

  const budgetOptions = [
    { key: 'low', label: 'Tiết kiệm', icon: 'wallet', color: '#22c55e' },
    { key: 'medium', label: 'Trung bình', icon: 'card', color: '#f59e0b' },
    { key: 'high', label: 'Cao cấp', icon: 'diamond', color: '#8b5cf6' }
  ];

  // Generate target dates for the next N days
  const generateTargetDates = (days: number): string[] => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev => 
      prev.includes(cuisine) 
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const toggleMealType = (mealType: string) => {
    setSelectedMealTypes(prev => 
      prev.includes(mealType) 
        ? prev.filter(mt => mt !== mealType)
        : [...prev, mealType]
    );
  };

  const handleAddSmartMeals = async () => {
    if (!mealPlanId) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không tìm thấy thông tin kế hoạch bữa ăn'
      });
      return;
    }

    if (selectedCuisines.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Thiếu thông tin',
        text2: 'Vui lòng chọn ít nhất một loại ẩm thực'
      });
      return;
    }

    if (selectedMealTypes.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Thiếu thông tin',
        text2: 'Vui lòng chọn ít nhất một loại bữa ăn'
      });
      return;
    }

    setLoading(true);

    try {
      const preferences: MealPlanPreferences = {
        cuisineTypes: selectedCuisines,
        maxCookingTime: cookingTime,
        budgetRange,
        preferredMealTypes: selectedMealTypes,
        includeLeftovers,
        varietyMode
      };

      const request: GenerateSmartMealsRequest = {
        preferences,
        targetDates: generateTargetDates(targetDays),
        mealTypes: selectedMealTypes,
        replaceExisting,
        preserveFavorites
      };

      console.log('🤖 Adding smart meals to plan:', {
        mealPlanId,
        request
      });

      const response = await MealPlanService.generateSmartMealsInPlan(
        Number(mealPlanId), 
        request
      );
      
      if (response.data?.isSucceeded) {
        Toast.show({
          type: 'success',
          text1: 'Thành công! 🎉',
          text2: 'Đã thêm các món ăn thông minh vào kế hoạch'
        });

        // Navigate back to tracking screen
        router.back();
      } else {
        console.log({response});
        
        // throw new Error(response.data?.messages?.Error?.[0] || 'Không thể thêm món ăn thông minh');
      }
    } catch (error) {
      console.error('❌ Add smart meals error:', error.messages);
      // console.log({error.message});
      
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể thêm món ăn thông minh. Vui lòng thử lại.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>✨ Thêm món thông minh</Text>
          <Text style={styles.headerSubtitle}>Cho kế hoạch: {mealPlanName}</Text>
        </View>
      </View>

      {/* Generation Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Cài đặt tạo món</Text>
        
        {/* Target Days */}
        <View style={styles.optionGroup}>
          <Text style={styles.optionLabel}>Số ngày thêm món</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderValue}>{targetDays} ngày</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={14}
              value={targetDays}
              onValueChange={setTargetDays}
              step={1}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#E5E5EA"
              thumbStyle={styles.sliderThumb}
            />
          </View>
        </View>

        {/* Replace Existing */}
        <TouchableOpacity 
          style={styles.checkboxOption}
          onPress={() => setReplaceExisting(!replaceExisting)}
        >
          <Ionicons 
            name={replaceExisting ? "checkbox" : "square-outline"} 
            size={24} 
            color={replaceExisting ? "#007AFF" : "#8E8E93"} 
          />
          <View style={styles.checkboxContent}>
            <Text style={styles.checkboxLabel}>Thay thế món hiện có</Text>
            <Text style={styles.checkboxDescription}>
              Ghi đè các món ăn đã có trong những ngày được chọn
            </Text>
          </View>
        </TouchableOpacity>

        {/* Preserve Favorites */}
        <TouchableOpacity 
          style={styles.checkboxOption}
          onPress={() => setPreserveFavorites(!preserveFavorites)}
        >
          <Ionicons 
            name={preserveFavorites ? "checkbox" : "square-outline"} 
            size={24} 
            color={preserveFavorites ? "#007AFF" : "#8E8E93"} 
          />
          <View style={styles.checkboxContent}>
            <Text style={styles.checkboxLabel}>Giữ lại món yêu thích</Text>
            <Text style={styles.checkboxDescription}>
              Không thay thế các món ăn đã được đánh dấu yêu thích
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Cuisine Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🍜 Loại ẩm thực</Text>
        <View style={styles.cuisineGrid}>
          {cuisineOptions.map((cuisine) => (
            <TouchableOpacity
              key={cuisine}
              style={[
                styles.cuisineCard,
                selectedCuisines.includes(cuisine) && styles.cuisineCardSelected
              ]}
              onPress={() => toggleCuisine(cuisine)}
            >
              <Text style={[
                styles.cuisineText,
                selectedCuisines.includes(cuisine) && styles.cuisineTextSelected
              ]}>
                {cuisine}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Meal Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🍽️ Loại bữa ăn</Text>
        <View style={styles.mealTypeGrid}>
          {mealTypeOptions.map((mealType) => (
            <TouchableOpacity
              key={mealType.key}
              style={[
                styles.mealTypeCard,
                selectedMealTypes.includes(mealType.key) && styles.mealTypeCardSelected
              ]}
              onPress={() => toggleMealType(mealType.key)}
            >
              <Ionicons 
                name={mealType.icon as any} 
                size={24} 
                color={selectedMealTypes.includes(mealType.key) ? "#fff" : "#007AFF"} 
              />
              <Text style={[
                styles.mealTypeText,
                selectedMealTypes.includes(mealType.key) && styles.mealTypeTextSelected
              ]}>
                {mealType.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Cooking Time */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏱️ Thời gian nấu ăn</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderValue}>{cookingTime} phút</Text>
          <Slider
            style={styles.slider}
            minimumValue={15}
            maximumValue={120}
            value={cookingTime}
            onValueChange={setCookingTime}
            step={5}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#E5E5EA"
            thumbStyle={styles.sliderThumb}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>15 phút</Text>
            <Text style={styles.sliderLabel}>120 phút</Text>
          </View>
        </View>
      </View>

      {/* Budget Range */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Ngân sách</Text>
        <View style={styles.budgetGrid}>
          {budgetOptions.map((budget) => (
            <TouchableOpacity
              key={budget.key}
              style={[
                styles.budgetCard,
                budgetRange === budget.key && styles.budgetCardSelected,
                { borderColor: budget.color }
              ]}
              onPress={() => setBudgetRange(budget.key as any)}
            >
              <Ionicons 
                name={budget.icon as any} 
                size={20} 
                color={budgetRange === budget.key ? "#fff" : budget.color} 
              />
              <Text style={[
                styles.budgetText,
                budgetRange === budget.key && styles.budgetTextSelected
              ]}>
                {budget.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Advanced Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Tùy chọn nâng cao</Text>
        
        <TouchableOpacity 
          style={styles.checkboxOption}
          onPress={() => setIncludeLeftovers(!includeLeftovers)}
        >
          <Ionicons 
            name={includeLeftovers ? "checkbox" : "square-outline"} 
            size={24} 
            color={includeLeftovers ? "#007AFF" : "#8E8E93"} 
          />
          <View style={styles.checkboxContent}>
            <Text style={styles.checkboxLabel}>Bao gồm thức ăn thừa</Text>
            <Text style={styles.checkboxDescription}>
              Sử dụng thức ăn thừa từ bữa trước để tiết kiệm
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.checkboxOption}
          onPress={() => setVarietyMode(!varietyMode)}
        >
          <Ionicons 
            name={varietyMode ? "checkbox" : "square-outline"} 
            size={24} 
            color={varietyMode ? "#007AFF" : "#8E8E93"} 
          />
          <View style={styles.checkboxContent}>
            <Text style={styles.checkboxLabel}>Chế độ đa dạng</Text>
            <Text style={styles.checkboxDescription}>
              Tăng sự đa dạng trong món ăn, tránh lặp lại
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Generate Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.generateButton, loading && styles.generateButtonDisabled]}
          onPress={handleAddSmartMeals}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="sparkles" size={20} color="#fff" />
          )}
          <Text style={styles.generateButtonText}>
            {loading ? 'Đang thêm món...' : 'Thêm món thông minh'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  optionGroup: {
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#007AFF',
    width: 20,
    height: 20,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkboxContent: {
    flex: 1,
    marginLeft: 12,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  checkboxDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cuisineCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  cuisineCardSelected: {
    backgroundColor: '#007AFF',
  },
  cuisineText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  cuisineTextSelected: {
    color: '#fff',
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealTypeCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  mealTypeCardSelected: {
    backgroundColor: '#007AFF',
  },
  mealTypeText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  mealTypeTextSelected: {
    color: '#fff',
  },
  budgetGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  budgetCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  budgetCardSelected: {
    backgroundColor: '#007AFF',
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  budgetTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddSmartMealsToExistingPlan; 