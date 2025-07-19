import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// Variable to track if token refresh is in progress
let isRefreshing = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];

/**
 * Process the queue of failed requests
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  // Reset the queue
  failedQueue = [];
};

/**
 * Handle token refresh when needed
 */
const refreshAccessToken = async () => {
  try {
    // Get stored refresh token and user data
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    const userJson = await AsyncStorage.getItem("user");
    
    if (!refreshToken || !userJson) {
      throw new Error("No refresh token or user data");
    }
    
    const user = JSON.parse(userJson);
    
    // Create a new axios instance to avoid interceptors loop
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/authentication/refresh-token`,
      {
        refreshToken,
        userId: user.userId
      }
    );
    
    const { data } = response;
    
    if (!data.isSucceeded) {
      throw new Error("Token refresh failed");
    }
    
    // Store new tokens
    const { token, refreshToken: newRefreshToken, tokenExpiresAt } = data.data;
    
    await AsyncStorage.setItem("accessToken", token);
    await AsyncStorage.setItem("refreshToken", newRefreshToken);
    
    // Update stored user object with new tokens
    const updatedUser = {
      ...user,
      token,
      refreshToken: newRefreshToken,
      tokenExpiresAt
    };
    
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    
    return token;
  } catch (error) {
    // Handle token refresh failure
    // Clean up stored auth data
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    
    throw error;
  }
};

// Add request interceptor to include the token in each request
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get access token from storage
    const token = await AsyncStorage.getItem("accessToken");
    
    // Add token to request headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // Get the original request configuration
    const originalRequest = error.config as any;
    
    // Check for 401 Unauthorized response and ensure we haven't retried already
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Mark this request as retried to avoid loops
      originalRequest._retry = true;
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        try {
          // Wait for the current refresh to complete
          const token = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          
          // Update the request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, reject with the refresh error
          return Promise.reject(refreshError);
        }
      }
      
      // Start refreshing process
      isRefreshing = true;
      
      try {
        // Attempt to refresh the token
        const newToken = await refreshAccessToken();
        
        // Process any requests that failed during the refresh
        processQueue(null, newToken);
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Notify all queued requests about the refresh failure
        processQueue(refreshError as Error);
        
        // No need for explicit navigation here - app will redirect when a protected
        // route is accessed without valid auth
        return Promise.reject(refreshError);
      } finally {
        // Reset refreshing flag
        isRefreshing = false;
      }
    }
    
    // For all other errors, just reject with the original error
    return Promise.reject(error);
  }
);

export default api;
