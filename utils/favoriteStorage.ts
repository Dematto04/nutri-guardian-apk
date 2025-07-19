import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'favorite_recipes';

export interface FavoriteRecipe {
  id: string;
  name: string;
  thumbnailImageUrl?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  difficultyLevel?: string;
  servings?: number;
  cuisineType?: string;
  mealType?: string;
  addedAt: string; // ISO string
}

export class FavoriteStorage {
  static async getFavorites(): Promise<FavoriteRecipe[]> {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  static async addToFavorites(recipe: Omit<FavoriteRecipe, 'addedAt'>): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      
      // Check if recipe already exists
      const existingIndex = favorites.findIndex(fav => fav.id === recipe.id);
      
      if (existingIndex === -1) {
        // Add new favorite
        const newFavorite: FavoriteRecipe = {
          ...recipe,
          addedAt: new Date().toISOString()
        };
        favorites.unshift(newFavorite); // Add to beginning of array
        
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        return true;
      }
      
      return false; // Already exists
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  }

  static async removeFromFavorites(recipeId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      const filteredFavorites = favorites.filter(fav => fav.id !== recipeId);
      
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filteredFavorites));
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  static async isFavorite(recipeId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.id === recipeId);
    } catch (error) {
      console.error('Error checking if favorite:', error);
      return false;
    }
  }

  static async clearFavorites(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return false;
    }
  }
}
