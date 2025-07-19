import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, ScrollView, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

/**
 * A skeleton loader component for the Recipe Detail screen
 * This provides a nice visual placeholder while data is being fetched
 */
export default function RecipeDetailSkeleton() {
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
    
    return () => {
      animateShimmer.stop();
    };
  }, [shimmerAnimation]);
  
  // Calculate the interpolated colors for shimmer effect
  const shimmerColors = shimmerAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["#E0E0E0", "#F5F5F5", "#E0E0E0"],
  });
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image skeleton */}
      <View style={styles.imageSkeleton}>
        <Animated.View style={styles.imageShimmer}>
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              { 
                transform: [{ 
                  translateX: shimmerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-width, width],
                  })
                }]
              }
            ]}
          >
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        </Animated.View>
      </View>

      <View style={styles.contentContainer}>
        {/* Title skeleton */}
        <View style={styles.titleSkeleton}>
          <Animated.View
            style={[
              styles.titleGradient,
              {
                backgroundColor: shimmerColors
              }
            ]}
          />
        </View>

        {/* Info badges skeleton */}
        <View style={styles.infoBadgesContainer}>
          {[...Array(4)].map((_, index) => (
            <View key={`info-${index}`} style={styles.badgeSkeleton}>
              <Animated.View
                style={[
                  styles.badgeGradient,
                  {
                    backgroundColor: shimmerColors
                  }
                ]}
              />
            </View>
          ))}
        </View>

        {/* Additional badges skeleton */}
        <View style={styles.infoBadgesContainer}>
          {[...Array(2)].map((_, index) => (
            <View key={`additional-${index}`} style={styles.badgeSkeleton}>
              <Animated.View
                style={[
                  styles.badgeGradient,
                  {
                    backgroundColor: shimmerColors
                  }
                ]}
              />
            </View>
          ))}
        </View>

        {/* Description skeleton */}
        <View style={styles.section}>
          {[...Array(3)].map((_, index) => (
            <View key={`desc-${index}`} style={styles.descriptionLineSkeleton}>
              <Animated.View
                style={[
                  styles.lineGradient,
                  {
                    backgroundColor: shimmerColors
                  }
                ]}
              />
            </View>
          ))}
        </View>

        {/* Author skeleton */}
        <View style={styles.section}>
          <View style={styles.authorContainer}>
            <View style={styles.authorSkeleton}>
              <Animated.View
                style={[
                  styles.authorGradient,
                  {
                    backgroundColor: shimmerColors
                  }
                ]}
              />
            </View>
            <View style={styles.authorSkeleton}>
              <Animated.View
                style={[
                  styles.authorGradient,
                  {
                    backgroundColor: shimmerColors
                  }
                ]}
              />
            </View>
          </View>
        </View>

        {/* Ingredients section skeleton */}
        <View style={styles.section}>
          <View style={styles.sectionTitleSkeleton}>
            <Animated.View
              style={[
                styles.sectionTitleGradient,
                {
                  backgroundColor: shimmerColors
                }
              ]}
            />
          </View>
          
          <View style={styles.ingredientsContainer}>
            {[...Array(5)].map((_, index) => (
              <View key={`ingredient-${index}`} style={styles.ingredientSkeleton}>
                <View style={styles.ingredientNumberSkeleton} />
                <View style={styles.ingredientContentSkeleton}>
                  <View style={styles.ingredientNameSkeleton}>
                    <Animated.View
                      style={[
                        styles.lineGradient,
                        {
                          backgroundColor: shimmerColors
                        }
                      ]}
                    />
                  </View>
                  <View style={styles.ingredientQuantitySkeleton}>
                    <Animated.View
                      style={[
                        styles.lineGradient,
                        {
                          backgroundColor: shimmerColors
                        }
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Cooking steps section skeleton */}
        <View style={styles.section}>
          <View style={styles.sectionTitleSkeleton}>
            <Animated.View
              style={[
                styles.sectionTitleGradient,
                {
                  backgroundColor: shimmerColors
                }
              ]}
            />
          </View>
          
          <View style={styles.stepsContainer}>
            {[...Array(3)].map((_, index) => (
              <View key={`step-${index}`} style={styles.stepSkeleton}>
                <View style={styles.stepNumberSkeleton} />
                <View style={styles.stepContentSkeleton}>
                  {[...Array(3)].map((_, lineIndex) => (
                    <View key={`step-line-${lineIndex}`} style={styles.stepLineSkeleton}>
                      <LinearGradient
                        colors={["#E0E0E0", "#F5F5F5", "#E0E0E0"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.lineGradient}
                      />
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Stats section skeleton */}
        <View style={styles.section}>
          <View style={styles.sectionTitleSkeleton}>
            <Animated.View
              style={[
                styles.sectionTitleGradient,
                {
                  backgroundColor: shimmerColors
                }
              ]}
            />
          </View>
          
          <View style={styles.statsContainer}>
            {[...Array(3)].map((_, index) => (
              <View key={`stat-${index}`} style={styles.statSkeleton}>
                <View style={styles.statIconSkeleton} />
                <View style={styles.statLabelSkeleton}>
                  <LinearGradient
                    colors={["#E0E0E0", "#F5F5F5", "#E0E0E0"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.lineGradient}
                  />
                </View>
                <View style={styles.statValueSkeleton}>
                  <LinearGradient
                    colors={["#E0E0E0", "#F5F5F5", "#E0E0E0"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.lineGradient}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  imageSkeleton: {
    width: "100%",
    height: 300,
    backgroundColor: "#EEEEEE",
    position: "relative",
    overflow: "hidden",
  },
  contentContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  titleSkeleton: {
    height: 32,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  titleGradient: {
    width: '80%',
    height: '100%',
    overflow: 'hidden',
  },
  infoBadgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  badgeSkeleton: {
    height: 36,
    width: 100,
    borderRadius: 20,
    overflow: 'hidden',
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
  },
  section: {
    marginBottom: 32,
  },
  descriptionLineSkeleton: {
    height: 16,
    marginBottom: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  lineGradient: {
    width: '100%',
    height: '100%',
  },
  authorContainer: {
    gap: 12,
  },
  authorSkeleton: {
    height: 20,
    marginBottom: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  authorGradient: {
    width: '60%',
    height: '100%',
  },
  sectionTitleSkeleton: {
    height: 26,
    marginBottom: 16,
    borderRadius: 6,
    overflow: 'hidden',
  },
  sectionTitleGradient: {
    width: '40%',
    height: '100%',
  },
  ingredientsContainer: {
    gap: 16,
  },
  ingredientSkeleton: {
    flexDirection: 'row',
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#EEEEEE",
    gap: 12,
    marginBottom: 8,
  },
  ingredientNumberSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
  },
  ingredientContentSkeleton: {
    flex: 1,
    gap: 8,
  },
  ingredientNameSkeleton: {
    height: 18,
    borderRadius: 4,
    overflow: 'hidden',
  },
  ingredientQuantitySkeleton: {
    height: 16,
    width: '40%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  stepsContainer: {
    gap: 20,
  },
  stepSkeleton: {
    flexDirection: 'row',
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  stepNumberSkeleton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E0E0E0",
  },
  stepContentSkeleton: {
    flex: 1,
    gap: 8,
  },
  stepLineSkeleton: {
    height: 16,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
  },
  statSkeleton: {
    alignItems: 'center',
    gap: 6,
  },
  statIconSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
  },
  statLabelSkeleton: {
    height: 12,
    width: 40,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statValueSkeleton: {
    height: 16,
    width: 30,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bottomSpacing: {
    height: 40,
  },
  imageShimmer: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    overflow: 'hidden',
  },
});
