import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function PaymentReturnScreen() {
  const router = useRouter();

  const handleGoToAccount = () => {
    router.replace('/(tabs)/account');
  };

  const handleGoHome = () => {
    router.replace('/(tabs)/explore');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Info Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="information-circle" size={80} color="#007AFF" />
        </View>

        {/* Message */}
        <ThemedText type="title" style={styles.title}>
          Thanh toán đang được xử lý
        </ThemedText>

        <ThemedText style={styles.message}>
          Giao dịch của bạn đang được xử lý. Vui lòng kiểm tra trạng thái đăng ký trong tài khoản của bạn.
        </ThemedText>

        {/* Information Box */}
        <View style={styles.infoContainer}>
          <Ionicons name="time-outline" size={24} color="#007AFF" />
          <ThemedText style={styles.infoText}>
            Quá trình xử lý thanh toán có thể mất vài phút. Trạng thái đăng ký sẽ được cập nhật tự động khi thanh toán hoàn tất.
          </ThemedText>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <ThemedButton
            title="Kiểm tra tài khoản"
            onPress={handleGoToAccount}
            style={styles.primaryButton}
          />
          
          <ThemedButton
            title="Về trang chủ"
            onPress={handleGoHome}
            variant="secondary"
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
    lineHeight: 24,
  },
  infoContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
}); 