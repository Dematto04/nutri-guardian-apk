import { resetOnboarding } from '@/utils/onboardingStorage';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OnboardingDebugProps {
  onReset?: () => void;
}

export default function OnboardingDebug({ onReset }: OnboardingDebugProps) {
  const handleResetOnboarding = async () => {
    Alert.alert(
      'Reset Onboarding',
      'Bạn có chắc chắn muốn reset onboarding? Ứng dụng sẽ hiển thị màn hình giới thiệu lại.',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetOnboarding();
            if (onReset) {
              onReset();
            } else {
              Alert.alert('Thành công', 'Đã reset onboarding. Vui lòng khởi động lại ứng dụng.');
            }
          },
        },
      ]
    );
  };

  // Only show in development mode
  if (__DEV__) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={handleResetOnboarding}>
          <Ionicons name="refresh-outline" size={16} color="#007AFF" />
          <Text style={styles.buttonText}>Reset Onboarding</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 9999,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 6,
  },
  buttonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
});
