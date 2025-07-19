import { Ionicons } from "@expo/vector-icons";
import {
    HStack,
    Pressable,
    Text,
    VStack
} from "@gluestack-ui/themed";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ProfileHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showEditButton?: boolean;
  showSettingsButton?: boolean;
  scrollY: Animated.Value;
  onEditPress?: () => void;
  onSettingsPress?: () => void;
}

export default function ProfileHeader({
  title = "Hồ sơ cá nhân",
  subtitle = "Quản lý thông tin của bạn",
  showBackButton = true,
  showEditButton = true,
  showSettingsButton = true,
  onEditPress,
  onSettingsPress,
  scrollY,
}: ProfileHeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 100],
    extrapolate: "clamp",
  });

  const titleFontSize = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [28, 20],
    extrapolate: "clamp",
  });

  const subtitleOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={{
        backgroundColor: "#3b82f6", // $primary400 fallback
        paddingTop: insets.top + 12,
        paddingBottom: 24,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        height: headerHeight,
      }}
    >
      {/* Top Row */}
      <HStack justifyContent="space-between" alignItems="center" mb="$3">
        <HStack space="md" alignItems="center">
          {showBackButton && (
            <Pressable
              onPress={() => navigation.goBack()}
              bg="$primary500"
              p="$2"
              rounded="$full"
            >
              <Ionicons name="chevron-back" size={20} color="white" />
            </Pressable>
          )}
        </HStack>

        <HStack space="sm" alignItems="center">
          {showEditButton && (
            <Pressable
              onPress={onEditPress}
              bg="$primary500"
              p="$2"
              rounded="$full"
            >
              <Ionicons name="create-outline" size={20} color="white" />
            </Pressable>
          )}
          {showSettingsButton && (
            <Pressable
              onPress={onSettingsPress}
              bg="$primary500"
              p="$2"
              rounded="$full"
            >
              <Ionicons name="settings-outline" size={20} color="white" />
            </Pressable>
          )}
        </HStack>
      </HStack>

      {/* Title */}
      <VStack space="xs" alignItems="center">
        <Animated.Text
          style={{
            fontSize: titleFontSize,
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {title}
        </Animated.Text>
        <Animated.Text
          style={{
            fontSize: 14,
            color: "#bfdbfe", // $primary100
            textAlign: "center",
            opacity: subtitleOpacity,
          }}
        >
          {subtitle}
        </Animated.Text>
      </VStack>

      {/* Status */}
      <HStack
        justifyContent="center"
        alignItems="center"
        mt="$3"
        bg="$success500"
        py="$1"
        px="$3"
        rounded="$full"
        alignSelf="center"
      >
        <Ionicons name="shield-checkmark" size={16} color="white" />
        <Text size="xs" color="$white" ml="$1" fontWeight="$medium">
          Hồ sơ dị ứng đã cập nhật
        </Text>
      </HStack>
    </Animated.View>
  );
}
