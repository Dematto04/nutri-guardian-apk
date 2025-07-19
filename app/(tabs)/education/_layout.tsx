import { Stack } from 'expo-router';
import React from 'react';

function EducationLayout() {

  return (
    <Stack screenOptions={{}}>
      <Stack.Screen
        name="index"
        options={{
          headerTitleAlign: "center",
          headerShadowVisible: false,
          headerShown: false
        }}
      />
      <Stack.Screen
        name="educationDetail"
        options={{
            headerShown: false
        }}
      />
      <Stack.Screen
        name="allergenDetail"
        options={{
          title: "Thông tin Allergen",
          headerTitleAlign: "center",
          headerShadowVisible: false,
        }}
      />
    </Stack>
  )
}

export default EducationLayout
