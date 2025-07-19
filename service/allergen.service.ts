import api from "@/config/api"
import { AllergenResponse } from "@/dtos/allergen/allergen.response.dto"

class AllergenServiceBase {
    private readonly urlPath = "/allergen"

    async getAllAllergen(): Promise<AllergenResponse>{
        return api.get(`${this.urlPath}`)
    }

    async getAllergenCategories() {
        return api.get(`${this.urlPath}/categories`)
    }

    async getAllergenById(id: number) {
        return api.get(`${this.urlPath}/${id}`)
    }
    
}

export const AllergenService = new AllergenServiceBase()