import { PayOSWebView } from '@/components/PayOSWebView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SubscriptionService } from '@/service/subscription.service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function EmbeddedPaymentScreen() {
  const router = useRouter();
  const { checkoutUrl, orderCode, transactionId } = useLocalSearchParams<{ 
    checkoutUrl: string; 
    orderCode: string; 
    transactionId: string;
  }>();

  const [loading, setLoading] = useState(false);

  // Debug logging to see what we received
  console.log('🔍 Embedded Payment Parameters:', {
    checkoutUrl,
    orderCode,
    transactionId,
    checkoutUrlType: typeof checkoutUrl,
    orderCodeType: typeof orderCode,
    transactionIdType: typeof transactionId
  });

  // Enhanced validation for undefined/invalid URLs
  if (!checkoutUrl || checkoutUrl === 'undefined') {
    console.error('❌ Invalid payment parameters - checkoutUrl:', checkoutUrl, 'orderCode:', orderCode, 'transactionId:', transactionId);
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText>Thông tin thanh toán không hợp lệ - Missing checkout URL</ThemedText>
      </ThemedView>
    );
  }

  // We need at least one identifier for payment tracking
  if ((!orderCode || orderCode === 'undefined') && (!transactionId || transactionId === 'undefined')) {
    console.error('❌ Invalid payment parameters - both orderCode and transactionId are missing:', { orderCode, transactionId });
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText>Thông tin thanh toán không hợp lệ - Missing payment identifiers</ThemedText>
      </ThemedView>
    );
  }

  // Use transactionId if available, fallback to orderCode
  const paymentIdentifier = transactionId && transactionId !== 'undefined' ? transactionId : orderCode;
  
  console.log('✅ Using payment identifier:', paymentIdentifier);

  const handlePaymentSuccess = async (data: any) => {
    setLoading(true);
    
    try {
      // Refresh subscription status
      await SubscriptionService.getSubscriptionStatus();
      
      Toast.show({
        type: "success",
        text1: "Thanh toán thành công! 🎉",
        text2: "Gói đăng ký của bạn đã được kích hoạt",
      });

      // Navigate to subscription screen to show the new status
      router.replace('/(tabs)/account/subscription' as any);
      
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      Toast.show({
        type: "success",
        text1: "Thanh toán thành công!",
        text2: "Đang cập nhật trạng thái đăng ký...",
      });
      
      // Still navigate to subscription screen
      router.replace('/(tabs)/account/subscription' as any);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCancel = () => {
    Alert.alert(
      'Thanh toán đã bị hủy',
      'Bạn có muốn thử lại không?',
      [
        {
          text: 'Thử lại',
          onPress: () => {
            // Stay on current screen to retry
          }
        },
        {
          text: 'Quay lại',
          onPress: () => router.back(),
          style: 'cancel'
        }
      ]
    );
  };

  const handlePaymentError = (error: string) => {
    Alert.alert(
      'Lỗi thanh toán',
      error || 'Đã xảy ra lỗi trong quá trình thanh toán',
      [
        {
          text: 'Thử lại',
          onPress: () => {
            // Stay on current screen to retry
          }
        },
        {
          text: 'Quay lại',
          onPress: () => router.back(),
          style: 'cancel'
        }
      ]
    );
  };

  const handleClose = () => {
    Alert.alert(
      'Hủy thanh toán?',
      'Bạn có chắc chắn muốn hủy quá trình thanh toán?',
      [
        {
          text: 'Tiếp tục thanh toán',
          style: 'cancel'
        },
        {
          text: 'Hủy',
          onPress: () => router.back(),
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <PayOSWebView
        checkoutUrl={(() => {
          try {
            return decodeURIComponent(checkoutUrl);
          } catch (error) {
            console.error('❌ URL decode error:', error);
            return checkoutUrl;
          }
        })()}
        orderCode={Number(orderCode) || 0}
        transactionId={paymentIdentifier}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentCancel={handlePaymentCancel}
        onPaymentError={handlePaymentError}
        onClose={handleClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
}); 