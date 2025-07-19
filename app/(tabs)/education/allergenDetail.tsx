import { Colors } from "@/constants/Colors";
import { AllergenService } from "@/service/allergen.service";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AllergenDetail {
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

export default function AllergenDetailScreen() {
  const params = useLocalSearchParams();
  const [allergen, setAllergen] = useState<AllergenDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllergenDetail = async () => {
      try {
        const allergenId = params.id as string;
        if (!allergenId) {
          Alert.alert("Lỗi", "Không tìm thấy thông tin allergen");
          return;
        }

        const response = await AllergenService.getAllergenById(parseInt(allergenId));
        
        if (response.data?.isSucceeded) {
          setAllergen(response.data.data);
        } else {
          Alert.alert("Lỗi", "Không thể tải thông tin allergen");
        }
      } catch (error) {
        console.error("Error fetching allergen detail:", error);
        Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải thông tin allergen");
      } finally {
        setLoading(false);
      }
    };

    fetchAllergenDetail();
  }, [params.id]);

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

  if (!allergen) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#E0E0E0" />
          <Text style={styles.errorTitle}>Không tìm thấy thông tin</Text>
          <Text style={styles.errorSubtitle}>
            Không thể tải thông tin allergen này
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{allergen.name}</Text>
          <Text style={styles.category}>{allergen.category}</Text>
          {allergen.scientificName && (
            <Text style={styles.scientificName}>
              {allergen.scientificName}
            </Text>
          )}
        </View>

        {/* Regulatory Badges */}
        <View style={styles.badgesContainer}>
          <Text style={styles.badgesTitle}>Phân loại theo quy định:</Text>
          <View style={styles.badges}>
            {allergen.isFdaMajor && (
              <View style={styles.fdaBadge}>
                <MaterialIcons name="verified" size={16} color="white" />
                <Text style={styles.fdaBadgeText}>FDA Major Allergen</Text>
              </View>
            )}
            {allergen.isEuMajor && (
              <View style={styles.euBadge}>
                <MaterialIcons name="verified" size={16} color="white" />
                <Text style={styles.euBadgeText}>EU Major Allergen</Text>
              </View>
            )}
            {!allergen.isFdaMajor && !allergen.isEuMajor && (
              <View style={styles.minorBadge}>
                <MaterialIcons name="info" size={16} color="#666" />
                <Text style={styles.minorBadgeText}>Allergen khác</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{allergen.description}</Text>
        </View>

        {/* Information Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <MaterialIcons name="category" size={24} color={Colors.primary} />
            <Text style={styles.infoCardTitle}>Danh mục</Text>
            <Text style={styles.infoCardValue}>{allergen.category}</Text>
          </View>

          {allergen.scientificName && (
            <View style={styles.infoCard}>
              <MaterialIcons name="science" size={24} color={Colors.primary} />
              <Text style={styles.infoCardTitle}>Tên khoa học</Text>
              <Text style={styles.infoCardValue}>{allergen.scientificName}</Text>
            </View>
          )}
        </View>

        {/* Safety Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin an toàn</Text>
          <View style={styles.safetyInfo}>
            <View style={styles.safetyItem}>
              <MaterialIcons name="warning" size={20} color="#FF9800" />
              <Text style={styles.safetyText}>
                Luôn đọc kỹ nhãn thực phẩm trước khi sử dụng
              </Text>
            </View>
            <View style={styles.safetyItem}>
              <MaterialIcons name="local-hospital" size={20} color="#F44336" />
              <Text style={styles.safetyText}>
                Liên hệ bác sĩ nếu có phản ứng dị ứng
              </Text>
            </View>
            <View style={styles.safetyItem}>
              <MaterialIcons name="restaurant" size={20} color="#4CAF50" />
              <Text style={styles.safetyText}>
                Thông báo cho nhà hàng về tình trạng dị ứng của bạn
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Information */}
        {(allergen.isFdaMajor || allergen.isEuMajor) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin quy định</Text>
            <View style={styles.regulatoryInfo}>
              {allergen.isFdaMajor && (
                <View style={styles.regulatoryItem}>
                  <Text style={styles.regulatoryTitle}>FDA (Mỹ):</Text>
                  <Text style={styles.regulatoryDescription}>
                    Được FDA công nhận là một trong 9 allergen chính gây ra 90% 
                    phản ứng dị ứng thực phẩm tại Mỹ.
                  </Text>
                </View>
              )}
              {allergen.isEuMajor && (
                <View style={styles.regulatoryItem}>
                  <Text style={styles.regulatoryTitle}>EU (Châu Âu):</Text>
                  <Text style={styles.regulatoryDescription}>
                    Được EU công nhận là allergen chính phải được ghi rõ 
                    trên nhãn thực phẩm theo quy định.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  header: {
    backgroundColor: "white",
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  badgesContainer: {
    backgroundColor: "white",
    padding: 16,
    marginTop: 1,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  fdaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  fdaBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  euBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5856D6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  euBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  minorBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  minorBadgeText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "white",
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  infoCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoCardTitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  infoCardValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  safetyInfo: {
    gap: 12,
  },
  safetyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  safetyText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  regulatoryInfo: {
    gap: 16,
  },
  regulatoryItem: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
  },
  regulatoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  regulatoryDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
