import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");
const itemWidth = (width - 6 * 2 - 12) / 2; // padding: 6*2, spacing: 12 between

export default function ExploreSkeleton() {
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

  // Render a single category skeleton item
  const renderCategoryItem = (key: string) => (
    <View key={key} style={styles.categoryItem}>
      <View style={styles.imageContainer}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: shimmerColors
            }
          ]}
        />
      </View>
      <View style={styles.titleContainer}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: shimmerColors
            }
          ]}
        />
      </View>
      
      {/* Overlay gradient for shimmer effect */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ translateX: shimmerTranslateX }]
          }
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {renderCategoryItem('item1')}
        {renderCategoryItem('item2')}
      </View>
      <View style={styles.row}>
        {renderCategoryItem('item3')}
        {renderCategoryItem('item4')}
      </View>
      <View style={styles.row}>
        {renderCategoryItem('item5')}
        {renderCategoryItem('item6')}
      </View>
      <View style={styles.row}>
        {renderCategoryItem('item7')}
        {renderCategoryItem('item8')}
      </View>
      <View style={styles.row}>
        {renderCategoryItem('item9')}
        {renderCategoryItem('item10')}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryItem: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    width: "48%",
    minHeight: 180,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: "relative",
    overflow: "hidden"
  },
  imageContainer: {
    width: "80%",
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#e0e0e0",
    overflow: "hidden",
  },
  titleContainer: {
    width: "70%",
    height: 24,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    overflow: "hidden",
  }
});