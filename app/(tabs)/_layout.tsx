import ai_rec from "@/assets/images/ai_re.png";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { UserAllergyService } from "@/service/userAllergy.service";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import { Fab, Image } from "@gluestack-ui/themed";
import { useIsFocused } from "@react-navigation/native";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isFocused = useIsFocused()
  const router = useRouter()
  const [showFab, setShowFab] = useState(true);
  
  useEffect(()=> {
    const checkUserHasProfile = async () => {
      const res = await UserAllergyService.userHasAllergies()
      console.log({res});
      
      if(res.status === 200){
        if(!res.data.hasAllergies) {
          router.push('/quiz/quiz-welcome')
        }
      }
    }
    checkUserHasProfile()
  }, [isFocused])
  
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        initialRouteName="explore"
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
        }}
      >
        <Tabs.Screen
          name="education"
          options={{
            title: "Education",
            tabBarLabel: "Tìm hiểu",
            tabBarIcon: ({ color }) => (
              <Feather name="book" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarLabel: "Tìm món",
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="manage-search" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="tracking"
          options={{
            title: "Tracking",
            tabBarLabel: "Theo dõi",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="navigation-variant-outline"
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="favourite"
          options={{
            title: "Favourite",
            tabBarLabel: "Yêu thích",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="heart.fill" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="account"
          options={{
            title: "Account",
            tabBarLabel: "Tài khoản",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.fill" color={color} />
            ),
          }}
        />
      </Tabs>
      
      {/* Floating Action Button với nút X */}
      {showFab && (
        <View style={styles.fabContainer}>
          <Pressable 
            style={styles.closeFab}
            
            onPress={() => setShowFab(false)}
          >
            <Ionicons name="close" size={10} color={Colors.text.light} />
          </Pressable>
          <Fab
            size="md"
            style={[styles.fab, { backgroundColor: "#ffffff" }]}
            onPress={() => router.push('/chat')}
          >
            <Image source={ai_rec} width={35} height={35}/>
          </Fab>
        </View>
      )}
      
      {/* Debug component cho development */}
      {/* <OnboardingDebug />  */}
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  fab: {
    position: 'relative',
  },
  closeFab: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 16,
    height: 16,
    transform: "translateX(6px)",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
