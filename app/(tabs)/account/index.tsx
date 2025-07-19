import { AuthService } from "@/service/auth.service";
import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Account {
  userId: number;
  email: string;
  fullName: string;
  profileImageUrl: string | null;
  subscriptionTier: string | null;
  subscriptionStatus: string | null;
  subscriptionExpiresAt: string | null;
  lastLoginAt: string;
  token: string;
  refreshToken: string;
  tokenExpiresAt: string;
}

const menuItems = [
  {
    key: "info",
    label: "Thông tin cá nhân",
    icon: <FontAwesome5 name="user" size={20} color="#222" />,
    rightIcon: <Ionicons name="chevron-forward" size={20} color="#222" />,
    route: "profile",
  },
  {
    key: "membership",
    label: "Gói thành viên Nutri Guardian",
    icon: (
      <MaterialCommunityIcons name="shield-account" size={20} color="#7DE1EF" />
    ),
    rightIcon: <Ionicons name="chevron-forward" size={20} color="#222" />,
    route: "subscription",
  },
  {
    key: "allergenProfile",
    label: "Hồ sơ dị ứng",
    icon: (
      <MaterialCommunityIcons name="shield-alert" size={20} color="#FF9800" />
    ),
    rightIcon: <Ionicons name="chevron-forward" size={20} color="#222" />,
    route: "allergen-profile",
  },
  {
    key: "notifications",
    label: "Thông báo",
    icon: <Ionicons name="notifications-outline" size={20} color="#222" />,
    rightIcon: <Ionicons name="chevron-forward" size={20} color="#222" />,
    route: "profile",
  },
  {
    key: "help",
    label: "Trợ giúp & hỗ trợ",
    icon: <Ionicons name="help-circle-outline" size={20} color="#222" />,
    rightIcon: <Ionicons name="chevron-forward" size={20} color="#222" />,
    route: "profile", // Will show in profile until separate screen is created
  },
];

function AccountScreen() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    const getAccount = async () => {
      try {
        const acc = await AsyncStorage.getItem("user");
        if (!acc) {
          console.log("No account found in storage");
          return;
        }
        const parsedAccount = JSON.parse(acc) as Account;
        setAccount(parsedAccount);
      } catch (error) {
        console.error("Error loading account:", error);
      }
    };
    getAccount();
  }, []);

  const handleLogout = async () => {
    await AuthService.logout();
    router.replace("/(auth)/login");
  };

  if (!account) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>Loading account information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32, marginTop: 16 }}>
        {/* Profile */}
        <View style={styles.profileCard}>
          <Image
            source={
              account.profileImageUrl
                ? { uri: account.profileImageUrl }
                : require("../../../assets/images/default-avatar.webp")
            }
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.profileName}>{account.fullName}</Text>
              <Feather
                name="edit-2"
                size={14}
                color="#7DE1EF"
                style={{ marginLeft: 4 }}
              />
            </View>
            <Text style={styles.profileEmail}>{account.email}</Text>
            {account.subscriptionStatus && (
              <Text
                style={[
                  styles.profileEmail,
                  { color: "#7DE1EF", marginTop: 4 },
                ]}
              >
                {account.subscriptionTier} Member
              </Text>
            )}
          </View>
        </View>
        {/* Menu */}
        <View style={styles.menuCard}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuRow}
              activeOpacity={0.7}
                              onPress={() => router.push(`/(tabs)/account/${item.route}` as any)}
            >
              <View style={styles.menuIcon}>{item.icon}</View>
              <Text
                style={[
                  styles.menuLabel,
                  item.key === "membership" && {
                    color: "#7DE1EF",
                    fontWeight: "700",
                  },
                ]}
              >
                {item.label}
              </Text>
              <View style={{ flex: 1 }} />
              {item.rightIcon}
            </TouchableOpacity>
          ))}
        </View>
        {/* Log Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons
            name="log-out-outline"
            size={22}
            color="#7DE1EF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: 30,
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 16,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  profileEmail: {
    fontSize: 13,
    color: "#A0A0A0",
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
    paddingHorizontal: 12,
  },
  menuIcon: {
    width: 28,
    alignItems: "center",
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 15,
    color: "#222",
    fontWeight: "600",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
    borderRadius: 12,
    marginHorizontal: 32,
    marginTop: 24,
    paddingVertical: 18,
    justifyContent: "center",
  },
  logoutText: {
    color: "#7DE1EF",
    fontSize: 17,
    fontWeight: "600",
  },
});

export default AccountScreen;
