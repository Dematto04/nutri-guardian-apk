import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { AuthService } from "@/service/auth.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type Gender = 'Male' | 'Female' | 'Other';

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [gender, setGender] = useState<Gender>("Male");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập email";
      isValid = false;
    } else if (!email.includes('@')) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await AuthService.register({
        fullName,
        email,
        password,
        confirmPassword,
        dateOfBirth: dateOfBirth.toISOString(),
        gender
      });
      console.log({
        fullName,
        email,
        password,
        confirmPassword,
        dateOfBirth: dateOfBirth.toISOString(),
        gender
      });
      

      if (response.data) {
        console.log(response);
        await AsyncStorage.setItem('userRegister', JSON.stringify(response.data.data))
        router.push("/(auth)/otp");
      }
    } catch (error: any) {
      console.log({error});
      
      setErrors({
        email: error.response?.data?.messages.Email || "Đã xảy ra lỗi trong quá trình đăng ký"
      });
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const clearError = (field: keyof FormErrors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <ThemedView style={styles.container}>
      
      <ScrollView style={styles.formContainer}>
        <ThemedText type="subtitle" style={styles.title}>Tạo Tài Khoản</ThemedText>
        
        <View style={styles.inputContainer}>
          <View>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              placeholder="Họ và tên"
              placeholderTextColor={Colors.input.placeholder}
              autoCapitalize="words"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                clearError('fullName');
              }}
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
          </View>

          <View>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              placeholderTextColor={Colors.input.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError('email');
              }}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Mật khẩu"
              placeholderTextColor={Colors.input.placeholder}
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError('password');
              }}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          <View>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor={Colors.input.placeholder}
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearError('confirmPassword');
              }}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerButtonText}>
              Ngày sinh: {dateOfBirth.toLocaleDateString('vi-VN')}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue: Gender) => setGender(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Nam" value="Male" />
              <Picker.Item label="Nữ" value="Female" />
              <Picker.Item label="Khác" value="Other" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.button, 
            { 
              backgroundColor: loading ? '#ccc' : Colors.button.primary,
              opacity: loading ? 0.7 : 1
            }
          ]} 
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: Colors.button.text }]}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: Colors.text.secondary }]}>
            Đã có tài khoản? 
          </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={[styles.link, { color: Colors.primary }]}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    marginTop: 50
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    gap: 15,
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.input.background,
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  datePickerButton: {
    backgroundColor: Colors.input.background,
    padding: 15,
    borderRadius: 10,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  pickerContainer: {
    backgroundColor: Colors.input.background,
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: Colors.button.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 5,
  },
  footerText: {
    color: Colors.text.secondary,
  },
  link: {
    fontWeight: 'bold',
  },
});
