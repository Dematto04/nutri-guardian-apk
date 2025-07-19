import { ThemedText } from "@/components/ThemedText";
import { Stack } from "expo-router";
import React from "react";

function TrackingLayout() {
  return (
    <Stack screenOptions={{
    }}>
      <Stack.Screen
        name="index"
        options={{
          headerTitleAlign: "center",
          headerShadowVisible: false,
          headerTitle: () => {
            return (
              <ThemedText type="subtitle">
                Cá nhân hóa bữa ăn của bạn
              </ThemedText>
            );
          },
        }}
      />
      <Stack.Screen
        name="create-meal-plan"
        options={{
          headerTitleAlign: "center",
          headerShadowVisible: false,
          // headerShown: false,
          headerTitle: () => {
            return (
              <ThemedText type="subtitle">
                Tạo kế hoạch bữa ăn
              </ThemedText>
            );
          },
        }}
      />
      <Stack.Screen
        name="meal-plan-detail"
        options={{
          headerTitleAlign: "center",
          headerShadowVisible: false,
          headerTitle: () => {
            return (
              <ThemedText type="subtitle">
                Chi tiết kế hoạch
              </ThemedText>
            );
          },
        }}
      />
      <Stack.Screen
        name="add-smart-meals"
        options={{
          headerTitleAlign: "center",
          headerShown: false,
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}

export default TrackingLayout;
