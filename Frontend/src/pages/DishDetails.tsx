import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DishesService, { Dish } from "../services/DishesService";
import CommentsService, { Comment } from "../services/CommentsService";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";
import SettingsIcon from "@mui/icons-material/Settings";
import DishSettingsModal from "../components/DishSettingsModal";
import Undo from "@mui/icons-material/Undo";
import PlayCircle from "@mui/icons-material/PlayCircle";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import ContentCopy from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import MacroCircle from "../components/MacroCircle";
import CommentsModal from "../components/CommentsModal";
import ImagesService from "../services/ImagesService";
import "./styles/DishDetails.css";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const getSortedImages = (allImages: { id: number; url: string }[], dish: Dish) => {
  const priorityIds = [dish.mainImageId, dish.secondaryImageId, dish.thirdImageId];
  const sorted: { id: number; url: string }[] = [];

  for (const id of priorityIds) {
    if (!id) continue;
    const found = allImages.find((img) => String(img.id) === String(id));
    if (found && !sorted.some((s) => s.id === found.id)) sorted.push(found);
  }

  for (const img of allImages) {
    if (!sorted.some((s) => s.id === img.id)) sorted.push(img);
  }
  return sorted;
};

const getCategoryName = (category: any, language: string) => {
  if (language === "pl") return category.namePl;
  if (language === "de") return category.nameDe;
  if (language === "es") return category.nameEs;
  return category.nameEn;
};

