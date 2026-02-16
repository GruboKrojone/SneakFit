import AuthService from "./AuthService";
import { Category } from "./DishesService";

export enum DishTaste {
  Sweet = 0,
  Sour = 1,
  Salty = 2,
  Bitter = 3,
  Umami = 4,
  Spicy = 5,
  Savory = 6
}

export enum KitchenItem {
  Stove = 0,
  Oven = 1,
  Microwave = 2,
  Kettle = 3,
  SmallPot = 4,
  MediumPot = 5,
  LargePot = 6,
  FryingPan = 7,
  DeepPan = 8,
  Wok = 9,
  Lid = 10,
  ChefKnife = 11,
  ParingKnife = 12,
  CuttingBoard = 13,
  KnifeSharpener = 14,
  WoodenSpoon = 15,
  Spatula = 16,
  Ladle = 17,
  Tongs = 18,
  Whisk = 19,
  Peeler = 20,
  Grater = 21,
  Colander = 22,
  MixingBowl = 23,
  MeasuringCup = 24,
  KitchenScale = 25,
  FoodContainer = 26,
  AluminumFoil = 27,
  ClingFilm = 28,
  BakingPaper = 29,
  Blender = 30,
  HandMixer = 31,
  Toaster = 32
}

export enum Lang {
  EN = 0,
  PL = 1,
  DE = 2,
  ES = 3
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
