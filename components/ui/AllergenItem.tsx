import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AllergenItemProps {
  id: number;
  name: string;
  category: string;
  description: string;
  isFdaMajor: boolean;
  isEuMajor: boolean;
  onPress: () => void;
}

export default function AllergenItem({
  id,
  name,
  category,
  description,
  isFdaMajor,
  isEuMajor,
  onPress,
}: AllergenItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.badges}>
            {isFdaMajor && (
              <View style={styles.fdaBadge}>
                <Text style={styles.fdaBadgeText}>FDA</Text>
              </View>
            )}
            {isEuMajor && (
              <View style={styles.euBadge}>
                <Text style={styles.euBadgeText}>EU</Text>
              </View>
            )}
          </View>
        </View>
        
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.readMore}>Xem chi tiết</Text>
          <MaterialIcons name="chevron-right" size={20} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
    flex: 1,
  },
  badges: {
    flexDirection: "row",
    gap: 4,
  },
  fdaBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fdaBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  euBadge: {
    backgroundColor: "#5856D6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  euBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  category: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readMore: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
});
