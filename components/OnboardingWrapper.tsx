import Loading from '@/components/Loading';
import Onboarding from '@/components/Onboarding';
import { hasSeenOnboarding as checkHasSeenOnboarding } from '@/utils/onboardingStorage';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export default function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboardingValue = await checkHasSeenOnboarding();
      setHasSeenOnboarding(hasSeenOnboardingValue);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasSeenOnboarding(false);
    }
  };

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
  };

  if (hasSeenOnboarding === null) {
    return <Loading />;
  }

  if (!hasSeenOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
