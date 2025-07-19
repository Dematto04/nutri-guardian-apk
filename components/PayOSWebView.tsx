import { PaymentService } from '@/service/payment.service';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { ThemedButton } from './ThemedButton';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface PayOSWebViewProps {
  checkoutUrl: string;
  orderCode: number;
  transactionId: string;
  onPaymentSuccess: (data: any) => void;
  onPaymentCancel: () => void;
  onPaymentError: (error: string) => void;
  onClose: () => void;
}

export function PayOSWebView({
  checkoutUrl,
  orderCode,
  transactionId,
  onPaymentSuccess,
  onPaymentCancel,
  onPaymentError,
  onClose
}: PayOSWebViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Start polling for payment status when component mounts
  useEffect(() => {
    let pollTimeout: ReturnType<typeof setTimeout>;
    
    const startPolling = () => {
      if (polling) return;
      
      setPolling(true);
      pollTimeout = setTimeout(async () => {
        try {
          const result = await PaymentService.pollPaymentStatus(transactionId, 1, 3000); // Single check every 3 seconds
          
          if (result.status === 'success') {
            onPaymentSuccess(result.data);
          } else if (result.status === 'failed' || result.status === 'cancelled') {
            onPaymentError(result.message);
          } else {
            // Continue polling if still pending
            setPolling(false);
            startPolling();
          }
        } catch (error) {
          console.error('Polling error:', error);
          setPolling(false);
          startPolling(); // Retry polling
        }
      }, 3000);
    };

    // Start polling after a short delay to let payment initiate
    const initialDelay = setTimeout(() => {
      startPolling();
    }, 5000);

    return () => {
      clearTimeout(pollTimeout);
      clearTimeout(initialDelay);
    };
  }, [transactionId, onPaymentSuccess, onPaymentError, polling]);

  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    const { url } = navState;
    
    // Log navigation for debugging
    console.log('WebView navigated to:', url);
    
    // Look for payment completion indicators in URL
    if (url.includes('success') || url.includes('complete') || url.includes('paid')) {
      console.log('Detected potential payment success in URL');
      // Trigger immediate status check
      try {
        const result = await PaymentService.pollPaymentStatus(transactionId, 1, 0);
        if (result.status === 'success') {
          onPaymentSuccess(result.data);
        }
      } catch (error) {
        console.error('Error checking payment status on success URL:', error);
      }
    } else if (url.includes('cancel') || url.includes('fail') || url.includes('error')) {
      console.log('Detected potential payment failure in URL');
      onPaymentCancel();
    }
  };

  const handleError = () => {
    setError('Không thể tải trang thanh toán');
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleReload = () => {
    setLoading(true);
    setError(null);
    webViewRef.current?.reload();
  };

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
          <ThemedText style={styles.errorTitle}>Lỗi tải trang thanh toán</ThemedText>
          <ThemedText style={styles.errorMessage}>{error}</ThemedText>
          
          <View style={styles.errorActions}>
            <ThemedButton
              title="Thử lại"
              onPress={handleReload}
              style={styles.retryButton}
            />
            <ThemedButton
              title="Đóng"
              onPress={onClose}
              variant="secondary"
              style={styles.closeButton}
            />
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Thanh toán</ThemedText>
        <ThemedButton
          title="✕"
          onPress={onClose}
          variant="secondary"
          style={styles.closeHeaderButton}
        />
      </View>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
        </View>
      )}

      {/* Polling indicator */}
      {polling && (
        <View style={styles.pollingContainer}>
          <ThemedText style={styles.pollingText}>Đang kiểm tra trạng thái thanh toán...</ThemedText>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: checkoutUrl || 'about:blank' }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onError={handleError}
        onLoad={handleLoad}
        onLoadEnd={handleLoad}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onShouldStartLoadWithRequest={(request) => {
          // Allow all PayOS related URLs
          if (request.url.includes('payos') || 
              request.url.includes('payment') ||
              request.url.includes('checkout')) {
            return true;
          }
          
          // Block external navigation that's not payment related
          if (request.url.startsWith('http') && 
              !request.url.includes(checkoutUrl.split('/')[2])) {
            return false;
          }
          
          return true;
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeHeaderButton: {
    backgroundColor: 'transparent',
    minWidth: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  webview: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
  },
  closeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingHorizontal: 24,
  },
  pollingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
  },
  pollingText: {
    fontSize: 16,
    color: '#007AFF',
  },
}); 