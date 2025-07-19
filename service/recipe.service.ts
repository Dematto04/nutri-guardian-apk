import api from "@/config/api";


class RecipeServiceBase {
    private readonly pathUrl = "recipes"
    
    async getRecipeCategories(){
        return api.get(`${this.pathUrl}/filter-options`)
    }
    async getRecipes(cate: string){
        const params = new URLSearchParams({
            IngredientCategory: cate
        })
        console.log(params);
        return api.get(`${this.pathUrl}/search?${params}`)
    }
    async getRecipeById(id: string){
        return api.get(`${this.pathUrl}/${id}`)
    }
}

export const RecipeService = new RecipeServiceBase()