import { FavoriteRecipe, FavoriteStorage } from '@/utils/favoriteStorage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FavoriteCardProps = {
  item: FavoriteRecipe;
  onPress: (id: string) => void;
  onRemove: (id: string) => void;
};

function FavoriteCard({ item, onPress, onRemove }: FavoriteCardProps) {
  const handleRemove = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa công thức này khỏi danh sách yêu thích?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => onRemove(item.id) },
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Recipe Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              item.thumbnailImageUrl
                ? { uri: item.thumbnailImageUrl }
                : require('@/assets/images/ai_re.png')
            }
            style={styles.recipeImage}
            resizeMode="cover"
          />
        </View>

        {/* Recipe Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.recipeName} numberOfLines={2}>
            {item.name}
          </Text>
          
          <View style={styles.recipeDetails}>
            {item.prepTimeMinutes && (
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={styles.detailText}>{item.prepTimeMinutes} phút</Text>
              </View>
            )}
            
            {item.servings && (
              <View style={styles.detailItem}>
                <Ionicons name="people-outline" size={14} color="#666" />
                <Text style={styles.detailText}>{item.servings} người</Text>
              </View>
            )}
          </View>

          {item.difficultyLevel && (
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficultyLevel) + '20' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficultyLevel) }]}>
                {item.difficultyLevel}
              </Text>
            </View>
          )}

          <Text style={styles.addedDate}>
            Đã thêm: {new Date(item.addedAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>

        {/* Remove Button */}
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={handleRemove}
        >
          <Ionicons name="heart" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
    case 'dễ':
      return '#4CAF50';
    case 'medium':
    case 'trung bình':
      return '#FF9800';
    case 'hard':
    case 'khó':
      return '#F44336';
    default:
      return '#757575';
  }
};

function EmptyFavorites() {
  const router = useRouter();

  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#DDD" />
      <Text style={styles.emptyTitle}>Chưa có công thức yêu thích</Text>
      <Text style={styles.emptySubtitle}>
        Khám phá và thêm những công thức bạn yêu thích vào đây
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => router.push('/(tabs)/explore')}
      >
        <Text style={styles.exploreButtonText}>Khám phá ngay</Text>
      </TouchableOpacity>
    </View>
  );
}

function FavouriteScreen() {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadFavorites = async () => {
    try {
      const favoriteList = await FavoriteStorage.getFavorites();
      setFavorites(favoriteList);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (recipeId: string) => {
    try {
      const success = await FavoriteStorage.removeFromFavorites(recipeId);
      if (success) {
        setFavorites(prev => prev.filter(item => item.id !== recipeId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Lỗi', 'Không thể xóa công thức khỏi danh sách yêu thích');
    }
  };

  const handleRecipePress = (recipeId: string) => {
    router.push(`/(tabs)/explore/recipe-detail/${recipeId}`);
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {favorites.length === 0 ? (
        <EmptyFavorites />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <FavoriteCard
              item={item}
              onPress={handleRecipePress}
              onRemove={handleRemoveFavorite}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    lineHeight: 20,
  },
  recipeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addedDate: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  removeButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreButton: {
    // backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default FavouriteScreen;
