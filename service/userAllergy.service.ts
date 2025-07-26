import api from "@/config/api";
import { UpdateAllergenProfileDto } from "@/dtos/userAllergy/updateAllergenProfile.dto";
import { UserAllergyRequest } from "@/dtos/userAllergy/userAllergy.request.dto";

class UserAllergyServiceBase  {
    private readonly pathUrl = '/userallergy'

    async getUserAllergyProfile(){
        return api.get(`${this.pathUrl}/profile`)
    }

    async createUserAllergen(body: UserAllergyRequest){
        return api.post(`${this.pathUrl}/bulk`, body)
    }
    
    async userHasAllergies() {
        return api.get(`${this.pathUrl}/has-allergies`)
    }

    /**
     * Update allergen profile
     * @param currentAllergenId - The current allergen ID 
     * @param updateData - The update data
     */
    async updateAllergenProfile(currentAllergenId: number, updateData: UpdateAllergenProfileDto) {
        console.log(`Making PATCH request to: ${this.pathUrl}/profile/${currentAllergenId}/change`);
        console.log("Request body:", updateData);
        
        return api.patch(`${this.pathUrl}/profile/${currentAllergenId}/change`, updateData);
    }
    
}

export const UserAllergyService = new UserAllergyServiceBase()