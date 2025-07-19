import { Stack } from 'expo-router';

export default function PaymentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="return" />
      <Stack.Screen name="cancel" />
      <Stack.Screen name="embedded" />
    </Stack>
  );
} 