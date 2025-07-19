import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const router = useRouter();
  SplashScreen.preventAutoHideAsync()
  setTimeout(SplashScreen.hideAsync, 3000)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        
        if (token) {
          // User is logged in, redirect to tabs
          router.replace("/(tabs)/explore");
        } else {
          // User is not logged in, redirect to auth
          router.replace("/(auth)/login");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        // Default to auth screen on error
        router.replace("/(auth)/login");
      }
    };

    checkAuthStatus();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
} 