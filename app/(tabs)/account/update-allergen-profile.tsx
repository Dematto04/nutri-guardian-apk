import { UpdateAllergenProfileDto } from "@/dtos/userAllergy/updateAllergenProfile.dto";
import { AllergenService } from "@/service/allergen.service";
import { UserAllergyService } from "@/service/userAllergy.service";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Allergen {
  id: number;
  name: string;
  category: string;
  scientificName: string;
  description: string;
  isFdaMajor: boolean;
  isEuMajor: boolean;
}

interface UserAllergy {
  id: number;
  userId: number;
  allergenId: number;
  severity: string;
  diagnosisDate: string;
  diagnosedBy: string;
  lastReactionDate: string;
  avoidanceNotes: string;
  outgrown: boolean;
  outgrownDate: string | null;
  needsVerification: boolean;
  allergen: Allergen;
}

const severityOptions = [
  { value: "mild", label: "Nhẹ", color: "#4CAF50" },
  { value: "moderate", label: "Trung bình", color: "#FF9800" },
  { value: "severe", label: "Nặng", color: "#F44336" },
  { value: "critical", label: "Rất nặng", color: "#D32F2F" },
];

export default function UpdateAllergenProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentAllergenId = params.currentAllergenId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentAllergy, setCurrentAllergy] = useState<UserAllergy | null>(null);
  const [availableAllergens, setAvailableAllergens] = useState<Allergen[]>([]);
  
  // Form state
  const [newAllergenId, setNewAllergenId] = useState<number>(0);
  const [severity, setSeverity] = useState("");
  const [diagnosisDate, setDiagnosisDate] = useState("");
  const [diagnosedBy, setDiagnosedBy] = useState("");
  const [lastReactionDate, setLastReactionDate] = useState("");
  const [avoidanceNotes, setAvoidanceNotes] = useState("");
  const [outgrown, setOutgrown] = useState(false);
  const [outgrownDate, setOutgrownDate] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  // Date picker states
  const [showDiagnosisDatePicker, setShowDiagnosisDatePicker] = useState(false);
  const [showReactionDatePicker, setShowReactionDatePicker] = useState(false);
  const [showOutgrownDatePicker, setShowOutgrownDatePicker] = useState(false);
  const [diagnosisDateObj, setDiagnosisDateObj] = useState<Date>(new Date());
  const [reactionDateObj, setReactionDateObj] = useState<Date>(new Date());
  const [outgrownDateObj, setOutgrownDateObj] = useState<Date>(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch current allergy data and available allergens
      const [allergyResponse, allergensResponse] = await Promise.all([
        UserAllergyService.getUserAllergyProfile(),
        AllergenService.getAllAllergen(),
      ]);

      console.log("=== FETCH DATA DEBUG ===");
      console.log("Current Allergen ID from params:", currentAllergenId);
      console.log("Allergy response success:", allergyResponse.data?.isSucceeded);
      console.log("Allergens response success:", (allergensResponse as any).data?.isSucceeded);

      if (allergyResponse.data?.isSucceeded && (allergensResponse as any).data?.isSucceeded) {
        const profileData = allergyResponse.data.data;
        
        // Find current allergy by allergen ID (not user allergy ID)
        const foundAllergy = profileData.allergies.find(
          (a: UserAllergy) => a.allergen.id.toString() === currentAllergenId
        );
        
        console.log("Found allergy:", foundAllergy);
        
        if (foundAllergy) {
          setCurrentAllergy(foundAllergy);
          // Populate form with current data
          setNewAllergenId(foundAllergy.allergen.id); // Start with current allergen
          setSeverity(foundAllergy.severity);
          setDiagnosisDate(formatDateForDisplay(foundAllergy.diagnosisDate));
          setDiagnosedBy(foundAllergy.diagnosedBy);
          setLastReactionDate(formatDateForDisplay(foundAllergy.lastReactionDate));
          setAvoidanceNotes(foundAllergy.avoidanceNotes);
          setOutgrown(foundAllergy.outgrown);
          setOutgrownDate(foundAllergy.outgrownDate ? formatDateForDisplay(foundAllergy.outgrownDate) : "");
          setNeedsVerification(foundAllergy.needsVerification);
          
          // Set date objects for pickers
          setDiagnosisDateObj(parseDateFromString(foundAllergy.diagnosisDate));
          setReactionDateObj(parseDateFromString(foundAllergy.lastReactionDate));
          setOutgrownDateObj(foundAllergy.outgrownDate ? parseDateFromString(foundAllergy.outgrownDate) : new Date());
        }
        
        setAvailableAllergens((allergensResponse as any).data.data);
        
        console.log("Available allergens count:", (allergensResponse as any).data.data.length);
      } else {
        Alert.alert("Lỗi", "Không thể tải thông tin dị ứng");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải dữ liệu");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString || dateString === "0001-01-01T00:00:00" || dateString === "0001-01-01") return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return "";
    }
  };

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateFromString = (dateString: string): Date => {
    if (!dateString || dateString === "0001-01-01T00:00:00" || dateString === "0001-01-01") return new Date();
    return new Date(dateString);
  };

  const validateForm = () => {
    if (!newAllergenId) {
      Alert.alert("Lỗi", "Vui lòng chọn chất gây dị ứng");
      return false;
    }
    
    if (!severity) {
      Alert.alert("Lỗi", "Vui lòng chọn mức độ nghiêm trọng");
      return false;
    }
    
    if (!diagnosisDate) {
      Alert.alert("Lỗi", "Vui lòng chọn ngày chẩn đoán");
      return false;
    }
    
    if (!diagnosedBy.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập người chẩn đoán");
      return false;
    }
    
    return true;
  };

  const handleDiagnosisDateChange = (event: any, selectedDate?: Date) => {
    setShowDiagnosisDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDiagnosisDateObj(selectedDate);
      setDiagnosisDate(formatDateForDisplay(selectedDate.toISOString()));
    }
  };

  const handleReactionDateChange = (event: any, selectedDate?: Date) => {
    setShowReactionDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setReactionDateObj(selectedDate);
      setLastReactionDate(formatDateForDisplay(selectedDate.toISOString()));
    }
  };

  const handleOutgrownDateChange = (event: any, selectedDate?: Date) => {
    setShowOutgrownDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setOutgrownDateObj(selectedDate);
      setOutgrownDate(formatDateForDisplay(selectedDate.toISOString()));
    }
  };

  const handleSave = async () => {
    if (!validateForm() || !currentAllergy) return;

    try {
      setSaving(true);
      
      const updateData: UpdateAllergenProfileDto = {
        newAllergenId: newAllergenId,
        severity,
        diagnosisDate: formatDateForAPI(diagnosisDateObj),
        diagnosedBy,
        lastReactionDate: lastReactionDate ? formatDateForAPI(reactionDateObj) : "0001-01-01",
        avoidanceNotes,
        outgrown,
        outgrownDate: outgrown && outgrownDate ? formatDateForAPI(outgrownDateObj) : "0001-01-01",
        needsVerification,
      };

      console.log("=== UPDATE ALLERGEN PROFILE DEBUG ===");
      console.log("Current Allergen ID (URL param):", currentAllergenId);
      console.log("Update data:", updateData);
      console.log("API call: PATCH /userallergy/profile/" + currentAllergenId + "/change");
      
      const response = await UserAllergyService.updateAllergenProfile(
        parseInt(currentAllergenId), 
        updateData
      );
      
      console.log("Response:", response.data);
      
      if (response.data?.isSucceeded) {
        Alert.alert(
          "Thành công",
          "Thông tin dị ứng đã được cập nhật thành công!",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        throw new Error(response.data?.message || 'Cập nhật thất bại');
      }
    } catch (error: any) {
      console.error("Error updating allergen profile:", error);
      
      let errorMessage = 'Đã xảy ra lỗi khi cập nhật thông tin dị ứng';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7DE1EF" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!currentAllergy) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#F44336" />
        <Text style={styles.errorTitle}>Không tìm thấy thông tin</Text>
        <Text style={styles.errorSubtitle}>Không thể tải thông tin dị ứng với ID: {currentAllergenId}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cập nhật dị ứng</Text>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveBtnText}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form}>
        {/* Current Allergen Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin hiện tại</Text>
          <View style={styles.currentAllergenCard}>
            <Text style={styles.currentAllergenName}>{currentAllergy.allergen.name}</Text>
            <Text style={styles.currentAllergenCategory}>{currentAllergy.allergen.category}</Text>
            {currentAllergy.allergen.scientificName && (
              <Text style={styles.currentAllergenScientific}>
                {currentAllergy.allergen.scientificName}
              </Text>
            )}
          </View>
        </View>

        {/* New Allergen Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn chất gây dị ứng mới</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.allergenScroll}>
            {availableAllergens.map((allergen) => (
              <TouchableOpacity
                key={allergen.id}
                style={[
                  styles.allergenOption,
                  newAllergenId === allergen.id && styles.allergenOptionSelected,
                ]}
                onPress={() => {
                  console.log("Selected allergen:", { id: allergen.id, name: allergen.name });
                  setNewAllergenId(allergen.id);
                }}
              >
                <Text
                  style={[
                    styles.allergenOptionText,
                    newAllergenId === allergen.id && styles.allergenOptionTextSelected,
                  ]}
                >
                  {allergen.name}
                </Text>
                <Text style={styles.allergenCategory}>{allergen.category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Severity Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mức độ nghiêm trọng</Text>
          <View style={styles.severityContainer}>
            {severityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.severityOption,
                  severity === option.value && { backgroundColor: option.color },
                ]}
                onPress={() => setSeverity(option.value)}
              >
                <Text
                  style={[
                    styles.severityOptionText,
                    severity === option.value && styles.severityOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Diagnosis Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chẩn đoán</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày chẩn đoán *</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDiagnosisDatePicker(true)}
            >
              <Text style={[styles.datePickerText, !diagnosisDate && styles.placeholderText]}>
                {diagnosisDate || "Chọn ngày chẩn đoán"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Người chẩn đoán *</Text>
            <TextInput
              style={styles.input}
              value={diagnosedBy}
              onChangeText={setDiagnosedBy}
              placeholder="Tên bác sĩ hoặc cơ sở y tế"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày phản ứng cuối cùng</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowReactionDatePicker(true)}
            >
              <Text style={[styles.datePickerText, !lastReactionDate && styles.placeholderText]}>
                {lastReactionDate || "Chọn ngày phản ứng cuối"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin bổ sung</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ghi chú tránh tiếp xúc</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={avoidanceNotes}
              onChangeText={setAvoidanceNotes}
              placeholder="Những lưu ý khi tránh tiếp xúc với chất này..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>Đã vượt qua dị ứng</Text>
              <Switch
                value={outgrown}
                onValueChange={setOutgrown}
                trackColor={{ false: "#E0E0E0", true: "#7DE1EF" }}
                thumbColor={outgrown ? "#fff" : "#f4f3f4"}
              />
            </View>

            {outgrown && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ngày vượt qua dị ứng</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowOutgrownDatePicker(true)}
                >
                  <Text style={[styles.datePickerText, !outgrownDate && styles.placeholderText]}>
                    {outgrownDate || "Chọn ngày vượt qua dị ứng"}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>Cần xác minh thêm</Text>
              <Switch
                value={needsVerification}
                onValueChange={setNeedsVerification}
                trackColor={{ false: "#E0E0E0", true: "#FF9800" }}
                thumbColor={needsVerification ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Date Pickers */}
      {showDiagnosisDatePicker && (
        <DateTimePicker
          value={diagnosisDateObj}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDiagnosisDateChange}
        />
      )}

      {showReactionDatePicker && (
        <DateTimePicker
          value={reactionDateObj}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleReactionDateChange}
        />
      )}

      {showOutgrownDatePicker && (
        <DateTimePicker
          value={outgrownDateObj}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleOutgrownDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#7DE1EF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  saveBtn: {
    backgroundColor: "#7DE1EF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  saveBtnDisabled: {
    backgroundColor: "#B0B0B0",
  },
  saveBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  form: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  currentAllergenCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: "#7DE1EF",
  },
  currentAllergenName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  currentAllergenCategory: {
    fontSize: 14,
    color: "#7DE1EF",
    marginBottom: 4,
  },
  currentAllergenScientific: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  allergenScroll: {
    maxHeight: 120,
  },
  allergenOption: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 120,
  },
  allergenOptionSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#7DE1EF",
  },
  allergenOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  allergenOptionTextSelected: {
    color: "#7DE1EF",
  },
  allergenCategory: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  severityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  severityOption: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
    minWidth: "45%",
  },
  severityOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  severityOptionTextSelected: {
    color: "white",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  switchGroup: {
    gap: 16,
  },
  switchItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  datePickerButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
});
