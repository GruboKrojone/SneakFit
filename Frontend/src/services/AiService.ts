import AuthService from "./AuthService";
import { Category } from "./DishesService";

export enum DishTaste {
  Spicy = 0,
  Sweet = 1,
  Salty = 2,
  Sour = 3,
  Bitter = 4,
  Savory = 5,
  Smoky = 6,
  Herbal = 7
}

export enum KitchenItem {
  Oven = 0,
  Stove = 1,
  Microwave = 2,
  Blender = 3,
  Mixer = 4,
  FryingPan = 5,
  Pot = 6,
  Knife = 7,
  CuttingBoard = 8,
  Grater = 9,
  Peeler = 10,
  Kettle = 11,
  Toaster = 12,
  KitchenScale = 13,
  AirFryer = 14
}

export enum Lang {
  EN = 1,
  PL = 2,
  DE = 3,
  ES = 4
}

export interface AiGeneratedDishProperties {
  categories: Category[];
  tastes: DishTaste[];
  requiredTools: KitchenItem[];
  lang: Lang;
}

class AiService {
  private static readonly baseUrl = "https://localhost:7059/ai";

  static async askAi(props: AiGeneratedDishProperties): Promise<string> {
    const token = AuthService.getToken();
    const response = await fetch(`${this.baseUrl}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(props),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to get AI response");
    }

    return await response.text();
  }
}

export default AiService;
