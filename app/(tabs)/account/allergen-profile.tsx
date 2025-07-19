import { UserAllergyService } from "@/service/userAllergy.service";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

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

interface UserAllergy {
  id: number;
  userId: number;
  allergenId: number;
  severity: string;
  diagnosisDate: string;
  diagnosedBy: string;
  lastReactionDate: string;
  avoidanceNotes: string;
  outgrown: boolean;
  outgrownDate: string | null;
  needsVerification: boolean;
  createdAt: string;
  updatedAt: string | null;
  allergen: Allergen;
}

interface AllergyProfileData {
  userId: number;
  allergies: UserAllergy[];
  totalAllergies: number;
  severeAllergies: number;
  outgrownAllergies: number;
}

export default function AllergenProfileScreen() {
  const [profileData, setProfileData] = useState<AllergyProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllergyProfile = async () => {
    try {
      setLoading(true);
      const response = await UserAllergyService.getUserAllergyProfile();
      
      if (response.data?.isSucceeded) {
        setProfileData(response.data.data);
      } else {
        Alert.alert("Lỗi", "Không thể tải thông tin hồ sơ dị ứng");
      }
    } catch (error) {
      console.error("Error fetching allergy profile:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải hồ sơ dị ứng");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllergyProfile();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllergyProfile();
    }, [])
  );

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'mild':
      case 'nhẹ':
        return '#4CAF50';
      case 'moderate':
      case 'trung bình':
        return '#FF9800';
      case 'severe':
      case 'nặng':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'mild':
        return 'Nhẹ';
      case 'moderate':
        return 'Trung bình';
      case 'severe':
        return 'Nặng';
      default:
        return severity || 'Chưa xác định';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return "Chưa có thông tin";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7DE1EF" />
        <Text style={styles.loadingText}>Đang tải hồ sơ dị ứng...</Text>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="shield-alert" size={64} color="#E0E0E0" />
        <Text style={styles.emptyTitle}>Không có dữ liệu</Text>
        <Text style={styles.emptySubtitle}>Không thể tải thông tin hồ sơ dị ứng</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAllergyProfile}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="shield-account" size={32} color="#7DE1EF" />
            <Text style={styles.summaryNumber}>{profileData.totalAllergies}</Text>
            <Text style={styles.summaryLabel}>Tổng số dị ứng</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="alert-circle" size={32} color="#F44336" />
            <Text style={styles.summaryNumber}>{profileData.severeAllergies}</Text>
            <Text style={styles.summaryLabel}>Dị ứng nặng</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="check-circle" size={32} color="#4CAF50" />
            <Text style={styles.summaryNumber}>{profileData.outgrownAllergies}</Text>
            <Text style={styles.summaryLabel}>Đã vượt qua</Text>
          </View>
        </View>

        {/* Allergies List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh sách dị ứng của bạn</Text>
          
          {profileData.allergies.length === 0 ? (
            <View style={styles.emptyAllergyContainer}>
              <MaterialCommunityIcons name="shield-check" size={48} color="#4CAF50" />
              <Text style={styles.emptyAllergyTitle}>Không có dị ứng nào</Text>
              <Text style={styles.emptyAllergySubtitle}>Bạn chưa có thông tin dị ứng nào được ghi nhận</Text>
            </View>
          ) : (
            profileData.allergies.map((allergy) => (
              <View key={allergy.id} style={styles.allergyCard}>
                <View style={styles.allergyHeader}>
                  <View style={styles.allergyInfo}>
                    <Text style={styles.allergyName}>{allergy.allergen.name}</Text>
                    <Text style={styles.allergyCategory}>{allergy.allergen.category}</Text>
                    {allergy.allergen.scientificName && (
                      <Text style={styles.allergyScientific}>
                        {allergy.allergen.scientificName}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.allergyStatus}>
                    <View
                      style={[
                        styles.severityBadge,
                        { backgroundColor: getSeverityColor(allergy.severity) },
                      ]}
                    >
                      <Text style={styles.severityText}>
                        {getSeverityText(allergy.severity)}
                      </Text>
                    </View>
                    
                    {allergy.outgrown && (
                      <View style={styles.outgrownBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                        <Text style={styles.outgrownText}>Đã vượt qua</Text>
                      </View>
                    )}
                    
                    {allergy.needsVerification && (
                      <View style={styles.verificationBadge}>
                        <Ionicons name="warning" size={16} color="#FF9800" />
                        <Text style={styles.verificationText}>Cần xác minh</Text>
                      </View>
                    )}
                  </View>
                </View>

                {allergy.allergen.description && (
                  <Text style={styles.allergyDescription}>
                    {allergy.allergen.description}
                  </Text>
                )}

                <View style={styles.allergyDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Ngày chẩn đoán:</Text>
                    <Text style={styles.detailValue}>{formatDate(allergy.diagnosisDate)}</Text>
                  </View>
                  
                  {allergy.diagnosedBy && (
                    <View style={styles.detailRow}>
                      <Ionicons name="person" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Được chẩn đoán bởi:</Text>
                      <Text style={styles.detailValue}>{allergy.diagnosedBy}</Text>
                    </View>
                  )}
                  
                  {allergy.lastReactionDate && allergy.lastReactionDate !== "0001-01-01T00:00:00" && (
                    <View style={styles.detailRow}>
                      <Ionicons name="warning" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Phản ứng cuối:</Text>
                      <Text style={styles.detailValue}>{formatDate(allergy.lastReactionDate)}</Text>
                    </View>
                  )}
                  
                  {allergy.outgrownDate && (
                    <View style={styles.detailRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Ngày vượt qua:</Text>
                      <Text style={styles.detailValue}>{formatDate(allergy.outgrownDate)}</Text>
                    </View>
                  )}
                </View>

                {allergy.avoidanceNotes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesTitle}>Ghi chú tránh tiếp xúc:</Text>
                    <Text style={styles.notesText}>{allergy.avoidanceNotes}</Text>
                  </View>
                )}

                {(allergy.allergen.isFdaMajor || allergy.allergen.isEuMajor) && (
                  <View style={styles.regulatoryInfo}>
                    <Text style={styles.regulatoryTitle}>Thông tin quy định:</Text>
                    <View style={styles.regulatoryBadges}>
                      {allergy.allergen.isFdaMajor && (
                        <View style={styles.fdaBadge}>
                          <Text style={styles.fdaText}>FDA Major</Text>
                        </View>
                      )}
                      {allergy.allergen.isEuMajor && (
                        <View style={styles.euBadge}>
                          <Text style={styles.euText}>EU Major</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
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
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: "#7DE1EF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  emptyAllergyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyAllergyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptyAllergySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  allergyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  allergyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  allergyInfo: {
    flex: 1,
  },
  allergyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  allergyCategory: {
    fontSize: 14,
    color: "#7DE1EF",
    marginTop: 4,
  },
  allergyScientific: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: 2,
  },
  allergyStatus: {
    alignItems: "flex-end",
    gap: 4,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  outgrownBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  outgrownText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "600",
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  verificationText: {
    color: "#FF9800",
    fontSize: 12,
    fontWeight: "600",
  },
  allergyDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  allergyDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  notesSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  regulatoryInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FFF9E6",
    borderRadius: 8,
  },
  regulatoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  regulatoryBadges: {
    flexDirection: "row",
    gap: 8,
  },
  fdaBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fdaText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  euBadge: {
    backgroundColor: "#5856D6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  euText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
