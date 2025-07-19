import AsyncStorage from '@react-native-async-storage/async-storage';

export const resetOnboarding = async () => {
  try {
    await AsyncStorage.removeItem('hasSeenOnboarding');
    console.log('Onboarding status reset successfully');
  } catch (error) {
    console.error('Error resetting onboarding status:', error);
  }
};

export const hasSeenOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem('hasSeenOnboarding');
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

export const setOnboardingComplete = async () => {
  try {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    console.log('Onboarding marked as complete');
  } catch (error) {
    console.error('Error setting onboarding complete:', error);
  }
};
