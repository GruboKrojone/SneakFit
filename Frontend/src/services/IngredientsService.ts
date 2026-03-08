import i18n from "../translations/service/i18n";
import AuthService from "./AuthService";

export interface Ingredient {
  id: number;
  name: string;
  description: string;
}

export interface IngredientCreateRequest {
  name: string;
  description: string;
}

export interface IngredientResponse {
  id: number;
  name: string;
  description: string;
}

class IngredientsService {
  private static readonly baseUrl = "https://localhost:7059";

  static async addIngredient(ingredient: IngredientCreateRequest): Promise<IngredientResponse> {
    try {
      console.log('Adding ingredient:', ingredient);
      
      const response = await fetch(`${this.baseUrl}/ingredient/add`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
        body: JSON.stringify(ingredient),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Add ingredient failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          sentData: ingredient
        });
        throw new Error(`${i18n.t("ingredients_service_add_failed")} (${response.status}): ${errorText}`);
      }

      const ingredientId = await response.json();
      console.log('Successfully added ingredient with ID:', ingredientId);
      
      return {
        id: ingredientId,
        name: ingredient.name,
        description: ingredient.description
      };
    } catch (error) {
      console.error("Error adding ingredient:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(i18n.t("service_unknown_error"));
    }
  }

  static async assignToDish(ingredientId: number, dishId: number): Promise<void> {
    try {
      const url = `${this.baseUrl}/ingredient/${ingredientId}/assignToDish/${dishId}`;
      console.log('Assigning ingredient to dish:', { ingredientId, dishId, url });
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Assign ingredient failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          ingredientId,
          dishId
        });
        throw new Error(`${i18n.t("ingredients_service_assign_failed")} (${response.status}): ${errorText}`);
      }
      
      console.log('Successfully assigned ingredient', ingredientId, 'to dish', dishId);
    } catch (error) {
      console.error("Error assigning ingredient to dish:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(i18n.t("service_unknown_error"));
    }
  }

  static async unassignFromDish(ingredientId: number, dishId: number): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/ingredient/${ingredientId}/unassignFromDish/${dishId}`,
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            ...AuthService.getAuthHeader(),
          },
        }
      );

      if (!response.ok) {
        throw new Error(i18n.t("ingredients_service_unassign_failed"));
      }
    } catch (error) {
      console.error("Error unassigning ingredient from dish:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(i18n.t("service_unknown_error"));
    }
  }

  static async assignMultipleIngredientsToDish(
    ingredientIds: number[],
    dishId: number
  ): Promise<void> {
    for (const ingredientId of ingredientIds) {
      await this.assignToDish(ingredientId, dishId);
    }
  }
}

export default IngredientsService;
