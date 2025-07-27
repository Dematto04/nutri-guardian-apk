import { Colors } from '@/constants/Colors';
import { FoodAnalyzeService } from '@/service/foodAnalyze.service';
import { UserAllergyService } from '@/service/userAllergy.service';
import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface DetectedFood {
  name: string;
  confidence: number;
  potentialAllergens: string[];
  matchedIngredientId: number;
  matchedIngredient: any;
}

interface AllergenWarning {
  allergen: string;
  allergenDisplayName: string;
  riskLevel: string;
  description: string;
  foundInFoods: string[];
  allergenId: number;
  requiresImmediateAttention: boolean;
  emergencyMedications: string[];
}

export default function FoodAnalyzeScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [userAllergies, setUserAllergies] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(true);

  useEffect(() => {
    loadUserAllergies();
  }, []);

  const loadUserAllergies = async () => {
    try {
      const response = await UserAllergyService.getUserAllergyProfile();
      if (response.data?.isSucceeded) {
        const allergies = response.data.data.allergies.map((allergy: any) => 
          allergy.allergen.name
        );
        setUserAllergies(allergies);
        console.log("User allergies loaded:", allergies);
      }
    } catch (error) {
      console.error("Error loading user allergies:", error);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        if (photo) {
          setCapturedImage(photo.uri);
          setShowCamera(false);
          await analyzeImage({
            uri: photo.uri,
            type: 'image/jpeg',
            fileName: 'camera_photo.jpg'
          });
        }
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Lỗi", "Không thể chụp ảnh");
      }
    }
  };

  const pickImageFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setCapturedImage(asset.uri);
        setShowCamera(false);
        await analyzeImage({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          fileName: asset.fileName || 'library_photo.jpg'
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh từ thư viện");
    }
  };

  const analyzeImage = async (imageFile: any) => {
    setIsAnalyzing(true);
    try {
      const result = await FoodAnalyzeService.analyzeFood(imageFile, userAllergies);
      setAnalysisResult(result);
      
      if (result.message === "no food detect") {
        Alert.alert(
          "⚠️ Không phát hiện món ăn",
          "Không phát hiện món ăn nào trong ảnh. Vui lòng thử chụp lại với góc nhìn rõ ràng hơn.",
          [
            { text: "Chụp lại", onPress: retakePhoto },
            { text: "Chọn ảnh khác", onPress: pickImageFromLibrary }
          ]
        );
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      Alert.alert(
        "Lỗi phân tích",
        "Đã xảy ra lỗi khi phân tích ảnh. Vui lòng thử lại.",
        [
          { text: "Thử lại", onPress: retakePhoto }
        ]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setShowCamera(true);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return '#fbbf24'; // Colors.yellow
      case 'medium':
        return '#f97316'; // Colors.orange  
      case 'high':
        return '#ef4444'; // Colors.danger
      default:
        return '#6b7280';
    }
  };

  const renderDetectedFoods = () => {
    if (!analysisResult?.detectedFoods || analysisResult.detectedFoods.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🍽️ Món ăn được phát hiện</Text>
        {analysisResult.detectedFoods.map((food: DetectedFood, index: number) => (
          <View key={index} style={styles.foodCard}>
            <View style={styles.foodHeader}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.confidenceText}>
                {Math.round(food.confidence * 100)}% tin cậy
              </Text>
            </View>
            
            {food.potentialAllergens && food.potentialAllergens.length > 0 && (
              <View style={styles.allergensContainer}>
                <Text style={styles.allergensLabel}>⚠️ Có thể chứa dị ứng:</Text>
                <View style={styles.allergenTags}>
                  {food.potentialAllergens.map((allergen, idx) => (
                    <View key={idx} style={[styles.allergenTag, { backgroundColor: '#fef2f2' }]}>
                      <Text style={[styles.allergenText, { color: '#dc2626' }]}>
                        {allergen}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {food.matchedIngredient && (
              <View style={styles.ingredientInfo}>
                <Text style={styles.ingredientLabel}>Thành phần chính:</Text>
                <Text style={styles.ingredientName}>{food.matchedIngredient.name}</Text>
                <Text style={styles.ingredientCategory}>Loại: {food.matchedIngredient.category}</Text>
                {food.matchedIngredient.description && (
                  <Text style={styles.ingredientDescription}>
                    {food.matchedIngredient.description}
                  </Text>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderAllergenWarnings = () => {
    if (!analysisResult?.allergenWarnings || analysisResult.allergenWarnings.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Cảnh báo dị ứng</Text>
        {analysisResult.allergenWarnings.map((warning: AllergenWarning, index: number) => (
          <View key={index} style={[
            styles.warningCard,
            warning.requiresImmediateAttention && styles.criticalWarning
          ]}>
            <View style={styles.warningHeader}>
              <Text style={styles.allergenDisplayName}>
                {warning.allergenDisplayName}
              </Text>
              <View style={[
                styles.riskBadge,
                { backgroundColor: getRiskColor(warning.riskLevel) }
              ]}>
                <Text style={styles.riskText}>{warning.riskLevel}</Text>
              </View>
            </View>
            
            <Text style={styles.warningDescription}>{warning.description}</Text>
            
            {warning.foundInFoods && warning.foundInFoods.length > 0 && (
              <View style={styles.foundInContainer}>
                <Text style={styles.foundInLabel}>Tìm thấy trong:</Text>
                <Text style={styles.foundInText}>
                  {warning.foundInFoods.join(', ')}
                </Text>
              </View>
            )}
            
            {warning.requiresImmediateAttention && (
              <View style={styles.emergencyContainer}>
                <Text style={styles.emergencyText}>
                  🚨 CẦN CHÚ Ý NGAY LẬP TỨC!
                </Text>
              </View>
            )}
            
            {warning.emergencyMedications && warning.emergencyMedications.length > 0 && (
              <View style={styles.medicationContainer}>
                <Text style={styles.medicationLabel}>💊 Thuốc khẩn cấp:</Text>
                {warning.emergencyMedications.map((med, idx) => (
                  <Text key={idx} style={styles.medicationText}>• {med}</Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderOverallRisk = () => {
    if (analysisResult?.overallRiskScore === undefined) return null;

    const riskScore = analysisResult.overallRiskScore;
    const isHighRisk = riskScore > 0.5;

    return (
      <View style={[
        styles.riskScoreContainer,
        { backgroundColor: isHighRisk ? '#fef2f2' : '#f0fdf4' }
      ]}>
        <Text style={[
          styles.riskScoreTitle,
          { color: isHighRisk ? '#dc2626' : '#059669' }
        ]}>
          {isHighRisk ? '⚠️ CẢNH BÁO' : 'AN TOÀN'}
        </Text>
        <Text style={styles.riskScoreText}>
          Điểm rủi ro tổng thể: {Math.round(riskScore * 100)}%
        </Text>
        {isHighRisk && (
          <Text style={styles.riskWarningText}>
            Món ăn này có thể không an toàn cho bạn!
          </Text>
        )}
      </View>
    );
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={Colors.light.tint} />
          <Text style={styles.permissionTitle}>Cần quyền truy cập camera</Text>
          <Text style={styles.permissionText}>
            Ứng dụng cần quyền truy cập camera để chụp ảnh món ăn và phân tích dinh dưỡng.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Cấp quyền camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {showCamera && !analysisResult ? (
        /* Camera View */
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraFrame} />
              <Text style={styles.cameraHint}>
                Đặt món ăn vào khung và chụp ảnh
              </Text>
            </View>
          </CameraView>
          
          {/* Camera Controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={pickImageFromLibrary}
            >
              <Ionicons name="images" size={24} color="white" />
              <Text style={styles.controlButtonText}>Thư viện</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
            >
              <Ionicons name="camera-reverse" size={24} color="white" />
              <Text style={styles.controlButtonText}>Lật</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Results View */
        <ScrollView style={styles.resultsContainer}>
          {/* Captured Image */}
          {capturedImage && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
              <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
                <Ionicons name="camera" size={16} color="white" />
                <Text style={styles.retakeButtonText}>Chụp lại</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.tint} />
              <Text style={styles.loadingText}>
                🤖 AI đang phân tích món ăn...
              </Text>
            </View>
          )}

          {/* Analysis Results */}
          {analysisResult && !isAnalyzing && (
            <>
              {analysisResult.message === "no food detect" ? (
                <View style={styles.noFoodContainer}>
                  <Ionicons name="restaurant-outline" size={48} color="#f97316" />
                  <Text style={styles.noFoodText}>
                    Không phát hiện món ăn nào
                  </Text>
                  <Text style={styles.noFoodSubtext}>
                    Vui lòng thử chụp lại với góc nhìn rõ ràng hơn
                  </Text>
                </View>
              ) : (
                <>
                  {renderOverallRisk()}
                  {renderDetectedFoods()}
                  {renderAllergenWarnings()}
                </>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cameraFrame: {
    width: width * 0.8,
    height: width * 0.8,
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  cameraHint: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 32,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: 'black',
  },
  galleryButton: {
    alignItems: 'center',
    padding: 8,
  },
  flipButton: {
    alignItems: 'center',
    padding: 8,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#e2e8f0',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#64748b',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  imageContainer: {
    position: 'relative',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  capturedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  retakeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
  },
  noFoodContainer: {
    alignItems: 'center',
    padding: 32,
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  noFoodText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ea580c',
    marginTop: 16,
    marginBottom: 8,
  },
  noFoodSubtext: {
    fontSize: 14,
    color: '#9a3412',
    textAlign: 'center',
  },
  riskScoreContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  riskScoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  riskScoreText: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  riskWarningText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  foodCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  confidenceText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  allergensContainer: {
    marginTop: 8,
  },
  allergensLabel: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 6,
  },
  allergenTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  allergenTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  allergenText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ingredientInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  ingredientLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  ingredientCategory: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  ingredientDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  warningCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
  },
  criticalWarning: {
    borderLeftColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  warningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  allergenDisplayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  warningDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  foundInContainer: {
    marginTop: 8,
  },
  foundInLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  foundInText: {
    fontSize: 14,
    color: '#1e293b',
  },
  emergencyContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  emergencyText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  medicationContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
  },
  medicationLabel: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '600',
    marginBottom: 4,
  },
  medicationText: {
    fontSize: 12,
    color: '#0369a1',
    marginBottom: 2,
  },
});