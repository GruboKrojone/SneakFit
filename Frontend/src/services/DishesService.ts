import AuthService from "./AuthService";
import i18n from "../translations/service/i18n";
import { toast } from "react-toastify";

export interface Category {
  id: number;
  nameEn: string;
  namePl: string;
  nameDe: string;
  nameEs: string;
  color: string;
}

export interface Ingredient {
  id: number;
  name: string;
  description: string;
}

export interface Dish {
  id: number;
  name: string;
  description?: string;
  rates: number;
  ownerId: number;
  ownerName: string;
  isPublic: boolean;
  categories: Category[];
  mainImageId: number;
  secondaryImageId: number | null;
  thirdImageId: number | null;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  ingredients?: Ingredient[];
}

export interface CreateDishDTO {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
}

class DishesService {
  private static readonly baseUrl = "https://localhost:7059";

  static async getAllDishes(): Promise<Dish[]> {
    try {
      const response = await fetch(`${this.baseUrl}/dishes`, {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(i18n.t("dishes_service_fetch_all_failed"));
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching dishes:", error);
      return [];
    }
  }

  static async getDishById(dishId: number): Promise<Dish | null> {
    try {
      const response = await fetch(`${this.baseUrl}/dish/${dishId}`, {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(i18n.t("dishes_service_fetch_one_failed"));
      }

      return await response.json();
    } catch (error) {
      toast.error(i18n.t("dishes_service_fetch_one_failed\n" + error));
      return null;
    }
  }

  static async createDish(dish: Omit<Dish, "id">): Promise<Dish> {
    try {
      const response = await fetch(`${this.baseUrl}/dish/add`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
        body: JSON.stringify(dish),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Create dish failed:", response.status, errorText);
        throw new Error(i18n.t("dishes_service_create_failed"));
      }

      const dishId = await response.json();
      
      // Return the dish with the ID from backend
      return {
        ...dish,
        id: dishId,
      };
    } catch (error) {
      console.error("Error creating dish:", error);
      const errorMessage =
        error instanceof Error ? error.message : i18n.t("service_unknown_error");
      throw new Error(`${i18n.t("dishes_service_create_failed")}: ${errorMessage}`);
    }
  }

  static async updateDish(dishId: number, dish: Partial<Dish>): Promise<Dish> {
    try {
      const response = await fetch(`${this.baseUrl}/dish/${dishId}/update`, {
        method: "PUT",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
        body: JSON.stringify(dish),
      });

      if (!response.ok) {
        throw new Error(i18n.t("dishes_service_update_failed"));
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating dish:", error);
      const errorMessage =
        error instanceof Error ? error.message : i18n.t("service_unknown_error");
      throw new Error(`${i18n.t("dishes_service_update_failed")} ${dishId}: ${errorMessage}`);
    }
  }

  static async setDishPublic(dishId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/dish/${dishId}/public`, {
        method: "PUT",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(i18n.t("dishes_service_visibility_failed"));
      }
    } catch (error) {
      console.error("Error updating dish visibility:", error);
      const errorMessage =
        error instanceof Error ? error.message : i18n.t("service_unknown_error");
      throw new Error(
        `${i18n.t("dishes_service_visibility_failed")} ${dishId}: ${errorMessage}`
      );
    }
  }

  static async deleteDish(dishId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/dish/${dishId}/delete`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(i18n.t("dishes_service_delete_failed"));
      }
    } catch (error) {
      console.error("Error deleting dish:", error);
      const errorMessage =
        error instanceof Error ? error.message : i18n.t("service_unknown_error");
      throw new Error(`${i18n.t("dishes_service_delete_failed")} ${dishId}: ${errorMessage}`);
    }
  }

  static async addDishToFavorites(dishId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/dish/${dishId}/favorite`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to add dish to favorites");
      }
    } catch (error) {
      console.error("Error adding dish to favorites:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to add dish ${dishId} to favorites: ${errorMessage}`);
    }
  }
}

export default DishesService;
