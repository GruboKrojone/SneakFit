import AuthService from "./AuthService";
import i18n from "../translations/service/i18n";

export interface Category {
  id: number;
  nameEn: string;
  namePl: string;
  nameDe: string;
  nameEs: string;
  color: string;
}

const BASE_URL = "https://localhost:7059";

class CategoriesService {
  static async getAllCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${BASE_URL}/categories`, {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(i18n.t("categories_service_fetch_failed"));
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  static async addCategory(
    nameEn: string, 
    namePl: string, 
    nameDe: string, 
    nameEs: string, 
    color: string
  ): Promise<Category> {
    try {
      const response = await fetch(`${BASE_URL}/category/add`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
        body: JSON.stringify({ nameEn, namePl, nameDe, nameEs, color }),
      });

      if (!response.ok) {
        throw new Error("Failed to add category");
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  }

  static async deleteCategory(id: number): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/category/${id}/delete`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          ...AuthService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }

  static async assignToDish(categoryId: number, dishId: number): Promise<void> {
    try {
      const response = await fetch(
        `${BASE_URL}/category/${categoryId}/assignToDish/${dishId}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            ...AuthService.getAuthHeader(),
          },
        }
      );

      if (!response.ok) {
        let errorBody = "";
        try {
          errorBody = await response.text();
        } catch {
          errorBody = "Could not read error body";
        }
        console.error(`Assign to dish failed. Status: ${response.status}, Body: ${errorBody}`);
        throw new Error(i18n.t("categories_service_assign_failed"));
      }
    } catch (error) {
      console.error("Error assigning category to dish:", error);
      console.error(`Failed assignment details - CategoryId: ${categoryId}, DishId: ${dishId}`);
      throw error;
    }
  }

  static async unassignFromDish(
    categoryId: number,
    dishId: number
  ): Promise<void> {
    try {
      const response = await fetch(
        `${BASE_URL}/category/${categoryId}/unassignFromDish/${dishId}`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            ...AuthService.getAuthHeader(),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to unassign category from dish");
      }
    } catch (error) {
      console.error("Error unassigning category from dish:", error);
      throw error;
    }
  }
}

export default CategoriesService;
