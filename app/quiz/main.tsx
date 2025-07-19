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
  View,
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

interface AllergenProfile {
  allergenId: number;
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
  const [allergenProfiles, setAllergenProfiles] = useState<
    Record<number, AllergenProfile>
  >({});
  const [currentStep, setCurrentStep] = useState<"selection" | "details">(
    "selection"
  );
  const [showDiagnosisDatePicker, setShowDiagnosisDatePicker] = useState<{
    [key: number]: boolean;
  }>({});
  const [showLastReactionDatePicker, setShowLastReactionDatePicker] = useState<{
    [key: number]: boolean;
  }>({});
  const [showOutgrownDatePicker, setShowOutgrownDatePicker] = useState<{
    [key: number]: boolean;
  }>({});
  const [errors, setErrors] = useState<{
    [key: number]: Partial<Record<keyof AllergenProfile, string>>;
  }>({});
  const isFocused = useIsFocused();
  const router = useRouter()
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
      setAllergenProfiles((prev) => ({
        ...prev,
        [allergenId]: {
          allergenId,
          severity: "mild",
          diagnosisDate: new Date().toISOString().split("T")[0],
          diagnosedBy: "",
          lastReactionDate: new Date().toISOString().split("T")[0],
          avoidanceNotes: "",
          outgrown: false,
          outgrownDate: "",
          needsVerification: false,
        },
      }));
    } else {
      setSelectedAllergens((prev) => prev.filter((id) => id !== allergenId));
      setAllergenProfiles((prev) => {
        const updated = { ...prev };
        delete updated[allergenId];
        return updated;
      });
    }
  };

  const updateAllergenProfile = (
    allergenId: number,
    field: keyof AllergenProfile,
    value: any
  ) => {
    setAllergenProfiles((prev) => ({
      ...prev,
      [allergenId]: {
        ...prev[allergenId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    const profiles = Object.values(allergenProfiles);
    const body = {
      allergenIds: profiles.map((pro) => pro.allergenId),
      severity: "Có phản ứng",
      diagnosisDate: "2025-07-02",
      diagnosedBy: "string",
      lastReactionDate: "2025-07-02",
      avoidanceNotes: "string",
      outgrown: true,
      outgrownDate: "2025-07-02",
      needsVerification: true,
    };

    try {
      await UserAllergyService.createUserAllergen(body);
      Alert.alert("Thành công", "Hồ sơ dị ứng đã được lưu!");
      router.push("/(tabs)/education")
    } catch (error) {
      console.log({ error });
    }
  };

  // Validate fields
  const validateProfile = (profile: AllergenProfile) => {
    const error: Partial<Record<keyof AllergenProfile, string>> = {};
    if (!profile.severity) error.severity = "Vui lòng chọn mức độ";
    if (!profile.diagnosisDate) error.diagnosisDate = "Không được để trống";
    if (!profile.diagnosedBy) error.diagnosedBy = "Không được để trống";
    if (!profile.lastReactionDate)
      error.lastReactionDate = "Vui lòng chọn ngày phản ứng";
    if (profile.outgrown && !profile.outgrownDate)
      error.outgrownDate = "Vui lòng nhập ngày khỏi dị ứng";
    return error;
  };

  const handleDateChange = (
    allergenId: number,
    field: keyof AllergenProfile,
    event: any,
    selectedDate?: Date
  ) => {
    if (event.type === "set" && selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      updateAllergenProfile(allergenId, field, dateStr);
      setErrors((prev) => ({
        ...prev,
        [allergenId]: {
          ...prev[allergenId],
          [field]: undefined,
        },
      }));
    }
    if (field === "diagnosisDate")
      setShowDiagnosisDatePicker((prev) => ({ ...prev, [allergenId]: false }));
    if (field === "lastReactionDate")
      setShowLastReactionDatePicker((prev) => ({
        ...prev,
        [allergenId]: false,
      }));
    if (field === "outgrownDate")
      setShowOutgrownDatePicker((prev) => ({ ...prev, [allergenId]: false }));
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
                  <CheckboxIcon as={CheckIcon} />
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
      {selectedAllergens.map((allergenId) => {
        const allergen = mockAllergens.find((a) => a.id === allergenId);
        const profile = allergenProfiles[allergenId];
        if (!allergen || !profile) return null;
        return (
          <View key={allergenId} style={styles.card}>
            <Text style={styles.title}>{allergen.name}</Text>
            {/* Severity */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mức độ nghiêm trọng</Text>
              <View style={styles.pickerContainer}>
                <Select
                  selectedValue={profile.severity}
                  onValueChange={(value) =>
                    updateAllergenProfile(allergenId, "severity", value)
                  }
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
              {errors[allergenId]?.severity && (
                <Text style={styles.errorText}>
                  {errors[allergenId]?.severity}
                </Text>
              )}
            </View>
            {/* Diagnosis Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày chẩn đoán</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() =>
                  setShowDiagnosisDatePicker((prev) => ({
                    ...prev,
                    [allergenId]: true,
                  }))
                }
              >
                <Text style={styles.datePickerButtonText}>
                  {profile.diagnosisDate || "Chọn ngày"}
                </Text>
              </TouchableOpacity>
              {showDiagnosisDatePicker[allergenId] && (
                <DateTimePicker
                  value={
                    profile.diagnosisDate
                      ? new Date(profile.diagnosisDate)
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={(event, date) =>
                    handleDateChange(allergenId, "diagnosisDate", event, date)
                  }
                  maximumDate={new Date()}
                />
              )}
              {errors[allergenId]?.diagnosisDate && (
                <Text style={styles.errorText}>
                  {errors[allergenId]?.diagnosisDate}
                </Text>
              )}
            </View>
            {/* Diagnosed By */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Được chẩn đoán bởi</Text>
              <TextInput
                style={[
                  styles.input,
                  errors[allergenId]?.diagnosedBy && styles.inputError,
                ]}
                value={profile.diagnosedBy}
                onChangeText={(value) => {
                  updateAllergenProfile(allergenId, "diagnosedBy", value);
                  setErrors((prev) => ({
                    ...prev,
                    [allergenId]: {
                      ...prev[allergenId],
                      diagnosedBy: undefined,
                    },
                  }));
                }}
                placeholder="Tên bác sĩ hoặc cơ sở y tế"
              />
              {errors[allergenId]?.diagnosedBy && (
                <Text style={styles.errorText}>
                  {errors[allergenId]?.diagnosedBy}
                </Text>
              )}
            </View>
            {/* Last Reaction Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày phản ứng gần nhất</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() =>
                  setShowLastReactionDatePicker((prev) => ({
                    ...prev,
                    [allergenId]: true,
                  }))
                }
              >
                <Text style={styles.datePickerButtonText}>
                  {profile.lastReactionDate || "Chọn ngày"}
                </Text>
              </TouchableOpacity>
              {showLastReactionDatePicker[allergenId] && (
                <DateTimePicker
                  value={
                    profile.lastReactionDate
                      ? new Date(profile.lastReactionDate)
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={(event, date) =>
                    handleDateChange(
                      allergenId,
                      "lastReactionDate",
                      event,
                      date
                    )
                  }
                  maximumDate={new Date()}
                />
              )}
              {errors[allergenId]?.lastReactionDate && (
                <Text style={styles.errorText}>
                  {errors[allergenId]?.lastReactionDate}
                </Text>
              )}
            </View>
            {/* Avoidance Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ghi chú tránh xa</Text>
              <TextInput
                style={styles.input}
                value={profile.avoidanceNotes}
                onChangeText={(value) =>
                  updateAllergenProfile(allergenId, "avoidanceNotes", value)
                }
                placeholder="Ghi chú về cách tránh xa chất gây dị ứng này..."
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
                value={profile.outgrown}
                onValueChange={(value) =>
                  updateAllergenProfile(allergenId, "outgrown", value)
                }
              />
            </View>
            {/* Outgrown Date */}
            {profile.outgrown && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ngày khỏi dị ứng</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() =>
                    setShowOutgrownDatePicker((prev) => ({
                      ...prev,
                      [allergenId]: true,
                    }))
                  }
                >
                  <Text style={styles.datePickerButtonText}>
                    {profile.outgrownDate || "Chọn ngày"}
                  </Text>
                </TouchableOpacity>
                {showOutgrownDatePicker[allergenId] && (
                  <DateTimePicker
                    value={
                      profile.outgrownDate
                        ? new Date(profile.outgrownDate)
                        : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={(event, date) =>
                      handleDateChange(allergenId, "outgrownDate", event, date)
                    }
                    maximumDate={new Date()}
                  />
                )}
                {errors[allergenId]?.outgrownDate && (
                  <Text style={styles.errorText}>
                    {errors[allergenId]?.outgrownDate}
                  </Text>
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
                value={profile.needsVerification}
                onValueChange={(value) =>
                  updateAllergenProfile(allergenId, "needsVerification", value)
                }
              />
            </View>
          </View>
        );
      })}
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
