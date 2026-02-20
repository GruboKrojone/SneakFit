import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";
import Undo from "@mui/icons-material/Undo";
import SaveIcon from "@mui/icons-material/Save";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import MacroCircle from "./MacroCircle";
import "../pages/styles/DishDetails.css";
import "./styles/AiRecipeModal.css";
import {
  AiGeneratedDishProperties,
} from "../services/AiService";
import DishesService from "../services/DishesService";
import IngredientsService from "../services/IngredientsService";
import AuthService from "../services/AuthService";
import CategoriesService from "../services/CategoriesService";
import PlayCircle from "@mui/icons-material/PlayCircle";
import AiDishPreparation from "./AiDishPreparation";

interface AiDishDetailsProps {
  readonly recipe?: string;
  readonly onClose?: () => void;
}

export default function AiDishDetails({
  recipe: propRecipe,
  onClose,
}: AiDishDetailsProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { locale } = useParams<{ locale: string }>();
  const [servings, setServings] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    new Set(),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<"details" | "preparation">("details");

  const recipe = propRecipe || location.state?.recipe;
  const params = location.state?.params as
    | AiGeneratedDishProperties
    | undefined;

  useEffect(() => {
    if (!recipe) {
      navigate(-1);
    }
  }, [recipe, navigate]);

  if (!recipe) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  interface AiIngredient {
    name: string;
    quantity: string;
  }

  interface AiRecipeResponse {
    name: string;
    description: string;
    categories: string[];
    ingredients: AiIngredient[];
    steps: string[];
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    fullMarkdown: string;
  }

  const parseRecipe = (jsonString: string) => {
    if (!jsonString) return null;
    try {
      let cleanJson = jsonString;

      const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
      const markdownMatch = markdownRegex.exec(jsonString);
      if (markdownMatch) {
        cleanJson = markdownMatch[1];
      } else {
        const braceRegex = /\{[\s\S]*\}/g;
        const braceMatch = braceRegex.exec(jsonString);
        if (braceMatch) {
          cleanJson = braceMatch[0];
        }
      }

      let processedJson = cleanJson.trim();
      
      processedJson = processedJson.split('":').map((part, i) => {
        if (i === 0) return part;
        const valueRegex = /^\s*"([\s\S]*?)"(?=\s*[,\]}])/;
        const match = valueRegex.exec(part);
        if (match) {
          const escaped = match[1].replace(/\n/g, "\\n").replace(/\r/g, "\\r");
          return ` "${escaped}"${part.slice(match[0].length)}`;
        }
        return part;
      }).join('":');

      processedJson = processedJson.replace(/,\s*([\]}])/g, "$1");

      const data = JSON.parse(processedJson);

      const getField = (obj: any, ...keys: string[]) => {
        for (const key of keys) {
          if (obj[key] !== undefined) return obj[key];
          const lowerKey = key.toLowerCase();
          const match = Object.keys(obj).find(k => k.toLowerCase() === lowerKey);
          if (match) return obj[match];
        }
        return undefined;
      };

      const name = getField(data, "name", "title") || "AI Recipe";
      const description = getField(data, "description", "desc", "about") || "";
      const categories = getField(data, "categories", "tags") || [];
      const ingredients = getField(data, "ingredients", "items") || [];
      const steps = getField(data, "steps", "instructions", "preparation") || [];
      const macros = getField(data, "macros", "nutrition") || {};

      return {
        name,
        description,
        categories: Array.isArray(categories) ? categories.map((c: any) => String(c).trim()) : [],
        ingredients: Array.isArray(ingredients) ? ingredients.map((ing: any) => {
           if (typeof ing === 'string') return { name: ing, quantity: "" };
           return {
             name: String(getField(ing, "name") || ""),
             quantity: String(getField(ing, "quantity", "amount", "qty") || "")
           };
        }) : [],
        steps: Array.isArray(steps) ? steps : [],
        calories: getField(macros, "calories", "kcal") || 0,
        carbs: getField(macros, "carbs", "carbohydrates") || 0,
        protein: getField(macros, "protein", "proteins") || 0,
        fat: getField(macros, "fat", "fats") || 0,
        fullMarkdown: jsonString,
      };
    } catch (e) {
      console.error("Failed to parse AI recipe JSON", e);
      const descMatch = /"description":\s*"([\s\S]*?)"/.exec(jsonString);
      const nameMatch = /"name":\s*"([\s\S]*?)"/.exec(jsonString);
      
      return {
        name: nameMatch ? nameMatch[1] : (t("error_parsing_recipe") || "Error"),
        description: descMatch ? descMatch[1].replace(/\\n/g, "\n") : "",
        categories: [],
        ingredients: [],
        steps: [],
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
        fullMarkdown: jsonString,
      };
    }
  };

  const parsedRecipe = parseRecipe(recipe) as AiRecipeResponse | null;
  if (!parsedRecipe) return null;

  if (view === "preparation") {
    return (
      <AiDishPreparation
        steps={parsedRecipe.steps}
        onBack={() => setView("details")}
      />
    );
  }

  const toggleIngredientCheck = (ingredientName: string) => {
    setCheckedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientName)) {
        newSet.delete(ingredientName);
      } else {
        newSet.add(ingredientName);
      }
      return newSet;
    });
  };

  const saveCategories = async (dishId: number) => {
    if (!params?.categories || params.categories.length === 0) return;
    for (const cat of params.categories) {
      try {
        await CategoriesService.assignToDish(cat.id, dishId);
      } catch (e) {
        console.error("Failed to assign category", cat.id, e);
      }
    }
  };

  const saveIngredients = async (dishId: number) => {
    for (const ing of parsedRecipe.ingredients) {
      try {
        const added = await IngredientsService.addIngredient({
          name: ing.name.substring(0, 100),
          description: ing.quantity.substring(0, 280),
        });
        await IngredientsService.assignToDish(added.id, dishId);
      } catch (e) {
        console.error("Failed to save ingredient", ing.name, e);
      }
    }
  };

  const saveSteps = async (dishId: number) => {
    for (let i = 0; i < parsedRecipe.steps.length; i++) {
      try {
        await DishesService.addStep(
          dishId,
          `${t("dish_preparation_step_label")} ${i + 1}`,
          parsedRecipe.steps[i].substring(0, 500),
        );
      } catch (e) {
        console.error("Failed to save step", i + 1, e);
      }
    }
  };

  const handleSaveDish = async () => {
    setIsSaving(true);
    try {
      const currentUser = AuthService.getCurrentUser();
      const ownerId = currentUser ? currentUser.id : 0;
      const ownerName = currentUser ? currentUser.name || currentUser.email : "";

      const created = await DishesService.createDish({
        name: parsedRecipe.name.substring(0, 100),
        description: parsedRecipe.description.substring(0, 280),
        calories: parsedRecipe.calories,
        protein: parsedRecipe.protein,
        carbs: parsedRecipe.carbs,
        fat: parsedRecipe.fat,
        rates: 0,
        ownerId,
        userId: ownerId,
        ownerName,
        isPublic: false,
        categories: [],
        mainImageId: 1,
        secondaryImageId: null,
        thirdImageId: null,
      });

      await saveCategories(created.id);
      await saveIngredients(created.id);
      await saveSteps(created.id);

      toast.success(t("ai_save_success"));
      navigate(`/${locale}/dish/${created.id}`);
    } catch (error) {
      console.error("Failed to save AI dish", error);
      toast.error(t("ai_save_error"));
    } finally {
      setIsSaving(false);
    }
  };

  const scaleIngredient = (text: string, scale: number) => {
    if (scale === 1) return text;

    const unicodeFractions: { [key: string]: number } = {
      "¼": 0.25,
      "½": 0.5,
      "¾": 0.75,
      "⅓": 1 / 3,
      "⅔": 2 / 3,
      "⅕": 0.2,
      "⅖": 0.4,
      "⅗": 0.6,
      "⅘": 0.8,
      "⅙": 1 / 6,
      "⅚": 5 / 6,
      "⅛": 0.125,
      "⅜": 0.375,
      "⅝": 0.625,
      "⅞": 0.875,
    };

    const mixedUnicodeMatch = /^(\d+)\s*([¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])(.*)/.exec(text);
    if (mixedUnicodeMatch) {
      const whole = Number.parseInt(mixedUnicodeMatch[1], 10);
      const frac = unicodeFractions[mixedUnicodeMatch[2]];
      const val = (whole + frac) * scale;
      return (
        Number.parseFloat(val.toFixed(2)).toString() + mixedUnicodeMatch[3]
      );
    }

    const simpleUnicodeMatch = /^([¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])(.*)/.exec(text);
    if (simpleUnicodeMatch) {
      const frac = unicodeFractions[simpleUnicodeMatch[1]];
      const val = frac * scale;
      return (
        Number.parseFloat(val.toFixed(2)).toString() + simpleUnicodeMatch[2]
      );
    }

    const mixedMatch = /^(\d+)\s+(\d+)\s*\/\s*(\d+)(.*)/.exec(text);
    if (mixedMatch) {
      const whole = Number.parseInt(mixedMatch[1], 10);
      const num = Number.parseInt(mixedMatch[2], 10);
      const den = Number.parseInt(mixedMatch[3], 10);
      const val = (whole + num / den) * scale;
      return Number.parseFloat(val.toFixed(2)).toString() + mixedMatch[4];
    }

    const fractionMatch = /^(\d+)\s*\/\s*(\d+)(.*)/.exec(text);
    if (fractionMatch) {
      const val =
        (Number.parseInt(fractionMatch[1], 10) /
          Number.parseInt(fractionMatch[2], 10)) *
        scale;
      return Number.parseFloat(val.toFixed(2)).toString() + fractionMatch[3];
    }

    const numberMatch = /^([\d.,]+)(.*)/.exec(text);
    if (numberMatch) {
      const numStr = numberMatch[1].replace(",", ".");
      if (!Number.isNaN(Number(numStr))) {
        const val = Number.parseFloat(numStr) * scale;
        return Number.parseFloat(val.toFixed(2)).toString() + numberMatch[2];
      }
    }
    return text;
  };

  return (
    <div className="dish-details-content ai-dish-details">
      <div className="dish-grid">
        <div className="grid-item grid-1">
          <div className="dish-image-box">
            <div className="carousel-container">
              <div className="center-mode-slider">
                <div className="center-mode-container">
                  <div className="center-mode-item ai-static-item">
                    <RestaurantMenu className="carousel-placeholder-icon" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="categories-box">
            <div className="categories-content">
              {params?.categories && params.categories.length > 0 ? (
                params.categories.map((cat) => {
                  let categoryName = cat.nameEn;
                  if (i18n.language === "pl") categoryName = cat.namePl;
                  else if (i18n.language === "de") categoryName = cat.nameDe;
                  else if (i18n.language === "es") categoryName = cat.nameEs;

                  return (
                    <span key={cat.id} className="category-detail-tag orange">
                      {categoryName}
                    </span>
                  );
                })
              ) : (
                <span className="no-categories-text">{t("no_categories")}</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid-item grid-2">
          <div className="dish-name-container">
            <h1 className="dish-name-box">{parsedRecipe.name}</h1>
          </div>
          <div className="description-container">
            <div className="description-box">
              <p>{parsedRecipe.description || t("empty_description")}</p>
            </div>
          </div>
        </div>

        <div className="grid-item grid-3">
          <div className="grid-3-left">
            <div className="ingredients-box">
              <div className="ingredients-header">
                <h3 className="section-title">
                  {t("dish_details_page_ingredients")}
                </h3>
              </div>
              <div className="ingredients-list">
                <ul className="ingredients-ul">
                  {parsedRecipe.ingredients.map((ing, idx) => {
                    const scaledQty = scaleIngredient(ing.quantity, servings);
                    const ingredientKey = `${ing.name}-${idx}`;
                    return (
                      <li key={ingredientKey} className="ingredient-item">
                        <button
                          className="ingredient-label"
                          onClick={() => toggleIngredientCheck(ing.name)}
                        >
                          {checkedIngredients.has(ing.name) ? (
                            <CheckCircleIcon className="ingredient-checked-icon" />
                          ) : (
                            <RadioButtonUncheckedIcon className="ingredient-unchecked-icon" />
                          )}
                          <span
                            className={
                              checkedIngredients.has(ing.name)
                                ? "ingredient-name checked"
                                : "ingredient-name"
                            }
                          >
                            {ing.name}
                          </span>
                          {ing.quantity && (
                            <span
                              className={
                                checkedIngredients.has(ing.name)
                                  ? "ingredient-quantity checked"
                                  : "ingredient-quantity"
                              }
                            >
                              {scaledQty}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid-3-right">
            <div className="servings-section">
              <div className="servings-box">
                <h3 className="section-title">
                  {t("dish_details_page_serving_size")}
                </h3>
                <div className="servings-controls">
                  <button
                    className="servings-btn"
                    onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                  >
                    −
                  </button>
                  <span className="servings-number">{servings}</span>
                  <button
                    className="servings-btn"
                    onClick={() => setServings(servings + 0.5)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="macros-container">
                <div className="macros-grid">
                  <div className="kcal-box">
                    <div className="kcal-value">
                      {Math.round(parsedRecipe.calories * servings)}
                    </div>
                    <div className="kcal-label">
                      {t("dish_details_macro_circle_calories")}
                    </div>
                  </div>
                  <MacroCircle
                    value={Math.round(parsedRecipe.protein * servings)}
                    label={t("dish_details_macro_circle_proteins")}
                    maxValue={100}
                  />
                  <MacroCircle
                    value={Math.round(parsedRecipe.carbs * servings)}
                    label={t("dish_details_macro_circle_carbs")}
                    maxValue={100}
                  />
                  <MacroCircle
                    value={Math.round(parsedRecipe.fat * servings)}
                    label={t("dish_details_macro_circle_fats")}
                    maxValue={100}
                  />
                </div>
              </div>

              <div className="comments-button comments-button-spacer">
                <ChatBubbleOutline className="comments-button-icon" />
                <span>{t("dish_details_page_comments_button")}</span>
                <span className="comments-count">(0)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-item grid-4">
          <div className="grid-4-right action-buttons">
            <button className="btn btn-decline" onClick={handleClose}>
              <Undo className="undo-icon" />
              {t("dish_details_page_back_button")}
            </button>
            <button
              className="btn btn-accept"
              onClick={() => setView("preparation")}
              disabled={parsedRecipe.steps.length === 0}
            >
              <PlayCircle className="play-circle-icon" />
              {t("dish_details_page_start_button")}
            </button>
            <button
              className="btn btn-save"
              onClick={handleSaveDish}
              disabled={isSaving}
            >
              <SaveIcon className="play-circle-icon" />
              {isSaving ? t("ai_saving") : t("ai_save_to_library")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
