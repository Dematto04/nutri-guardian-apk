import { Stack } from 'expo-router'
import React from 'react'



function FavouriteLayout() {
    
  return (
    <Stack
        screenOptions={{
            headerStyle: {
              backgroundColor: '#FFF',
            },
            headerTintColor: '#2C3E50',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
        }}
    >
        <Stack.Screen
            name='index'
            options={{
                title: "Yêu Thích",
                headerTitleAlign: "center"
            }}
        />
    </Stack>
  )
}

export default FavouriteLayout


