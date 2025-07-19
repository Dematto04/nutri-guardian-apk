import lemon from "@/assets/images/lemon.png";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Detail() {
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        marginTop: 31,
      }}
    >
      <View
        style={{
          backgroundColor: "#d4f3fb",
          height: 490,
          width: 490,
          borderRadius: "100%",
          position: "absolute",
          top: "-25%",
        }}
      ></View>
      <View className="items-start w-full px-4">
        <Pressable onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </Pressable>
      </View>
      <Image
        source={lemon}
        className="w-80 h-80 mt-10 mb-9"
        resizeMode="contain"
      />
      <View
        style={{
          backgroundColor: "#F4F5F9",
          flex: 1,
          width: "100%",
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          paddingHorizontal: 16,
          paddingVertical: 30,
        }}
      >
        <TouchableOpacity>
          <AntDesign
            name="hearto"
            size={24}
            color="black"
            style={{
              alignSelf: "flex-end",
            }}
          />
        </TouchableOpacity>
        <ThemedText type="subtitle">Organic Lemons</ThemedText>
        <ThemedText
          style={{
            fontWeight: 600,
            color: "#868889",
            fontSize: 12,
          }}
        >
          1.50 lbs
        </ThemedText>
        <View className="flex-row items-center mt-3">
          <Text className="text-yellow-500 text-lg font-semibold">4.5</Text>
          <Text className="ml-2 text-sm text-gray-600">(89 reviews)</Text>
        </View>
        <ScrollView>
          <Text>
            Organic Mountain works as a seller for many organic growers of
            organic lemons. Organic lemons are easy to spot in your produce
            aisle. They are just like regular lemons, but they will usually have
            a few more scars on the outside of the lemon skin. Organic lemons
            are considered to be the world's finest lemon for juicing
          </Text>
        </ScrollView>
        <TouchableOpacity
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Colors.primary,
            minHeight: 60,
            borderRadius: 10,
            position: 'relative'
          }}
        >
          <ThemedText
            style={{
              color: Colors.light.background,
              textAlign: "center" 
            }}
          >
            Add to favourite
          </ThemedText>
          <AntDesign
            name="hearto"
            size={24}
            color={Colors.light.background}
            style={{
              alignSelf: "flex-end",
              position: "absolute",
              right: "5%",
              top: "auto"
            }}
          />
        </TouchableOpacity>
      </View>
      <Pressable className="absolute top-12 left-4">
        {/* <ChevronLeft size={28} color="black" /> */}
      </Pressable>
    </View>
  );
}
