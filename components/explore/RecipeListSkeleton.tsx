import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");
const cardWidth = (width - 14 - 10) / 2; // Matching the width in the category screen

export default function RecipeListSkeleton({
  categoryName = true,
}: {
  categoryName?: boolean;
}) {
  // Animation for shimmer effect
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  // Start the shimmer animation
  useEffect(() => {
    const animateShimmer = Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      })
    );

    animateShimmer.start();

    return () => animateShimmer.stop();
  }, []);

  // Calculate the interpolated colors for shimmer effect
  const shimmerColors = shimmerAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["#E0E0E0", "#F5F5F5", "#E0E0E0"],
  });

  // Create a shimmer effect that moves across the entire component
  const shimmerTranslateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  // Render a single recipe card skeleton
  const renderRecipeCard = (key: string) => (
    <View key={key} style={styles.recipeCard}>
      {/* Image placeholder */}
      <View style={styles.imageContainer}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: shimmerColors }]}
        />
      </View>

      {/* Name placeholder */}
      <View style={styles.contentContainer}>
        <View style={styles.nameContainer}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: shimmerColors },
            ]}
          />
        </View>
      </View>

      {/* Overlay gradient for shimmer effect */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateX: shimmerTranslateX }] },
        ]}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.4)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Category title skeleton */}
      {categoryName && (
        <View style={styles.titleContainer}>
          <Animated.View
            style={[styles.titleSkeleton, { backgroundColor: shimmerColors }]}
          />
        </View>
      )}

      {/* Recipe cards grid */}
      <View style={styles.cardsContainer}>
        <View style={styles.row}>
          {renderRecipeCard("recipe1")}
          {renderRecipeCard("recipe2")}
        </View>
        <View style={styles.row}>
          {renderRecipeCard("recipe3")}
          {renderRecipeCard("recipe4")}
        </View>
        <View style={styles.row}>
          {renderRecipeCard("recipe5")}
          {renderRecipeCard("recipe6")}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 7,
  },
  titleContainer: {
    marginBottom: 16,
  },
  titleSkeleton: {
    height: 32,
    width: "70%",
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
  cardsContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  recipeCard: {
    width: cardWidth,
    height: 180,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
    position: "relative",
  },
  imageContainer: {
    height: "70%",
    width: "100%",
    backgroundColor: "#E0E0E0",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },
  contentContainer: {
    height: "30%",
    width: "100%",
    padding: 10,
    justifyContent: "center",
  },
  nameContainer: {
    height: 16,
    width: "80%",
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
  },
});
