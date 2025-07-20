import { AllergenService } from "@/service/allergen.service";
import { UserAllergyService } from "@/service/userAllergy.service";
import { Ionicons } from "@expo/vector-icons";
import {
  Box,
  Button,
  ButtonText,
  Card,
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckIcon,
  ChevronDownIcon,
  HStack,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  Switch,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

interface Allergen {
  id: number;
  name: string;
  category: string;
  scientificName: string | null;
  description: string;
  isFdaMajor: boolean;
  isEuMajor: boolean;
  createdAt: string;
  updatedAt: string | null;
}

interface CommonAllergyInfo {
  severity: string;
  diagnosisDate: string;
  diagnosedBy: string;
  lastReactionDate: string;
  avoidanceNotes: string;
  outgrown: boolean;
  outgrownDate: string;
  needsVerification: boolean;
}

const severityOptions = [
  { label: "Nhẹ", value: "mild" },
  { label: "Trung bình", value: "moderate" },
  { label: "Nặng", value: "severe" },
  { label: "Rất nặng", value: "critical" },
];

export default function AllergenQuizForm() {
  const [mockAllergens, setMockAllergens] = useState<Allergen[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<number[]>([]);
  const [commonInfo, setCommonInfo] = useState<CommonAllergyInfo>({
    severity: "mild",
    diagnosisDate: new Date().toISOString().split("T")[0],
    diagnosedBy: "",
    lastReactionDate: new Date().toISOString().split("T")[0],
    avoidanceNotes: "",
    outgrown: false,
    outgrownDate: "",
    needsVerification: false,
  });
  const [currentStep, setCurrentStep] = useState<"selection" | "details">(
    "selection"
  );
  const [showDiagnosisDatePicker, setShowDiagnosisDatePicker] = useState(false);
  const [showLastReactionDatePicker, setShowLastReactionDatePicker] = useState(false);
  const [showOutgrownDatePicker, setShowOutgrownDatePicker] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CommonAllergyInfo, string>>>({});
  const isFocused = useIsFocused();
  const router = useRouter();
  useEffect(() => {
    const fetchAllergens = async () => {
      try {
        console.log("Fetching allergens from API...");
        const response = await AllergenService.getAllAllergen();
        console.log("Fetched Allergens:", response.data);
        const value = response.data as any;
        setMockAllergens(value.data);
      } catch (error) {
        console.error("Error fetching allergens:", error);
      }
    };

    fetchAllergens();
  }, [isFocused]);

  const handleAllergenSelection = (allergenId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedAllergens((prev) => [...prev, allergenId]);
    } else {
      setSelectedAllergens((prev) => prev.filter((id) => id !== allergenId));
    }
  };

  const updateCommonInfo = (
    field: keyof CommonAllergyInfo,
    value: any
  ) => {
    setCommonInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const handleSubmit = async () => {
    // Validate common info
    const validationErrors = validateCommonInfo(commonInfo);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const body = {
      allergenIds: selectedAllergens,
      severity: commonInfo.severity,
      diagnosisDate: commonInfo.diagnosisDate,
      diagnosedBy: commonInfo.diagnosedBy,
      lastReactionDate: commonInfo.lastReactionDate,
      avoidanceNotes: commonInfo.avoidanceNotes,
      outgrown: commonInfo.outgrown,
      outgrownDate: commonInfo.outgrownDate,
      needsVerification: commonInfo.needsVerification,
    };
    console.log({body});
    

    try {
      await UserAllergyService.createUserAllergen(body);
      Alert.alert("Thành công", "Hồ sơ dị ứng đã được lưu!");
      router.push("/(tabs)/education");
    } catch (error) {
      console.log({ error });
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu hồ sơ dị ứng");
    }
  };

  // Validate fields
  const validateCommonInfo = (info: CommonAllergyInfo) => {
    const error: Partial<Record<keyof CommonAllergyInfo, string>> = {};
    if (!info.severity) error.severity = "Vui lòng chọn mức độ";
    if (!info.diagnosisDate) error.diagnosisDate = "Không được để trống";
    if (!info.diagnosedBy) error.diagnosedBy = "Không được để trống";
    if (!info.lastReactionDate)
      error.lastReactionDate = "Vui lòng chọn ngày phản ứng";
    if (info.outgrown && !info.outgrownDate)
      error.outgrownDate = "Vui lòng nhập ngày khỏi dị ứng";
    return error;
  };

  // Format date for display (dd-MM-yyyy)
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format date for API (yyyy-MM-dd)
  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleDateChange = (
    field: keyof CommonAllergyInfo,
    event: any,
    selectedDate?: Date
  ) => {
    if (event.type === "set" && selectedDate) {
      const dateStr = formatDateForAPI(selectedDate);
      updateCommonInfo(field, dateStr);
    }
    if (field === "diagnosisDate")
      setShowDiagnosisDatePicker(false);
    if (field === "lastReactionDate")
      setShowLastReactionDatePicker(false);
    if (field === "outgrownDate")
      setShowOutgrownDatePicker(false);
  };

  const renderAllergenSelection = () => (
    <VStack space="md">
      <Box p="$4" bg="$blue50" rounded="$lg">
        <HStack space="sm" alignItems="center" mb="$2">
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text fontWeight="$semibold" color="$blue800" fontFamily="System">
            Chọn các chất gây dị ứng
          </Text>
        </HStack>
        <Text fontSize="$sm" color="$blue700" fontFamily="System">
          Hãy chọn tất cả các chất mà bạn bị dị ứng hoặc không dung nạp
        </Text>
      </Box>

      {mockAllergens.length > 0 &&
        mockAllergens.map((allergen) => (
          <Card key={allergen.id} p="$4">
            <HStack space="md" alignItems="flex-start">
              <Checkbox

                value={allergen.id.toString()}
                isChecked={selectedAllergens.includes(allergen.id)}
                onChange={(isChecked) =>
                  handleAllergenSelection(allergen.id, isChecked)
                }
                mt="$1"
              >
                <CheckboxIndicator mr="$2">
                  <CheckboxIcon as={CheckIcon} color="white"/>
                </CheckboxIndicator>
              </Checkbox>

              <VStack flex={1} space="xs">
                <HStack alignItems="center" space="sm">
                  <Text fontWeight="$semibold" fontFamily="System">
                    {allergen.name}
                  </Text>
                  <Text fontSize="$xs" color="$gray500" fontFamily="System">
                    ({allergen.category})
                  </Text>
                </HStack>
                <Text fontSize="$sm" color="$gray600" fontFamily="System">
                  {allergen.description}
                </Text>
                {allergen.isFdaMajor && (
                  <Text fontSize="$xs" color="$orange600" fontFamily="System">
                    Chất gây dị ứng chính theo FDA
                  </Text>
                )}
              </VStack>
            </HStack>
          </Card>
        ))}

      {selectedAllergens.length > 0 && (
        <Button onPress={() => setCurrentStep("details")} mt="$4">
          <ButtonText fontFamily="System">
            Tiếp tục ({selectedAllergens.length} chất đã chọn)
          </ButtonText>
        </Button>
      )}
    </VStack>
  );

  const renderAllergenDetails = () => (
    <View style={styles.formContainer}>
      <TouchableOpacity
        onPress={() => setCurrentStep("selection")}
        style={{ marginBottom: 16 }}
      >
        <Text style={styles.linkText}>{"< Quay lại chọn chất dị ứng"}</Text>
      </TouchableOpacity>

      {/* Show selected allergens */}
      <View style={styles.card}>
        <Text style={styles.title}>Các chất dị ứng đã chọn:</Text>
        {selectedAllergens.map((allergenId) => {
          const allergen = mockAllergens.find((a) => a.id === allergenId);
          return allergen ? (
            <Text key={allergenId} style={styles.selectedAllergenText}>
              • {allergen.name} ({allergen.category})
            </Text>
          ) : null;
        })}
      </View>

      {/* Common information form */}
      <View style={styles.card}>
        <Text style={styles.title}>Thông tin chung</Text>
        <Text style={styles.subtitle}>
          Thông tin này sẽ được áp dụng cho tất cả các chất dị ứng đã chọn
        </Text>

        {/* Severity */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mức độ nghiêm trọng</Text>
          <View style={styles.pickerContainer}>
            <Select
              selectedValue={commonInfo.severity}
              onValueChange={(value) => updateCommonInfo("severity", value)}
              style={styles.picker}
            >
              <SelectTrigger>
                <SelectInput
                  placeholder="Chọn mức độ"
                  fontFamily="System"
                />
                <SelectIcon as={ChevronDownIcon} />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {severityOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          </View>
          {errors.severity && (
            <Text style={styles.errorText}>{errors.severity}</Text>
          )}
        </View>

        {/* Diagnosis Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ngày chẩn đoán</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDiagnosisDatePicker(true)}
          >
            <Text style={styles.datePickerButtonText}>
              {commonInfo.diagnosisDate ? formatDateForDisplay(commonInfo.diagnosisDate) : "Chọn ngày"}
            </Text>
          </TouchableOpacity>
          {showDiagnosisDatePicker && (
            <DateTimePicker
              value={
                commonInfo.diagnosisDate
                  ? new Date(commonInfo.diagnosisDate)
                  : new Date()
              }
              mode="date"
              display="default"
              
              onChange={(event, date) =>
                handleDateChange("diagnosisDate", event, date)
              }
              maximumDate={new Date()}
            />
          )}
          {errors.diagnosisDate && (
            <Text style={styles.errorText}>{errors.diagnosisDate}</Text>
          )}
        </View>

        {/* Diagnosed By */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Được chẩn đoán bởi</Text>
          <TextInput
            style={[
              styles.input,
              errors.diagnosedBy && styles.inputError,
            ]}
            value={commonInfo.diagnosedBy}
            onChangeText={(value) => updateCommonInfo("diagnosedBy", value)}
            placeholder="Tên bác sĩ hoặc cơ sở y tế"
          />
          {errors.diagnosedBy && (
            <Text style={styles.errorText}>{errors.diagnosedBy}</Text>
          )}
        </View>

        {/* Last Reaction Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ngày phản ứng gần nhất</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowLastReactionDatePicker(true)}
          >
            <Text style={styles.datePickerButtonText}>
              {commonInfo.lastReactionDate ? formatDateForDisplay(commonInfo.lastReactionDate) : "Chọn ngày"}
            </Text>
          </TouchableOpacity>
          {showLastReactionDatePicker && (
            <DateTimePicker
              value={
                commonInfo.lastReactionDate
                  ? new Date(commonInfo.lastReactionDate)
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={(event, date) =>
                handleDateChange("lastReactionDate", event, date)
              }
              maximumDate={new Date()}
            />
          )}
          {errors.lastReactionDate && (
            <Text style={styles.errorText}>{errors.lastReactionDate}</Text>
          )}
        </View>

        {/* Avoidance Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ghi chú tránh xa</Text>
          <TextInput
            style={styles.input}
            value={commonInfo.avoidanceNotes}
            onChangeText={(value) => updateCommonInfo("avoidanceNotes", value)}
            placeholder="Ghi chú về cách tránh xa các chất gây dị ứng..."
            multiline
          />
        </View>

        {/* Outgrown */}
        <View
          style={[
            styles.inputGroup,
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            },
          ]}
        >
          <Text style={styles.label}>Đã khỏi dị ứng</Text>
          <Switch
            value={commonInfo.outgrown}
            onValueChange={(value) => updateCommonInfo("outgrown", value)}
          />
        </View>

        {/* Outgrown Date */}
        {commonInfo.outgrown && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày khỏi dị ứng</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowOutgrownDatePicker(true)}
            >
              <Text style={styles.datePickerButtonText}>
                {commonInfo.outgrownDate ? formatDateForDisplay(commonInfo.outgrownDate) : "Chọn ngày"}
              </Text>
            </TouchableOpacity>
            {showOutgrownDatePicker && (
              <DateTimePicker
                value={
                  commonInfo.outgrownDate
                    ? new Date(commonInfo.outgrownDate)
                    : new Date()
                }
                mode="date"
                display="default"
                onChange={(event, date) =>
                  handleDateChange("outgrownDate", event, date)
                }
                maximumDate={new Date()}
              />
            )}
            {errors.outgrownDate && (
              <Text style={styles.errorText}>{errors.outgrownDate}</Text>
            )}
          </View>
        )}

        {/* Needs Verification */}
        <View
          style={[
            styles.inputGroup,
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            },
          ]}
        >
          <Text style={styles.label}>Cần xác minh lại</Text>
          <Switch
            value={commonInfo.needsVerification}
            onValueChange={(value) => updateCommonInfo("needsVerification", value)}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Lưu hồ sơ dị ứng</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <Box flex={1} p="$4">
        <VStack space="lg">
          <Box p="$4" bg="$white" rounded="$lg" alignItems="center">
            <Ionicons name="medical" size={32} color="#3b82f6" />
            <Text
              fontSize="$xl"
              fontWeight="$bold"
              textAlign="center"
              mt="$2"
              fontFamily="System"
            >
              Khảo sát Hồ sơ Dị ứng
            </Text>
            <Text
              fontSize="$sm"
              textAlign="center"
              color="$gray600"
              mt="$1"
              fontFamily="System"
            >
              Cung cấp thông tin chi tiết về tình trạng dị ứng của bạn
            </Text>
          </Box>

          {currentStep === "selection"
            ? renderAllergenSelection()
            : renderAllergenDetails()}
        </VStack>
      </Box>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 30,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 15,
    color: "#666",
    fontStyle: "italic",
  },
  selectedAllergenText: {
    fontSize: 14,
    marginBottom: 5,
    color: "#444",
    paddingLeft: 10,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    color: "#222",
  },
  input: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    borderWidth: 0,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#ff6b6b",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  datePickerButton: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 8,
    marginTop: 2,
  },
  datePickerButtonText: {
    fontSize: 15,
    color: "#222",
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#3b82f6",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  linkText: {
    color: "#3b82f6",
    fontWeight: "bold",
    fontSize: 15,
  },
  pickerContainer: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 44,
    width: "100%",
  },
});
