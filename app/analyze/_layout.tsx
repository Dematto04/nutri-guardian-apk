import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function AnalyzeLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: 'Phân tích món ăn',
          headerLargeTitle: true,
          headerLeft: () => (
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#f1f5f9',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 8,
              }}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerShadowVisible: true,
        }} 
      />
      <Stack.Screen 
        name="food-info" 
        options={{ 
          headerShown: false,
          title: 'Thông tin món ăn',
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#1e293b',
          },
          headerLeft: () => (
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#f1f5f9',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 8,
              }}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerShadowVisible: true,
        }} 
      />
    </Stack>
  );
}