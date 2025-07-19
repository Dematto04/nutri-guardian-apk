# PayOS Embedded Integration Guide

## Overview

This app now includes embedded PayOS payment functionality that provides a seamless in-app payment experience without redirecting users to external browsers.

## 🚀 Features

### ✅ Embedded Payment Flow
- **WebView Integration**: PayOS checkout embedded directly in the app
- **Real-time Status**: Automatic payment status detection and handling
- **Seamless UX**: No external browser redirects

### ✅ Payment Components
- **PayOSWebView**: Reusable WebView component for PayOS integration
- **EmbeddedPaymentScreen**: Full-screen payment experience
- **Automatic Navigation**: Smart URL detection for success/cancel flows

### ✅ Error Handling
- **Network Issues**: Graceful handling of connection problems
- **Payment Failures**: Clear error messages and retry options
- **User Cancellation**: Proper handling of user-initiated cancellations

## 📱 How It Works

### 1. Payment Initiation
```typescript
// From subscription screen
const paymentResult = await PaymentService.createEmbeddedSubscriptionPayment(
  subscription.id,
  plan.id,
  plan.price,
  plan.name
);

// Navigate to embedded payment
router.push(`/payment/embedded?checkoutUrl=${checkoutUrl}&orderCode=${orderCode}`);
```

### 2. Embedded Payment Flow
```typescript
// PayOSWebView component handles:
- Loading PayOS checkout URL in WebView
- Monitoring for payment completion
- Detecting success/error states
- Automatic status verification
```

### 3. Payment Completion
```typescript
// Automatic handling of:
- Payment success → Navigate to subscription screen
- Payment failure → Show error with retry option
- User cancellation → Confirm dialog with options
```

## 🔧 Configuration

### Environment Variables
Make sure you have these set in your environment:

```env
EXPO_PUBLIC_FRONTEND_URL=your-app-frontend-url
EXPO_PUBLIC_API_URL=your-backend-api-url
```

### PayOS Backend Configuration
Your backend should have PayOS configured with:
- Return URL: `${FRONTEND_URL}/payment/return`
- Cancel URL: `${FRONTEND_URL}/payment/cancel`

## 🎯 Usage Examples

### Basic Subscription Payment
```typescript
import { PaymentService } from '@/service/payment.service';

// Create embedded payment
const payment = await PaymentService.createEmbeddedSubscriptionPayment(
  userSubscriptionId,
  planId,
  amount,
  planName
);

// Navigate to embedded payment screen
router.push(`/payment/embedded?checkoutUrl=${encodeURIComponent(payment.data.checkoutUrl)}&orderCode=${payment.data.orderCode}`);
```

### Custom Payment Component
```typescript
import { PayOSWebView } from '@/components/PayOSWebView';

<PayOSWebView
  checkoutUrl="https://payos-checkout-url"
  orderCode={12345}
  onPaymentSuccess={(data) => console.log('Success:', data)}
  onPaymentCancel={() => console.log('Cancelled')}
  onPaymentError={(error) => console.log('Error:', error)}
  onClose={() => router.back()}
/>
```

## 🔍 Testing

### Test Payment Flow
1. **Go to Account Tab** → Subscription Management
2. **Select a Plan** → Click "Đăng ký"
3. **Embedded Payment** opens in WebView
4. **Complete Payment** through PayOS interface
5. **Automatic Return** to subscription screen with updated status

### Test Error Scenarios
- **Network Issues**: Turn off internet during payment
- **User Cancellation**: Close payment screen during process
- **Payment Failure**: Use invalid payment details

## 🛠 Technical Details

### WebView Configuration
- **JavaScript Enabled**: For PayOS functionality
- **DOM Storage**: For payment state management
- **URL Monitoring**: Automatic success/error detection
- **Injected JavaScript**: Enhanced payment completion detection

### Security Considerations
- **URL Validation**: Only PayOS and payment URLs allowed
- **SSL Required**: All payment communications encrypted
- **No External Navigation**: Prevents redirect attacks

### Performance Optimizations
- **Loading States**: Clear feedback during page loads
- **Error Recovery**: Automatic retry capabilities
- **Memory Management**: Proper WebView cleanup

## 🐛 Troubleshooting

### Common Issues

**WebView Not Loading**
- Check network connection
- Verify PayOS checkout URL is valid
- Ensure WebView permissions are granted

**Payment Not Completing**
- Check PayOS configuration
- Verify return/cancel URLs are correct
- Ensure backend webhook handling is working

**Navigation Issues**
- Check router configuration
- Verify screen parameters are passed correctly
- Ensure payment screen is properly registered

### Debug Mode
Enable console logging to see detailed payment flow:

```typescript
// In PayOSWebView component
console.log('Payment URL:', checkoutUrl);
console.log('Order Code:', orderCode);
console.log('Navigation State:', navState);
```

## 🔄 Migration from External Flow

If you were previously using external browser flow:

### Before (External)
```typescript
await Linking.openURL(paymentUrl);
```

### After (Embedded)
```typescript
router.push(`/payment/embedded?checkoutUrl=${encodeURIComponent(paymentUrl)}&orderCode=${orderCode}`);
```

## 📞 Support

For issues with:
- **PayOS Integration**: Check PayOS documentation
- **WebView Problems**: Ensure react-native-webview is properly installed
- **Navigation Issues**: Verify expo-router configuration

The embedded PayOS integration provides a much better user experience while maintaining all the security and functionality of the original external flow! 🎉 