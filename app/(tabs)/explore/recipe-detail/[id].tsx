// import { RecipeDetailResponseDto } from '@/dtos/recipe/recipe.dto';
import ai_rec from "@/assets/images/ai_re.png";
import MealPlanEntriesDrawer from "@/components/explore/MealPlanEntriesDrawer";
import RecipeDetailSkeleton from "@/components/explore/RecipeDetailSkeleton";
import CookingSteps from "@/components/ui/CookingSteps";
import { RecipeService } from "@/service/recipe.service";
import { recipeDetailStyles as styles } from "@/styles/explore/recipe-detail.style";
import { FavoriteStorage } from "@/utils/favoriteStorage";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const { width } = Dimensions.get("window");

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDrawer, setShowDrawer] = React.useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    console.log({ id });
    
    // Load recipe data and favorite status
    Promise.all([
      RecipeService.getRecipeById(String(id)),
      FavoriteStorage.isFavorite(String(id))
    ])
      .then(([res, favoriteStatus]) => {
        console.log({ res });
        setRecipe(res.data.data);
        setIsFavorite(favoriteStatus);
      })
      .catch((err) => {
        setError("Không thể tải dữ liệu công thức.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
      case "dễ":
        return "#4CAF50";
      case "medium":
      case "trung bình":
        return "#FF9800";
      case "hard":
      case "khó":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const getCuisineIcon = (cuisineType: string) => {
    switch (cuisineType?.toLowerCase()) {
      case "việt nam":
      case "vietnamese":
        return "restaurant-outline";
      case "chinese":
      case "trung quốc":
        return "fish-outline";
      case "japanese":
      case "nhật bản":
        return "leaf-outline";
      default:
        return "restaurant-outline";
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType?.toLowerCase()) {
      case "bữa sáng":
      case "breakfast":
        return "sunny-outline";
      case "bữa trưa":
      case "lunch":
        return "partly-sunny-outline";
      case "bữa tối":
      case "dinner":
        return "moon-outline";
      default:
        return "restaurant-outline";
    }
  };
  const handleAddMeal = (id: string) => {
    setShowDrawer(true);
    console.log(id);
  };

  const handleToggleFavorite = async () => {
    if (!recipe) return;

    try {
      if (isFavorite) {
        // Remove from favorites
        const success = await FavoriteStorage.removeFromFavorites(recipe.id);
        if (success) {
          setIsFavorite(false);
          Alert.alert("Thành công", "Đã xóa khỏi danh sách yêu thích");
        }
      } else {
        // Add to favorites
        const favoriteRecipe = {
          id: recipe.id,
          name: recipe.name,
          thumbnailImageUrl: recipe.thumbnailImageUrl,
          prepTimeMinutes: recipe.prepTimeMinutes,
          cookTimeMinutes: recipe.cookTimeMinutes,
          difficultyLevel: recipe.difficultyLevel,
          servings: recipe.servings,
          cuisineType: recipe.cuisineType,
          mealType: recipe.mealType,
        };
        
        const success = await FavoriteStorage.addToFavorites(favoriteRecipe);
        if (success) {
          setIsFavorite(true);
          Alert.alert("Thành công", "Đã thêm vào danh sách yêu thích");
        } else {
          Alert.alert("Thông báo", "Công thức đã có trong danh sách yêu thích");
        }
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật danh sách yêu thích");
      console.error("Error toggling favorite:", error);
    }
  };

  if (loading) {
    return <RecipeDetailSkeleton />;
  }

  if (error || !recipe) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>
          {error || "Không tìm thấy công thức"}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Recipe Image */}
      <View style={styles.imageContainer}>
        <Image
          source={
            recipe.thumbnailImageUrl
              ? {
                  uri: recipe.thumbnailImageUrl,
                }
              : ai_rec
          }
          style={styles.recipeImage}
          resizeMode="cover"
        />
        
        {/* Action Buttons Container */}
        <View style={styles.actionButtonsContainer}>
          {/* Add to Meal Plan Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.mealPlanButton]}
            onPress={() => handleAddMeal(id as string)}
          >
            <Ionicons
              name="add-circle"
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>
          
          {/* Add to Favorites Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.favoriteButton]}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#FF6B6B" : "#FFF"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* Recipe Title */}
        <Text style={styles.recipeTitle}>{recipe.name || "Tên công thức"}</Text>

        {/* Recipe Info Badges */}
        <View style={styles.infoBadgesContainer}>
          <View style={styles.infoBadge}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoBadgeText}>
              {recipe.prepTimeMinutes || "30"} phút
            </Text>
          </View>

          <View style={styles.infoBadge}>
            <Ionicons name="flame-outline" size={16} color="#666" />
            <Text style={styles.infoBadgeText}>
              {recipe.cookTimeMinutes || "30"} phút nấu
            </Text>
          </View>

          <View
            style={[
              styles.infoBadge,
              {
                backgroundColor:
                  getDifficultyColor(recipe.difficultyLevel) + "20",
              },
            ]}
          >
            <Ionicons
              name="bar-chart-outline"
              size={16}
              color={getDifficultyColor(recipe.difficultyLevel)}
            />
            <Text
              style={[
                styles.infoBadgeText,
                { color: getDifficultyColor(recipe.difficultyLevel) },
              ]}
            >
              {recipe.difficultyLevel || "Trung bình"}
            </Text>
          </View>

          <View style={styles.infoBadge}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.infoBadgeText}>
              {recipe.servings || "4"} người
            </Text>
          </View>
        </View>

        {/* Additional Info Badges */}
        <View style={styles.infoBadgesContainer}>
          {recipe.cuisineType && (
            <View style={styles.infoBadge}>
              <Ionicons
                name={getCuisineIcon(recipe.cuisineType)}
                size={16}
                color="#666"
              />
              <Text style={styles.infoBadgeText}>{recipe.cuisineType}</Text>
            </View>
          )}

          {recipe.mealType && (
            <View style={styles.infoBadge}>
              <Ionicons
                name={getMealTypeIcon(recipe.mealType)}
                size={16}
                color="#666"
              />
              <Text style={styles.infoBadgeText}>{recipe.mealType}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {recipe.description && (
          <View style={styles.section}>
            <Text style={styles.description}>{recipe.description}</Text>
          </View>
        )}

        {/* Author & Source Info */}
        <View style={styles.section}>
          <View style={styles.authorContainer}>
            <View style={styles.authorInfo}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.authorText}>
                {recipe.originalAuthor || "Tác giả không xác định"}
              </Text>
            </View>
            <View style={styles.sourceInfo}>
              <Ionicons name="link-outline" size={20} color="#666" />
              <Text style={styles.sourceText}>
                {recipe.sourceUrl || "Nguồn không xác định"}
              </Text>
            </View>
          </View>
        </View>

        {/* Allergens Section */}
        {recipe.allergens && recipe.allergens.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="warning-outline" size={20} color="#FF6B6B" /> Chất
              gây dị ứng
            </Text>
            <View style={styles.allergensContainer}>
              {recipe.allergens.map((allergen: string, index: number) => (
                <View key={index} style={styles.allergenBadge}>
                  <Ionicons name="alert-circle" size={14} color="#FF6B6B" />
                  <Text style={styles.allergenText}>{allergen}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Allergen-Free Claims */}
        {recipe.allergenFreeClaims && recipe.allergenFreeClaims.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#4CAF50"
              />{" "}
              Không chứa
            </Text>
            <View style={styles.allergenFreeContainer}>
              {recipe.allergenFreeClaims.map((claim: string, index: number) => (
                <View key={index} style={styles.allergenFreeBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                  <Text style={styles.allergenFreeText}>{claim}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Enhanced Ingredients Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nguyên liệu</Text>
          <View style={styles.ingredientsContainer}>
            {recipe.ingredients?.map((ingredient: any, index: number) => (
              <View key={index} style={styles.enhancedIngredientItem}>
                <View style={styles.ingredientHeader}>
                  <View style={styles.ingredientNumber}>
                    <Text style={styles.ingredientNumberText}>
                      {ingredient.orderIndex || index + 1}
                    </Text>
                  </View>
                  <View style={styles.ingredientMainInfo}>
                    <Text style={styles.ingredientName}>
                      {typeof ingredient === "string"
                        ? ingredient
                        : ingredient.name}
                    </Text>
                    {typeof ingredient === "object" && (
                      <View style={styles.ingredientQuantityContainer}>
                        <Text style={styles.ingredientQuantity}>
                          {ingredient.quantity} {ingredient.unit}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                {typeof ingredient === "object" && ingredient.notes && (
                  <View style={styles.ingredientNotes}>
                    <Ionicons
                      name="information-circle-outline"
                      size={14}
                      color="#666"
                    />
                    <Text style={styles.ingredientNotesText}>
                      {ingredient.notes}
                    </Text>
                  </View>
                )}
              </View>
            )) || (
              <Text style={styles.placeholderText}>
                Chưa có thông tin nguyên liệu
              </Text>
            )}
          </View>
        </View>

        {/* Nutrition Information */}
        {recipe.nutrition && recipe.nutrition.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="fitness-outline" size={20} color="#4CAF50" />{" "}
              Thông tin dinh dưỡng
            </Text>
            <View style={styles.nutritionContainer}>
              {recipe.nutrition.map((nutrient: any, index: number) => (
                <View key={index} style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>{nutrient.name}</Text>
                  <Text style={styles.nutritionValue}>
                    {nutrient.amount} {nutrient.unit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Cooking Steps Section */}
        <View style={styles.section}>
          {recipe.instructions && recipe.instructions.length > 0 ? (
            <CookingSteps
              instructions={recipe.instructions}
              onStepComplete={(stepNumber) => {
                console.log(`Step ${stepNumber} completed`);
              }}
            />
          ) : (
            <Text style={styles.placeholderText}>Chưa có hướng dẫn nấu ăn</Text>
          )}
        </View>

        {/* Recipe Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="star-outline" size={20} color="#FFD700" />
              <Text style={styles.statLabel}>Đánh giá</Text>
              <Text style={styles.statValue}>
                {recipe.ratingAverage ? `${recipe.ratingAverage}/5` : "Chưa có"}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={20} color="#FF6B6B" />
              <Text style={styles.statLabel}>Lượt thích</Text>
              <Text style={styles.statValue}>{recipe.likesCount || "0"}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="bookmark-outline" size={20} color="#4CAF50" />
              <Text style={styles.statLabel}>Lưu</Text>
              <Text style={styles.statValue}>{recipe.savesCount || "0"}</Text>
            </View>
          </View>
        </View>

        {/* Recipe Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin khác</Text>
          <View style={styles.metadataContainer}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Loại công thức:</Text>
              <Text style={styles.metadataValue}>
                {recipe.isCustom ? "Tùy chỉnh" : "Công khai"}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Trạng thái:</Text>
              <Text style={styles.metadataValue}>
                {recipe.isPublic ? "Công khai" : "Riêng tư"}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Ngày tạo:</Text>
              <Text style={styles.metadataValue}>
                {new Date(recipe.createAt).toLocaleDateString("vi-VN")}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Cập nhật:</Text>
              <Text style={styles.metadataValue}>
                {new Date(recipe.updateAt).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </View>
      <MealPlanEntriesDrawer
        setShowDrawer={setShowDrawer}
        showDrawer={showDrawer}
        onMealPlanSelected={(mealPlanId: number) => {
          console.log("Selected meal plan:", mealPlanId);
          // Handle meal plan selection logic here
        }}
        recipeId={recipe.id}
      />
    </ScrollView>
  );
}
