
import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function EducationDetail() {
  const params = useLocalSearchParams();

  // Ensure the parameters have the expected keys for an article
  if (
    !params ||
    !params.title ||
    !params.description ||
    !params.category ||
    !params.content
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Error: Article not found or incomplete data.</Text>
      </SafeAreaView>
    );
  }

  const article = {
    id: params.id as string, // Assuming id is also passed and needed
    title: params.title as string,
    description: params.description as string,
    category: params.category as string,
    content: params.content as string,
    // Add other properties if passed and needed (like image, date, etc.)
  };

  // Mock data for elements not in your current article structure
  const mockDate = "Wednesday, January 1, 2025";
  const mockViews = "730";
  const mockReadTime = "2.1 K"; // Assuming this was read time from screenshot, not views
  const mockTime = "6'"; // Assuming this is read time in minutes from screenshot
  // const mockImageUri = nut; // Placeholder image

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* <Image source={nut} style={styles.image} /> */}
        <View style={styles.contentContainer}>
          <Text style={styles.date}>{mockDate}</Text>
          <Text style={styles.category}>{article.category}</Text>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.description}>{article.description}</Text>
          {/* Stats and Icons Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialIcons
                name="visibility"
                size={16}
                color={Colors.text.secondary}
              />
              <Text style={styles.statText}>{mockViews}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons
                name="book"
                size={16}
                color={Colors.text.secondary}
              />
              <Text style={styles.statText}>{mockReadTime}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons
                name="menu-book"
                size={16}
                color={Colors.text.secondary}
              />
              <Text style={styles.statText}>{mockTime}</Text>
            </View>
            <View style={styles.iconRow}>
              <MaterialIcons
                name="bookmark-outline"
                size={20}
                color={Colors.text.secondary}
                style={styles.icon}
              />
              <MaterialIcons
                name="share"
                size={20}
                color={Colors.text.secondary}
                style={styles.icon}
              />
            </View>
          </View>

          {/* Full Article Content */}
          <Text style={styles.fullContent}>{article.content}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  contentContainer: {
    padding: 16,
  },
  date: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  category: {
    color: Colors.primary,
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "bold",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: Colors.text.primary,
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  iconRow: {
    flexDirection: "row",
  },
  icon: {
    marginLeft: 12,
  },
  fullContent: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
  },
});

export default EducationDetail;
