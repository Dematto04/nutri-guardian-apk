import { SubscriptionService } from "@/service/subscription.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedButton } from "./ThemedButton";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface SubscriptionGateProps {
  title?: string;
  description?: string;
  featureName?: string;
  showUpgradeButton?: boolean;
  onUpgrade?: () => void;
  children: any;
}

export function SubscriptionGate({
  title,
  description,
  featureName,
  showUpgradeButton = true,
  onUpgrade,
  children,
}: SubscriptionGateProps) {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push("/(tabs)/account/subscription" as any);
    }
  };
  const getSubStatus = async () => {
    const res = await SubscriptionService.getSubscriptionStatus();
    if (res.isSucceeded) {
      setIsPremium(res.data.hasActiveSubscription);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getSubStatus();
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      {!isPremium ? (
        <>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={48} color="#FF9500" />
          </View>
          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText style={styles.description}>{description}</ThemedText>
          {featureName && (
            <View style={styles.featureContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <ThemedText style={styles.featureText}>
                Tính năng Premium: {featureName}
              </ThemedText>
            </View>
          )}
          {showUpgradeButton && (
            <ThemedButton
              title="Nâng cấp ngay"
              onPress={handleUpgrade}
              style={styles.upgradeButton}
            />
          )}{" "}
        </>
      ) : (
        children
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
    lineHeight: 24,
  },
  featureContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF8DC",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  featureText: {
    fontSize: 14,
    color: "#B8860B",
    fontWeight: "500",
  },
  upgradeButton: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 32,
  },
});
