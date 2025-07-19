import { Colors } from "@/constants/Colors";
import { AllergenService } from "@/service/allergen.service";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AllergenItem from "../../../components/ui/AllergenItem";

interface Allergen {
  id: number;
  name: string;
  category: string;
  scientificName: string;
  description: string;
  isFdaMajor: boolean;
  isEuMajor: boolean;
  createdAt: string;
  updatedAt: string | null;
}

function EducationScreen() {
  const router = useRouter();
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch allergens and categories in parallel
      const [allergensResponse, categoriesResponse] = await Promise.all([
        AllergenService.getAllAllergen(),
        AllergenService.getAllergenCategories(),
      ]);

      if (allergensResponse.data?.isSucceeded) {
        setAllergens(allergensResponse.data.data);
      } else {
        Alert.alert("Lỗi", "Không thể tải danh sách allergen");
      }

      if (categoriesResponse.data?.isSucceeded) {
        const allCategories = ["Tất cả", ...categoriesResponse.data.data];
        setCategories(allCategories);
      } else {
        Alert.alert("Lỗi", "Không thể tải danh sách danh mục");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Filter allergens based on selected category and search query
  const filteredAllergens = allergens.filter((allergen) => {
    const matchesCategory = selectedCategory === "Tất cả" || allergen.category === selectedCategory;
    const matchesSearch = allergen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         allergen.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAllergenPress = (allergen: Allergen) => {
    router.push({
      pathname: "/(tabs)/education/allergenDetail",
      params: { id: allergen.id.toString() },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin dị ứng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Input */}
      <View className="flex-row relative items-center justify-center mb-4">
        <TextInput
          className="flex-1 bg-[#F2F3F2] pl-12 h-14 rounded-xl"
          placeholder="Tìm kiếm allergen..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <MaterialIcons
          className="absolute left-4"
          name="search"
          size={24}
          color={"black"}
        />
      </View>

      {/* Category Filter */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.category}
        >
          {categories.map((category, index) => (
            <Pressable
              style={selectedCategory === category ? styles.tagSelected : styles.tag}
              key={index}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={{
                  color: selectedCategory === category ? "white" : Colors.text.secondary,
                  fontSize: 12,
                }}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Allergens List */}
      <FlatList
        data={filteredAllergens}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AllergenItem
            id={item.id}
            name={item.name}
            category={item.category}
            description={item.description}
            isFdaMajor={item.isFdaMajor}
            isEuMajor={item.isEuMajor}
            onPress={() => handleAllergenPress(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={64} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptySubtitle}>
              Thử tìm kiếm với từ khóa khác hoặc thay đổi danh mục
            </Text>
          </View>
        }
        contentContainerStyle={filteredAllergens.length === 0 ? styles.emptyContentContainer : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
    paddingBottom: 0,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "gray",
  },
  category: {
    width: "100%",
    height: 40,
  },
  tag: {
    backgroundColor: "white",
    padding: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    height: 34,
  },
  tagSelected: {
    backgroundColor: Colors.primary,
    padding: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    height: 34,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
});

export default EducationScreen;
