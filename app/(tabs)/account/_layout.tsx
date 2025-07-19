import AntDesign from "@expo/vector-icons/AntDesign";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable } from "react-native";
function AccountStack() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="mycards"
        options={{
          title: "My Cards",
          headerTitleAlign: "center",
          headerRight: () => (
            <Pressable onPress={() => router.push("/(tabs)/account/addcard")}>
              <AntDesign name="pluscircleo" size={20} color="black" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="addcard"
        options={{ title: "Add Credit Card", headerTitleAlign: "center" }}
      />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen 
        name="subscription" 
        options={{ 
          title: "Quản lý đăng ký", 
          headerTitleAlign: "center" 
        }} 
      />
      <Stack.Screen 
        name="allergen-profile" 
        options={{ 
          title: "Hồ sơ dị ứng", 
          headerTitleAlign: "center" 
        }} 
      />
    </Stack>
  );
}

export default AccountStack;
