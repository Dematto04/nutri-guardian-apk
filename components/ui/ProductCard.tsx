import ai from "@/assets/images/ai_re.png";
import { Colors } from "@/constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";
interface ProductCardProps {
  image: string;
  name: string;
  id: string;
  onPress?: () => void;
}
export default function ProductCard(item: ProductCardProps) {
  return (
    <TouchableOpacity
      style={{
        paddingVertical: 11,
        paddingHorizontal: 17,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#E2E2E2",
        width: "48%",
        marginHorizontal: "1%",
        alignItems: "center",
        justifyContent: "flex-start",

      }}
      onPress={item.onPress}
    >
      <View className="w-full h-fit ">
        <Image
          source={item.image ? {uri : item.image} : ai }
          style={{
            width: "100%",
            borderRadius: 10,
            marginBottom: 8,
            height: 200
          }}
          resizeMode="center"
        />
        <Text className="font-semibold text-start text-lg">{item.name}</Text>
      </View>
      <View
        style={{
          width: "100%",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          flexGrow: 1,
        }}
      >
        <View
          style={{
            backgroundColor: Colors.primary,
            padding: 9,
            borderRadius: 17,
          
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            
          }}
        >
          <AntDesign name="search1" size={24} color="white" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
