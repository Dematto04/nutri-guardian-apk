import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export const handleTokenExpired = async () => {
  try {
    // Clear all stored data
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    
    // Navigate to login screen
    router.replace('/(auth)/login');
  } catch (error) {
    console.error('Error during token expiration cleanup:', error);
  }
};
