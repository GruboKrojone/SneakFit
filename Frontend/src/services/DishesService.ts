export interface Category {
  id: number;
  name: string;
}

export interface Dish {
  id: number;
  name: string;
  rates: number;
  ownerName: string;
  isPublic: boolean;
  categories: Category[];
  mainPictureId: number;
  secondaryPictureId: number;
  thirdPictureId: number;
}

class DishesService {
  private static baseUrl = "https://localhost:7059/dishes";

  private static sampleDishes: Dish[] = [
    {
      id: 1,
      name: "Spaghetti Carbonara",
      rates: 4.8,
      ownerName: "Chef Mario",
      isPublic: true,
      categories: [
        { id: 1, name: "Pasta" },
        { id: 2, name: "Italian" },
      ],
      mainPictureId: 101,
      secondaryPictureId: 102,
      thirdPictureId: 103,
    },
    {
      id: 2,
      name: "Thai Green Curry",
      rates: 4.6,
      ownerName: "Chef Somchai",
      isPublic: true,
      categories: [
        { id: 3, name: "Curry" },
        { id: 4, name: "Thai" },
      ],
      mainPictureId: 201,
      secondaryPictureId: 202,
      thirdPictureId: 203,
    },
    {
      id: 3,
      name: "Grilled Salmon with Vegetables",
      rates: 4.9,
      ownerName: "Chef Alex",
      isPublic: true,
      categories: [
        { id: 5, name: "Fish" },
        { id: 6, name: "Healthy" },
      ],
      mainPictureId: 301,
      secondaryPictureId: 302,
      thirdPictureId: 303,
    },
    {
      id: 4,
      name: "Classic Margherita Pizza",
      rates: 4.5,
      ownerName: "Chef Giovanni",
      isPublic: true,
      categories: [
        { id: 7, name: "Pizza" },
        { id: 2, name: "Italian" },
      ],
      mainPictureId: 401,
      secondaryPictureId: 402,
      thirdPictureId: 403,
    },
    {
      id: 5,
      name: "Beef Tacos",
      rates: 4.7,
      ownerName: "Chef Carlos",
      isPublic: true,
      categories: [
        { id: 8, name: "Tacos" },
        { id: 9, name: "Mexican" },
      ],
      mainPictureId: 501,
      secondaryPictureId: 502,
      thirdPictureId: 503,
    },
  ];

  static async getAllDishes(): Promise<Dish[]> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dishes");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching dishes:", error);
      return this.sampleDishes;
    }
  }

  static async getDishById(dishId: number): Promise<Dish | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${dishId}`, {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dish");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching dish:", error);
      return this.sampleDishes.find((dish) => dish.id === dishId) || null;
    }
  }

  static getSampleDishes(): Dish[] {
    return this.sampleDishes;
  }

  static async createDish(dish: Omit<Dish, "id">): Promise<Dish> {
    try {
      const response = await fetch(`${this.baseUrl}/add`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dish),
      });

      if (!response.ok) {
        throw new Error("Failed to create dish");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating dish:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to create dish: ${errorMessage}`);
    }
  }

  static async updateDish(dishId: number, dish: Partial<Dish>): Promise<Dish> {
    try {
      const response = await fetch(`${this.baseUrl}/${dishId}/update`, {
        method: "PUT",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dish),
      });

      if (!response.ok) {
        throw new Error("Failed to update dish");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating dish:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to update dish ${dishId}: ${errorMessage}`);
    }
  }

  static async setDishPublic(dishId: number, isPublic: boolean): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${dishId}/public`, {
        method: "UPDATE",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic }),
      });

      if (!response.ok) {
        throw new Error("Failed to update dish visibility");
      }
    } catch (error) {
      console.error("Error updating dish visibility:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to update dish ${dishId} visibility: ${errorMessage}`);
    }
  }
}

export default DishesService;