export default function DishDetails() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = useState<Dish | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [servings, setServings] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const hasFetched = useRef<number | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  let displayImages = imageUrls.length > 0 ? [...imageUrls] : [];
  if (imageUrls.length > 0) {
      while (displayImages.length < 5) {
          displayImages = [...displayImages, ...imageUrls];
      }
  }
  
  const totalImages = displayImages.length > 0 ? displayImages.length : 1;
  const uniqueCount = imageUrls.length > 0 ? imageUrls.length : 1;

  const emptyCategories = t("no_categories");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const getImageStyle = (index: number) => {
    let offset = index - currentImageIndex;

    if (offset > totalImages / 2) {
      offset -= totalImages;
    } else if (offset < -totalImages / 2) {
      offset += totalImages;
    }

    const absOffset = Math.abs(offset);
    const direction = offset > 0 ? 1 : -1;

    let scale = 0.6;
    let opacity = 0;
    let zIndex = 1;
    let translateX = direction * absOffset * 100;

    switch (absOffset) {
      case 0:
        scale = 0.9;
        opacity = 1;
        zIndex = 10;
        translateX = 0;
        break;
      case 1:
        scale = 0.7;
        opacity = 0.5;
        zIndex = 5;
        break;
      case 2:
        scale = 0.5;
        zIndex = 3;
        break;
    }

    return { scale, opacity, zIndex, translateX };
  };

  useEffect(() => {
    if (!id) return;
    const dishId = Number(id);
    if (hasFetched.current === dishId) return;
    hasFetched.current = dishId;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await DishesService.getDishById(dishId);
        if (data) {
           setDish(data);
           setServings(1);
           
           const commentsData = await CommentsService.getCommentsByDishId(dishId);
           setComments(commentsData);

           try {
             const allImages = await ImagesService.getAllImages(dishId);
             
             const sorted = getSortedImages(allImages, data);

             setImageUrls(sorted.map(s => s.url));
             setCurrentImageIndex(0);
           } catch(imgError) {
             toast.error(t("error_loading_dish\n"+imgError));
           }
        }
      } catch (error) {
        toast.error(t("error_loading_dish\n"+error));
      }
      setIsLoading(false);
    };
    load();
  }, [id, t]);

  const handleCommentAdded = (comment: Comment) => {
    setComments((prevComments) => [...prevComments, comment]);
  };

  const toggleIngredientCheck = (ingredientId: number) => {
    setCheckedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientId)) {
        newSet.delete(ingredientId);
      } else {
        newSet.add(ingredientId);
      }
      return newSet;
    });
  };

  const scaleIngredientQuantity = (description: string | null | undefined): string => {
    if (!description) return "";
    
    const regex = /^(\d+(?:[.,]\d+)?)\s*(.*)$/;
    const match = regex.exec(description);
    
    if (match) {
      const quantity = Number.parseFloat(match[1].replace(',', '.'));
      const unit = match[2];
      const scaledQuantity = quantity * servings;
      
      const formattedQuantity = scaledQuantity % 1 === 0 
        ? scaledQuantity.toString() 
        : scaledQuantity.toFixed(1).replace('.', ',');
      
      return `${formattedQuantity}${unit ? ' ' + unit : ''}`;
    }
    
    return description;
  };

  const copyIngredientsToClipboard = () => {
    if (!dish?.ingredients || dish.ingredients.length === 0) {
      toast.warning(t("dish_details_page_no_ingredients_to_copy"));
      return;
    }

    const ingredientsText = dish.ingredients
      .map((ing) => {
        const scaledQuantity = scaleIngredientQuantity(ing.description);
        return `${ing.name} ${scaledQuantity}`.trim();
      })
      .join("\n");

    navigator.clipboard.writeText(ingredientsText)
      .then(() => {
        toast.success(t("dish_details_page_ingredients_copied"));
      })
      .catch(() => {
        toast.error(t("dish_details_page_copy_failed"));
      });
  };

  const addToShoppingList = () => {
    if (!dish?.ingredients || dish.ingredients.length === 0) {
      toast.warning(t("dish_details_page_no_ingredients_to_copy"));
      return;
    }

    const currentList = JSON.parse(localStorage.getItem("sneakfit_shopping_list_v3") || "[]");
    const newItems = dish.ingredients.map((ing, index) => ({
      id: `${Date.now()}-${index}`,
      name: `${ing.name} ${scaleIngredientQuantity(ing.description)}`.trim(),
      completed: false
    }));
    
    localStorage.setItem("sneakfit_shopping_list_v3", JSON.stringify([...newItems, ...currentList]));
    toast.success(t("shopping_list_added_success"));
  };

  if (isLoading)
    return (
      <div className="loading-container">
        <p>{t("loading")}</p>
      </div>
    );
  if (!dish)
    return (
      <div className="loading-container">
        <p>{t("dish_details_page_no_dish_found")}</p>
      </div>
    );

  return (
    <div className="dish-details-content">
      <button
        className="settings-gear-btn"
        onClick={() => setSettingsOpen(true)}
        title={t("dish_details_page_settings_title")}
      >
        <SettingsIcon className="settings-gear-icon" />
      </button>
      <div className="dish-grid">
        <div className="grid-item grid-1">
          <div className="dish-image-box">
            <div className="carousel-container">
              <button
                className="carousel-arrow carousel-arrow-left"
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === 0 ? totalImages - 1 : prev - 1,
                  )
                }
                aria-label={t("carousel_previous_image")}
              >
                <ChevronLeft className="carousel-arrow-icon" />
              </button>

              <div className="center-mode-slider">
                <div className="center-mode-container">
                  {Array.from({ length: totalImages }).map((_, index) => {
                    const { scale, opacity, zIndex, translateX } =
                      getImageStyle(index);

                    const imgUrl = displayImages[index];

                    return (
                      <div
                        key={`carousel-image-${dish.id}-${index}`}
                        className="center-mode-item"
                        style={{
                          transform: `translateX(${translateX}px) scale(${scale})`,
                          opacity: opacity,
                          zIndex: zIndex,
                        }}
                      >
                        {imgUrl ? (
                           <img src={imgUrl} alt={`${dish.name} ${t("dish_alt_text")} ${index + 1}`} />
                        ) : (
                           <RestaurantMenu className="carousel-placeholder-icon" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                className="carousel-arrow carousel-arrow-right"
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === totalImages - 1 ? 0 : prev + 1,
                  )
                }
                aria-label={t("carousel_next_image")}
              >
                <ChevronRight className="carousel-arrow-icon" />
              </button>
            </div>

            <div className="carousel-indicators">
              {Array.from({ length: uniqueCount }).map((_, index) => (
                <button
                  key={`carousel-indicator-${dish.id}-${index}`}
                  className={`indicator ${
                    index === currentImageIndex % uniqueCount ? "active" : ""
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`${t("carousel_go_to_image")} ${index + 1}`}
                  type="button"
                />
              ))}
            </div>
          </div>
          <div className="categories-box">
            <div className="categories-content">
              {dish.categories && dish.categories.length > 0 ? (
                dish.categories.map((c) => (
                  <span 
                    key={c.id} 
                    className="category-detail-tag"
                    style={{ 
                      background: `${c.color}15`,
                      color: c.color,
                      borderColor: `${c.color}40`
                    }}
                  >
                    {getCategoryName(c, i18n.language)}
                  </span>
                ))
              ) : (
                <span className="no-categories-text">{emptyCategories}</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid-item grid-2">
          <div className="dish-name-container">
            <h1 className="dish-name-box">{dish.name}</h1>
          </div>
          <div className="description-container">
            <div className="description-box">
              <p>{dish.description ?? t("empty_description")}</p>
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
                {dish.ingredients && dish.ingredients.length > 0 && (
                  <button
                    className="copy-ingredients-btn"
                    onClick={copyIngredientsToClipboard}
                    title={t("dish_details_page_copy_ingredients")}
                  >
                    <ContentCopy className="copy-icon" />
                    {t("dish_details_page_copy_ingredients")}
                  </button>
                )}
                {dish.ingredients && dish.ingredients.length > 0 && (
                  <button
                    className="copy-ingredients-btn"
                    onClick={addToShoppingList}
                    title={t("add_to_shopping_list")}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    <AddShoppingCartIcon className="copy-icon" />
                    {t("add_to_shopping_list")}
                  </button>
                )}
              </div>
              <div className="ingredients-list">
                {dish.ingredients && dish.ingredients.length > 0 ? (
                  <ul className="ingredients-ul">
                    {dish.ingredients.map((ing) => {
                      const scaledQuantity = scaleIngredientQuantity(ing.description);
                      return (
                        <li 
                          key={ing.id} 
                          className="ingredient-item"
                        >
                          <button 
                            className="ingredient-label"
                            onClick={() => toggleIngredientCheck(ing.id)}
                            aria-label={checkedIngredients.has(ing.id) ? `Mark ${ing.name} as incomplete` : `Mark ${ing.name} as complete`}
                          >
                            {checkedIngredients.has(ing.id) ? (
                              <CheckCircleIcon className="ingredient-checked-icon" />
                            ) : (
                              <RadioButtonUncheckedIcon className="ingredient-unchecked-icon" />
                            )}
                            <span className={checkedIngredients.has(ing.id) ? "ingredient-name checked" : "ingredient-name"}>
                              {ing.name}
                            </span>
                            <span className={checkedIngredients.has(ing.id) ? "ingredient-quantity checked" : "ingredient-quantity"}>
                              {scaledQuantity}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p>{t("dish_details_page_empty_ingredients")}</p>
                )}
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
                      {Math.round((dish.calories ?? 0) * servings)}
                    </div>
                    <div className="kcal-label">
                      {t("dish_details_macro_circle_calories")}
                    </div>
                  </div>
                  <MacroCircle
                    value={Math.round((dish.protein ?? 0) * servings)}
                    label={t("dish_details_macro_circle_proteins")}
                    maxValue={100}
                  />
                  <MacroCircle
                    value={Math.round((dish.carbs ?? 0) * servings)}
                    label={t("dish_details_macro_circle_carbs")}
                    maxValue={100}
                  />
                  <MacroCircle
                    value={Math.round((dish.fat ?? 0) * servings)}
                    label={t("dish_details_macro_circle_fats")}
                    maxValue={100}
                  />
                </div>
              </div>
              <button
                className="comments-button"
                onClick={() => setIsCommentsModalOpen(true)}
              >
                <ChatBubbleOutline className="comments-button-icon" />
                <span>{t("dish_details_page_comments_button")}</span>
                <span className="comments-count">({comments.length})</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid-item grid-4">
          <div className="action-buttons">
            <button className="btn btn-decline" onClick={() => navigate(-1)}>
              <Undo className="undo-icon" />
              {t("dish_details_page_back_button")}
            </button>
            <button className="btn btn-accept">
              <PlayCircle className="play-circle-icon" />
              {t("dish_details_page_start_button")}
            </button>
          </div>
        </div>
      </div>

      {dish && (
        <CommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => setIsCommentsModalOpen(false)}
          dishId={dish.id}
          dishName={dish.name}
          comments={comments}
          onCommentAdded={handleCommentAdded}
        />
      )}
      <DishSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        dishId={dish.id}
        onUpdate={() => {
          hasFetched.current = null;
          const load = async () => {
            setIsLoading(true);
            const data = await DishesService.getDishById(dish.id);
            if (data) {
                setDish(data);
                try {
                  const allImages = await ImagesService.getAllImages(dish.id);
                  const sorted = getSortedImages(allImages, data);
                  setImageUrls(sorted.map(s => s.url));
                  setCurrentImageIndex(0);
                } catch (e) {
                   console.error("Failed to reload images", e);
                }
            }
            setIsLoading(false);
          };
          load();
        }}
      />
    </div>
  );
}
