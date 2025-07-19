import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/Colors";
import { AuthService } from "@/service/auth.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Clipboard,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getString();
      const numbers = text
        .replace(/[^0-9]/g, "")
        .split("")
        .slice(0, OTP_LENGTH);
      if (numbers.length === OTP_LENGTH) {
        setOtp(numbers);
        setError(null);
        Keyboard.dismiss();
      }
    } catch (error) {
      console.log("Paste failed:", error);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== OTP_LENGTH) {
      setError("Vui lòng nhập đầy đủ mã OTP");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userRegister = await AsyncStorage.getItem("userRegister");
      if (userRegister) {
        const userParsed = JSON.parse(userRegister);
        console.log({
          userParsed,
          otpString,
        });

        const response = await AuthService.verifyOTP({
          userId: userParsed.userId,
          code: otpString,
          type: 1,
        });
        console.log({
          response,
        });

        if (response.data) {
          await AsyncStorage.removeItem("userRegister");
          Toast.show({
            text1: "Đăng kí thành công",
            text2: "Vui lòng đăng nhập",
          });
        }
      }
    } catch (error: any) {
      console.log({ error });

      setError(error.response?.data?.message || "Mã OTP không hợp lệ");
    } finally {
      setLoading(false);
      router.replace("/(auth)/login");
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      setLoading(true);
      setError(null);
      await AuthService.resendOTP({ email });
      setTimeLeft(60);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(""));
    } catch (error: any) {
      setError(error.response?.data?.message || "Không thể gửi lại mã OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <ThemedText type="subtitle" style={styles.title}>
            Xác thực Email
          </ThemedText>
          <Divider className="my-2  bg-indigo-500" />

          <Text style={styles.description}>
            Chúng tôi đã gửi mã xác thực đến email {email}
          </Text>
          <View style={styles.otpContainer}>
            {Array(OTP_LENGTH)
              .fill(0)
              .map((_, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    error && styles.otpInputError,
                    otp[index] && styles.otpInputFilled,
                  ]}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={otp[index]}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  selectTextOnFocus
                />
              ))}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[
              styles.verifyButton,
              loading && styles.verifyButtonDisabled,
            ]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.button.text} />
            ) : (
              <Text style={styles.verifyButtonText}>Xác nhận</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.pasteButton} onPress={handlePaste}>
            <Text style={styles.pasteButtonText}>Dán mã</Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              {canResend ? "Chưa nhận được mã?" : `Gửi lại mã sau ${timeLeft}s`}
            </Text>
            {canResend && (
              <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                <Text style={styles.resendButton}>Gửi lại</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: Colors.input.background,
    borderRadius: 8,
    backgroundColor: Colors.input.background,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: "#fff",
  },
  otpInputError: {
    borderColor: "#ff6b6b",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  verifyButton: {
    backgroundColor: Colors.button.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: Colors.button.text,
    fontSize: 16,
    fontWeight: "600",
  },
  pasteButton: {
    padding: 8,
  },
  pasteButtonText: {
    color: Colors.primary,
    fontSize: 14,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 16,
  },
  resendText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  resendButton: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
