import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";
import Undo from "@mui/icons-material/Undo";
import ContentCopy from "@mui/icons-material/ContentCopy";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import MacroCircle from "./MacroCircle";
import ReactMarkdown from "react-markdown";
import "../pages/styles/DishDetails.css"; 
import { AiGeneratedDishProperties, DishTaste, KitchenItem } from "../services/AiService"; 

interface AiDishDetailsProps {
  readonly recipe?: string; 
  readonly onClose?: () => void; 
}

export default function AiDishDetails({ recipe: propRecipe, onClose }: AiDishDetailsProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [servings, setServings] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

  const recipe = propRecipe || location.state?.recipe;
  const params = location.state?.params as AiGeneratedDishProperties | undefined;

  const getTasteName = (id: number) => DishTaste[id];
  const getToolName = (id: number) => KitchenItem[id];

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

  interface AiRecipeResponse {
    name: string;
    categories?: string[];
    ingredients?: string[];
    steps?: string[];
    macros?: {
      calories: number;
      carbs: number;
      protein: number;
      fat: number;
    };
  }

  const parseRecipe = (jsonString: string) => {
    try {
      const cleanJson = jsonString.replace(/```json/g, "").replace(/```/g, "").trim(); // NOSONAR
      const data = JSON.parse(cleanJson) as AiRecipeResponse;

      return {
        name: data.name || "AI Recipe",
        categories: data.categories ? data.categories.map(c => c.trim()) : [],
        ingredients: data.ingredients || [],
        calories: data.macros?.calories || 0,
        carbs: data.macros?.carbs || 0,
        protein: data.macros?.protein || 0,
        fat: data.macros?.fat || 0,
        displayMarkdown: data.steps ? data.steps.map((step, i) => `${i + 1}. ${step}`).join("\n\n") : "",
        fullMarkdown: jsonString
      };
    } catch (e) {
      console.error("Failed to parse AI recipe JSON", e);
      return {
        name: t("error_parsing_recipe") || "Error",
        categories: [],
        ingredients: [],
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
        displayMarkdown: jsonString,
        fullMarkdown: jsonString
      };
    }
  };

  const parsedRecipe = parseRecipe(recipe);

  const toggleIngredientCheck = (ingredient: string) => {
    setCheckedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ingredient)) {
        newSet.delete(ingredient);
      } else {
        newSet.add(ingredient);
      }
      return newSet;
    });
  };

  const copyIngredientsToClipboard = () => {
    if (!parsedRecipe.ingredients || parsedRecipe.ingredients.length === 0) return;
    const scaledIngredients = parsedRecipe.ingredients.map(ing => scaleIngredient(ing, servings));
    navigator.clipboard.writeText(scaledIngredients.join("\n"))
      .then(() => toast.success(t("dish_details_page_ingredients_copied")))
      .catch(() => toast.error(t("dish_details_page_copy_failed")));
  };

  const scaleIngredient = (text: string, scale: number) => {
    if (scale === 1) return text;

    const unicodeFractions: {[key: string]: number} = { 
        '¼': 0.25, '½': 0.5, '¾': 0.75, 
        '⅓': 1/3, '⅔': 2/3, 
        '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8, 
        '⅙': 1/6, '⅚': 5/6, 
        '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875 
    };
    
    const mixedUnicodeMatch = /^(\d+)\s*([¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])(.*)/.exec(text);
    if (mixedUnicodeMatch) {
         const whole = Number.parseInt(mixedUnicodeMatch[1], 10);
         const frac = unicodeFractions[mixedUnicodeMatch[2]];
         const val = (whole + frac) * scale;
         return Number.parseFloat(val.toFixed(2)).toString() + mixedUnicodeMatch[3];
    }
    
    const simpleUnicodeMatch = /^([¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])(.*)/.exec(text);
    if (simpleUnicodeMatch) {
         const frac = unicodeFractions[simpleUnicodeMatch[1]];
         const val = frac * scale;
         return Number.parseFloat(val.toFixed(2)).toString() + simpleUnicodeMatch[2];
    }
    
    const mixedMatch = /^(\d+)\s+(\d+)\s*\/\s*(\d+)(.*)/.exec(text);
    if (mixedMatch) {
        const whole = Number.parseInt(mixedMatch[1], 10);
        const num = Number.parseInt(mixedMatch[2], 10);
        const den = Number.parseInt(mixedMatch[3], 10);
        const val = (whole + (num/den)) * scale;
        return Number.parseFloat(val.toFixed(2)).toString() + mixedMatch[4];
    }

    const fractionMatch = /^(\d+)\s*\/\s*(\d+)(.*)/.exec(text);
    if (fractionMatch) {
       const val = (Number.parseInt(fractionMatch[1], 10) / Number.parseInt(fractionMatch[2], 10)) * scale;
       return Number.parseFloat(val.toFixed(2)).toString() + fractionMatch[3];
    }
    
    const numberMatch = /^([\d.,]+)(.*)/.exec(text);
    if (numberMatch) {
       const numStr = numberMatch[1].replace(',', '.');
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
              {parsedRecipe.categories.length > 0 ? (
                parsedRecipe.categories.map((c) => (
                  <span key={c} className="category-detail-tag orange">
                    {c}
                  </span>
                ))
              ) : (
                <span className="no-categories-text">{t("no_categories")}</span>
              )}
            </div>
          </div>
          
          {params?.tastes && params.tastes.length > 0 && (
             <div className="categories-box ai-extra">
                <div className="categories-content">
                   {params.tastes.map(tId => {
                      const name = getTasteName(tId);
                      return name ? (
                         <span key={tId} className="category-detail-tag green">
                            {t(`dish_taste_${name.toLowerCase()}`)}
                         </span>
                      ) : null;
                   })}
                </div>
             </div>
          )}

          {params?.requiredTools && params.requiredTools.length > 0 && (
             <div className="categories-box ai-extra">
                <div className="categories-content">
                   {params.requiredTools.map(tId => {
                      const name = getToolName(tId);
                      return name ? (
                         <span key={tId} className="category-detail-tag blue">
                            {t(`kitchen_item_${name.toLowerCase()}`)}
                         </span>
                      ) : null;
                   })}
                </div>
             </div>
          )}
        </div>

        <div className="grid-item grid-2">
          <div className="dish-name-container">
            <h1 className="dish-name-box">{parsedRecipe.name}</h1>
          </div>
          <div className="description-container">
            <div className="description-box ai-recipe-markdown">
               <ReactMarkdown>{parsedRecipe.displayMarkdown}</ReactMarkdown>
            </div>
          </div>
        </div>

        <div className="grid-item grid-3">
          <div className="grid-3-left">
            <div className="ingredients-box">
              <div className="ingredients-header">
                <h3 className="section-title">{t("dish_details_page_ingredients")}</h3>
                <button className="copy-ingredients-btn" onClick={copyIngredientsToClipboard}>
                  <ContentCopy className="copy-icon" />
                  {t("dish_details_page_copy_ingredients")}
                </button>
              </div>
              <div className="ingredients-list">
                 <ul className="ingredients-ul">
                   {parsedRecipe.ingredients.map((ing) => {
                     const scaledIng = scaleIngredient(ing, servings);
                     return (
                     <li key={ing} className="ingredient-item">
                        <button 
                            className="ingredient-label"
                            onClick={() => toggleIngredientCheck(ing)}
                        >
                            {checkedIngredients.has(ing) ? <CheckCircleIcon className="ingredient-checked-icon" /> : <RadioButtonUncheckedIcon className="ingredient-unchecked-icon" />}
                            <span className={checkedIngredients.has(ing) ? "ingredient-name checked" : "ingredient-name"}>{scaledIng}</span>
                        </button>
                     </li>
                   )})}
                 </ul>
              </div>
            </div>
          </div>

          <div className="grid-3-right">
             <div className="servings-section">
                <div className="servings-box">
                   <h3 className="section-title">{t("dish_details_page_serving_size")}</h3>
                   <div className="servings-controls">
                      <button className="servings-btn" onClick={() => setServings(Math.max(0.5, servings - 0.5))}>−</button>
                      <span className="servings-number">{servings}</span>
                      <button className="servings-btn" onClick={() => setServings(servings + 0.5)}>+</button>
                   </div>
                </div>
                
                <div className="macros-container">
                    <div className="macros-grid">
                        <div className="kcal-box">
                            <div className="kcal-value">{Math.round(parsedRecipe.calories * servings)}</div>
                            <div className="kcal-label">{t("dish_details_macro_circle_calories")}</div>
                        </div>
                        <MacroCircle value={Math.round(parsedRecipe.protein * servings)} label={t("dish_details_macro_circle_proteins")} maxValue={100} />
                        <MacroCircle value={Math.round(parsedRecipe.carbs * servings)} label={t("dish_details_macro_circle_carbs")} maxValue={100} />
                        <MacroCircle value={Math.round(parsedRecipe.fat * servings)} label={t("dish_details_macro_circle_fats")} maxValue={100} />
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
          <div className="grid-4-left">
          </div>
          <div className="grid-4-right action-buttons">
            <button className="btn btn-decline" onClick={handleClose}>
              <Undo className="undo-icon" />
              {t("dish_details_page_back_button")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
