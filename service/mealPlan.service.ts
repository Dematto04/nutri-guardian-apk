import api from "@/config/api";

// Core Interfaces
interface MealPlanCreateRequest {
    name: string;
    startDate: string;
    endDate: string;
    planType: 'Personal' | 'Family' | 'Weekly' | 'Monthly';
    familyId?: number;
    notes: string;
}

interface MealPlanEntryRequest {
    mealPlanId: string | number;
    mealDate: string | Date;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | number | string | undefined;
    recipeId?: number;
    productId?: number;
    customMealName?: string;
    servings: number;
    notes: string;
}

// Smart Generation Interfaces
interface MealPlanPreferences {
    cuisineTypes: string[];
    maxCookingTime: number;
    budgetRange: 'low' | 'medium' | 'high';
    preferredMealTypes: string[];
    includeLeftovers: boolean;
    varietyMode: boolean;
}

interface SmartMealPlanRequest {
    name: string;
    startDate: string;
    endDate: string;
    planType: 'Personal' | 'Family' | 'Weekly' | 'Monthly';
    familyId?: number;
    preferences: MealPlanPreferences;
}

interface BulkFillRequest {
    mealPlanId: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'all';
    fillPattern: 'rotate' | 'random' | 'same';
    recipeIds: number[];
    targetDates: string[];
}

interface GenerateSmartMealsRequest {
    preferences: MealPlanPreferences;
    targetDates: string[];
    mealTypes: string[];
    replaceExisting?: boolean;
    preserveFavorites?: boolean;
}


class MealPlanServiceBase {
    private readonly pathUrl = "mealplans"

    // === BASIC CRUD OPERATIONS ===
    
    getMealPlan(pageNumber = 1, pageSize = 10) {
        return api.get(`${this.pathUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`)
    }

    getMealPlanDetail(id: string) {
        return api.get(`${this.pathUrl}/${id}`)
    }

    createMealPlan(mealPlanData: MealPlanCreateRequest) {
        return api.post(`${this.pathUrl}`, mealPlanData);
    }

    updateMealPlan(id: number, mealPlanData: Partial<MealPlanCreateRequest>) {
        return api.put(`${this.pathUrl}/${id}`, mealPlanData);
    }

    deleteMealPlan(id: number) {
        return api.delete(`${this.pathUrl}/${id}`);
    }

    // === MEAL ENTRY OPERATIONS ===
    
    addMealEntry(mealPlanId: string | number, body: MealPlanEntryRequest) {
        return api.post(`${this.pathUrl}/${mealPlanId}/entries`, body)
    }

    updateMealEntry(mealPlanId: number, entryId: number, data: Partial<MealPlanEntryRequest>) {
        return api.put(`${this.pathUrl}/${mealPlanId}/entries/${entryId}`, data);
    }

    deleteMealEntry(mealPlanId: number, entryId: number) {
        return api.delete(`${this.pathUrl}/${mealPlanId}/entries/${entryId}`);
    }

    toggleMealCompletion(mealPlanId: number, entryId: number, isCompleted: boolean) {
        return api.patch(`${this.pathUrl}/${mealPlanId}/entries/${entryId}/completion`, {
            isCompleted
        });
    }

    // === SMART GENERATION FEATURES ===
    
    /**
     * 🎯 Generate complete AI-powered meal plan
     */
    generateSmartMealPlan(request: SmartMealPlanRequest) {
        return api.post(`${this.pathUrl}/generate-smart`, request);
    }

    /**
     * 🔍 Get AI-filtered recipe recommendations 
     */
    getRecipeRecommendations(mealType: string, preferences: MealPlanPreferences) {
        return api.post(`${this.pathUrl}/recommendations?mealType=${mealType}`, preferences);
    }

    /**
     * ⚙️ Get available options for smart generation
     */
    getSmartGenerationOptions() {
        return api.get(`${this.pathUrl}/smart-generation/options`);
    }

    /**
     * 📋 Get pre-built meal plan templates
     */
    getMealPlanTemplates() {
        return api.get(`${this.pathUrl}/templates`);
    }

    /**
     * ⚡ Bulk fill meals with smart patterns
     */
    bulkFillMeals(request: BulkFillRequest) {
        return api.post(`${this.pathUrl}/bulk-fill`, request);
    }

    /**
     * 🎯 Add AI-generated meals to existing plan
     */
    generateSmartMealsInPlan(mealPlanId: number, request: GenerateSmartMealsRequest) {
        return api.post(`${this.pathUrl}/${mealPlanId}/generate-smart-meals`, request);
    }

    // === CONVENIENCE METHODS ===
    
    /**
     * 📊 Get meal plan with progress stats
     */
    async getMealPlanWithStats(id: string) {
        const response = await this.getMealPlanDetail(id);
        if (response.data?.isSucceeded) {
            const mealPlan = response.data.data;
            const completionRate = mealPlan.totalMeals > 0 ? 
                (mealPlan.completedMeals / mealPlan.totalMeals) * 100 : 0;
            
            return {
                ...response,
                data: {
                    ...response.data,
                    data: {
                        ...mealPlan,
                        completionRate: Math.round(completionRate)
                    }
                }
            };
        }
        return response;
    }

    /**
     * 🚀 Quick start: Generate weekly meal plan with common preferences
     */
    async quickGenerateWeeklyPlan(
        name: string, 
        cuisineTypes: string[] = ['Italian', 'Asian'], 
        maxCookingTime: number = 45
    ) {
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        return this.generateSmartMealPlan({
            name,
            startDate,
            endDate,
            planType: 'Weekly',
            preferences: {
                cuisineTypes,
                maxCookingTime,
                budgetRange: 'medium',
                preferredMealTypes: ['breakfast', 'lunch', 'dinner'],
                includeLeftovers: true,
                varietyMode: true
            }
        });
    }
    mealPlanEntries(mealPlanId: string | number, body: MealPlanEntryRequest) {
        return api.post(`${this.pathUrl}/${mealPlanId}/entries`, body)
    }
}

export const MealPlanService = new MealPlanServiceBase()