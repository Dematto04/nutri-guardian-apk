import nut from "@/assets/images/peanut.jpg";
import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
interface ArticleProps {
  title: string;
  description: string;
  category: string;
  onPress?: ()=> void
}

const Article: React.FC<ArticleProps> = ({ title, description, category, onPress}) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Image
        source={nut}
        style={styles.image}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.date}>Wednesday, January 1, 2025</Text>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialIcons
              name="visibility"
              size={16}
              color={Colors.text.secondary}
            />
            <Text style={styles.statText}>730</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons
              name="book"
              size={16}
              color={Colors.text.secondary}
            />
            <Text style={styles.statText}>2.1 K</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons
              name="menu-book"
              size={16}
              color={Colors.text.secondary}
            />
            <Text style={styles.statText}>6&apos;</Text>
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
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    marginVertical: 8,
    overflow: "hidden", // This is important to respect borderRadius with the image
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 200, // Adjust height as needed
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: Colors.text.primary,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
});

export default Article;
