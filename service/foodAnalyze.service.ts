

import api from "@/config/api";

interface DetectedFood {
  name: string;
  confidence: number;
  potentialAllergens: string[];
  matchedIngredientId: number;
  matchedIngredient: {
    id: number;
    name: string;
    category: string;
    description: string;
    allergens: Array<{
      id: number;
      name: string;
      category: string;
      description: string;
      isFdaMajor: boolean;
      isEuMajor: boolean;
      alternativeNames: string[];
    }>;
    alternativeNames: string[];
  };
}

interface AllergenWarning {
  allergen: string;
  allergenDisplayName: string;
  riskLevel: string;
  description: string;
  foundInFoods: string[];
  allergenId: number;
  allergenInfo: {
    id: number;
    name: string;
    category: string;
    description: string;
    isFdaMajor: boolean;
    isEuMajor: boolean;
    alternativeNames: string[];
  };
  userAllergyInfo: {
    id: number;
    severity: string;
    diagnosisDate: string;
    diagnosedBy: string;
    lastReactionDate: string;
    avoidanceNotes: string;
    outgrown: boolean;
    outgrownDate: string;
    emergencyMedications: Array<{
      id: number;
      medicationName: string;
      dosage: string;
      instructions: string;
    }>;
  };
  emergencyMedications: string[];
  requiresImmediateAttention: boolean;
}

interface FoodAnalysisResponse {
  success: boolean;
  message: string;
  detectedFoods: DetectedFood[];
  allergenWarnings: AllergenWarning[];
  overallRiskScore: number;
  userAllergyContext: {
    userId: number;
    userAllergies: Array<{
      id: number;
      severity: string;
      diagnosisDate: string;
      diagnosedBy: string;
      lastReactionDate: string;
      avoidanceNotes: string;
      outgrown: boolean;
      outgrownDate: string;
      emergencyMedications: Array<{
        id: number;
        medicationName: string;
        dosage: string;
        instructions: string;
      }>;
    }>;
    hasCriticalAllergies: boolean;
    emergencyContacts: string[];
    availableMedications: Array<{
      id: number;
      medicationName: string;
      dosage: string;
      instructions: string;
    }>;
  };
}

class FoodAnalyze {
  private readonly pathUrl = "foodanalysis";

  async analyzeFood(imageFile: any, knownAllergies: string[] = []): Promise<FoodAnalysisResponse> {
    try {
      const formData = new FormData();
      
      // Add image file
      formData.append('Image', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.fileName || 'food_image.jpg',
      } as any);
      
      // Add known allergies
      formData.append('KnownAllergies', JSON.stringify(knownAllergies));

      console.log("Sending food analysis request...");
      console.log("Image URI:", imageFile.uri);
      console.log("Known allergies:", knownAllergies);

      const response = await api.post(`/${this.pathUrl}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Food analysis response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Food analysis error:", error);
      throw error;
    }
  }
}

export const FoodAnalyzeService = new FoodAnalyze();