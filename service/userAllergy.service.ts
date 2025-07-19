import api from "@/config/api"
import { UserAllergyRequest } from "@/dtos/userAllergy/userAllergy.request.dto"

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
}

export const UserAllergyService = new UserAllergyServiceBase()