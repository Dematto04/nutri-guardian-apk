import LoadingComponent from "@/components/Loading";
import ProfileHeader from "@/components/ProfileHeader";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  Badge,
  BadgeText,
  Box,
  Card,
  Center,
  Divider,
  Heading,
  HStack,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, RefreshControl } from "react-native";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const getUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedUser = await AsyncStorage.getItem("user");
      if (!storedUser) {
        Toast.show({
          type: "error",
          text1: "Không tải được dữ liệu người dùng!",
          text2: "Hãy đăng nhập lại",
        });
        return;
      }
      setUser(JSON.parse(storedUser));
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi tải dữ liệu",
        text2: "Vui lòng thử lại sau",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getUser();
    setRefreshing(false);
  }, [getUser]);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "Chưa có thông tin";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getSubscriptionBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "expired":
        return "error";
      case "pending":
        return "warning";
      default:
        return "muted";
    }
  };

  const getSubscriptionStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "Đang hoạt động";
      case "expired":
        return "Đã hết hạn";
      case "pending":
        return "Đang chờ";
      default:
        return "Không xác định";
    }
  };

  const handleEditProfile = () => {
    Toast.show({
      type: "info",
      text1: "Chỉnh sửa hồ sơ",
      text2: "Tính năng đang được phát triển",
    });
  };

  const handleSettings = () => {
    Toast.show({
      type: "info",
      text1: "Cài đặt",
      text2: "Tính năng đang được phát triển",
    });
  };

  if (isLoading) {
    return (
      <Box flex={1} bg="$backgroundLight0">
        <ProfileHeader
          showBackButton={false}
          showEditButton={false}
          showSettingsButton={false}
          scrollY={scrollY}
        />
        <Center flex={1}>
          <LoadingComponent text1="Đang tải thông tin cá nhân..." />
        </Center>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box flex={1} bg="$backgroundLight0">
        <ProfileHeader
          title="Lỗi tải dữ liệu"
          subtitle="Không thể tải thông tin người dùng"
          showEditButton={false}
          showSettingsButton={false}
          scrollY={scrollY}
        />
        <Center flex={1}>
          <VStack space="md" alignItems="center">
            <Ionicons name="person-circle-outline" size={64} color="#ef4444" />
            <Text size="lg" color="$error500">
              Không thể tải thông tin người dùng
            </Text>
            <Text size="sm" color="$textLight600" textAlign="center">
              Vui lòng đăng nhập lại để tiếp tục
            </Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$backgroundLight0">
      <Animated.ScrollView
        onScroll={Animated.event([
          {
            nativeEvent: {
              contentOffset: {
                y: scrollY,
              },
            },
          },
        ], 
        {
          useNativeDriver: false
        })}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ProfileHeader
          title="Hồ sơ cá nhân"
          subtitle={`Xin chào, ${user.fullName || "Người dùng"}!`}
          onEditPress={handleEditProfile}
          onSettingsPress={handleSettings}
          scrollY={scrollY}
        />
        <VStack space="lg" p="$4" pt="$6">
          {/* User Avatar and Basic Info */}
          <Card size="lg" variant="elevated" bg="$white">
            <VStack space="md" alignItems="center" p="$5">
              <Avatar size="2xl" bg="$primary600">
                {user.profileImageUrl && (
                  <AvatarImage source={{ uri: user.profileImageUrl }} />
                )}
                <AvatarFallbackText color="$white">
                  {user.fullName || "User"}
                </AvatarFallbackText>
              </Avatar>

              <VStack space="xs" alignItems="center">
                <Heading size="xl" color="$textLight900">
                  {user.fullName || "Người dùng"}
                </Heading>
                <HStack space="xs" alignItems="center">
                  <Ionicons name="person" size={16} color="#6b7280" />
                  <Text size="sm" color="$textLight600">
                    ID: {user.userId}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Card>

          {/* Contact Information */}
          <Card size="lg" variant="elevated">
            <VStack space="md" p="$5">
              <Heading size="lg" color="$textLight900">
                Thông tin liên hệ
              </Heading>
              <Divider />

              <HStack space="md" alignItems="center">
                <Box bg="$blue100" p="$2" rounded="$md">
                  <MaterialIcons name="email" size={24} color="#2563eb" />
                </Box>
                <VStack flex={1}>
                  <Text size="sm" color="$textLight600">
                    Email
                  </Text>
                  <Text size="md" color="$textLight900" fontWeight="$medium">
                    {user.email || "Chưa cập nhật"}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Card>

          {/* Subscription Information */}
          <Card size="lg" variant="elevated">
            <VStack space="md" p="$5">
              <HStack justifyContent="space-between" alignItems="center">
                <Heading size="lg" color="$textLight900">
                  Thông tin gói dịch vụ
                </Heading>
                <Badge
                  size="md"
                  variant="solid"
                  action={getSubscriptionBadgeVariant(user.subscriptionStatus)}
                >
                  <BadgeText>
                    {getSubscriptionStatusText(user.subscriptionStatus)}
                  </BadgeText>
                </Badge>
              </HStack>
              <Divider />

              <VStack space="lg">
                {/* Subscription Tier */}
                <HStack space="md" alignItems="center">
                  <Box bg="$purple100" p="$2" rounded="$md">
                    <Ionicons name="card" size={24} color="#9333ea" />
                  </Box>
                  <VStack flex={1}>
                    <Text size="sm" color="$textLight600">
                      Gói dịch vụ
                    </Text>
                    <Text size="md" color="$textLight900" fontWeight="$medium">
                      {user.subscriptionTier || "Gói miễn phí"}
                    </Text>
                  </VStack>
                </HStack>

                {/* Expiration Date */}
                <HStack space="md" alignItems="center">
                  <Box bg="$orange100" p="$2" rounded="$md">
                    <Ionicons name="calendar" size={24} color="#ea580c" />
                  </Box>
                  <VStack flex={1}>
                    <Text size="sm" color="$textLight600">
                      Ngày hết hạn
                    </Text>
                    <Text size="md" color="$textLight900" fontWeight="$medium">
                      {formatDate(user.subscriptionExpiresAt)}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </Card>

          {/* Activity Information */}
          <Card size="lg" variant="elevated">
            <VStack space="md" p="$5">
              <HStack space="xs" alignItems="center">
                <Ionicons name="pulse" size={20} color="#16a34a" />
                <Heading size="lg" color="$textLight900">
                  Hoạt động gần đây
                </Heading>
              </HStack>
              <Divider />

              <HStack space="md" alignItems="center">
                <Box bg="$green100" p="$2" rounded="$md">
                  <Ionicons name="time" size={24} color="#16a34a" />
                </Box>
                <VStack flex={1}>
                  <Text size="sm" color="$textLight600">
                    Lần đăng nhập cuối
                  </Text>
                  <Text size="md" color="$textLight900" fontWeight="$medium">
                    {formatDate(user.lastLoginAt)}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Card>

          {/* Health Status Card for Allergy App */}
          <Card size="lg" variant="elevated" bg="$success50">
            <VStack space="md" p="$5">
              <HStack space="xs" alignItems="center">
                <FontAwesome5 name="shield-alt" size={18} color="#16a34a" />
                <Heading size="lg" color="$success900">
                  Trạng thái sức khỏe
                </Heading>
              </HStack>
              <Divider />

              <VStack space="sm">
                <HStack space="xs" alignItems="center">
                  <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                  <Text size="md" color="$success800" fontWeight="$medium">
                    Hồ sơ dị ứng đã được cập nhật
                  </Text>
                </HStack>
                <Text size="sm" color="$success700">
                  Thông tin của bạn giúp chúng tôi cung cấp dịch vụ tốt nhất
                </Text>
              </VStack>

              {/* Additional Health Info */}
              <VStack space="sm" mt="$3">
                <HStack space="md" alignItems="center">
                  <Box bg="$success100" p="$2" rounded="$md">
                    <FontAwesome5 name="heartbeat" size={16} color="#16a34a" />
                  </Box>
                  <VStack flex={1}>
                    <Text size="sm" color="$success700">
                      Tình trạng dị ứng
                    </Text>
                    <Text size="md" color="$success800" fontWeight="$medium">
                      Đang theo dõi
                    </Text>
                  </VStack>
                </HStack>

                <HStack space="md" alignItems="center">
                  <Box bg="$success100" p="$2" rounded="$md">
                    <MaterialIcons
                      name="medical-services"
                      size={20}
                      color="#16a34a"
                    />
                  </Box>
                  <VStack flex={1}>
                    <Text size="sm" color="$success700">
                      Cập nhật cuối
                    </Text>
                    <Text size="md" color="$success800" fontWeight="$medium">
                      Hôm nay
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </Card>

          {/* Emergency Contact Card */}
          <Card size="lg" variant="elevated" bg="$red50">
            <VStack space="md" p="$5">
              <HStack space="xs" alignItems="center">
                <MaterialIcons name="emergency" size={20} color="#dc2626" />
                <Heading size="lg" color="$red900">
                  Liên hệ khẩn cấp
                </Heading>
              </HStack>
              <Divider />

              <HStack space="md" alignItems="center">
                <Box bg="$red100" p="$2" rounded="$md">
                  <Ionicons name="call" size={20} color="#dc2626" />
                </Box>
                <VStack flex={1}>
                  <Text size="sm" color="$red700">
                    Hotline dị ứng 24/7
                  </Text>
                  <Text size="md" color="$red800" fontWeight="$medium">
                    1900 1234
                  </Text>
                </VStack>
                <Ionicons name="chevron-forward" size={20} color="#dc2626" />
              </HStack>
            </VStack>
          </Card>
        </VStack>
      </Animated.ScrollView>
    </Box>
  );
}
