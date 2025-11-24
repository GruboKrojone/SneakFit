import AuthService from "./AuthService";

export interface Category {
  id: number;
  name: string;
}

export interface Ingredient {
  id: number;
  name: string;
  quantity: string;
}

export interface Dish {
  id: number;
  name: string;
  description?: string;
  rates: number;
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

class DishesService {
  private static baseUrl = "https://localhost:7059";

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
        throw new Error("Failed to fetch dishes");
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
        throw new Error("Failed to fetch dish");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching dish:", error);
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
        throw new Error("Failed to create dish");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating dish:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to create dish: ${errorMessage}`);
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
        throw new Error("Failed to update dish");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating dish:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to update dish ${dishId}: ${errorMessage}`);
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
        throw new Error("Failed to update dish visibility");
      }
    } catch (error) {
      console.error("Error updating dish visibility:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(
        `Failed to update dish ${dishId} visibility: ${errorMessage}`
      );
    }
  }
}

export default DishesService;
