import { ThemedView } from "@/components/ThemedView";
import RecipeListSkeleton from "@/components/explore/RecipeListSkeleton";
import ProductCard from "@/components/ui/ProductCard";
import { RecipeService } from "@/service/recipe.service";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Button,
  HStack,
  Text
} from "@gluestack-ui/themed";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, View } from "react-native";

const screenWidth = Dimensions.get("window").width;

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  notes: string;
}

interface Instruction {
  stepNumber: number;
  instruction: string;
  estimatedTimeMinutes: number;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  image: string;
  cuisineType: string;
  mealType: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficultyLevel: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  allergens: string[];
  allergenFreeClaims: string[];
}

interface RecipeListItem {
  id: string;
  name: string;
  image: string;
}

function CategoryScreen() {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { category } = useLocalSearchParams();
  const router = useRouter();

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      console.log({category});

      const res = await RecipeService.getRecipes(category as string);
      setRecipes(res.data.data.items);
      console.log("Get recipe", res);
      
    } catch (error: any) {
      setError(error.response?.data?.message || "Không thể tải công thức");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  if (loading) {
    return (
      <ThemedView className="flex-1">
        <RecipeListSkeleton categoryName={true} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView className="flex-1 justify-center items-center p-4">
        <MaterialIcons name="error-outline" size={48} color="#f44336" />
        <Text className="text-red-500 text-center mt-4 mb-6">{error}</Text>
        <Button
          onPress={fetchRecipes}
          bgColor="$primary500"
          borderRadius="$md"
          px="$4"
          py="$2"
        >
          <HStack space="sm" alignItems="center">
            <MaterialIcons name="refresh" size={20} color="white" />
            <Text className="text-white font-medium">Thử lại</Text>
          </HStack>
        </Button>
      </ThemedView>
    );
  }


  return (
    <ThemedView className="flex-1 p-7">
      <Text className="text-2xl font-bold mb-4">{category}</Text>
      <FlatList
        data={recipes}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            id={item.id}
            image={item.image}
            name={item.name}
            onPress={() =>  router.push({pathname: "/(tabs)/explore/recipe-detail/[id]", params: {id: item.id}})}
          />
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-500">Không tìm thấy công thức nào</Text>
          </View>
        }
      />
    </ThemedView>
  );
}

export default CategoryScreen;
