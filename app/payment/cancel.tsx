import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function PaymentCancelScreen() {
  const router = useRouter();

  const handleTryAgain = () => {
    // Go back to subscription plans
    router.replace('/(tabs)/account');
  };

  const handleGoHome = () => {
    router.replace('/(tabs)/explore');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Cancel Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="close-circle-outline" size={80} color="#FF9500" />
        </View>

        {/* Cancel Message */}
        <ThemedText type="title" style={styles.title}>
          Thanh toán đã bị hủy
        </ThemedText>

        <ThemedText style={styles.message}>
          Bạn đã hủy quá trình thanh toán. Gói đăng ký chưa được kích hoạt.
        </ThemedText>

        {/* Information Box */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
          <ThemedText style={styles.infoText}>
            Bạn có thể thử lại thanh toán bất cứ lúc nào. Tất cả thông tin gói đăng ký sẽ được giữ nguyên.
          </ThemedText>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <ThemedButton
            title="Thử lại thanh toán"
            onPress={handleTryAgain}
            style={styles.primaryButton}
          />
          
          <ThemedButton
            title="Quay lại trang chủ"
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
    marginBottom: 24,
    color: '#666',
    lineHeight: 24,
  },
  orderCodeContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderCodeLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderCodeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
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