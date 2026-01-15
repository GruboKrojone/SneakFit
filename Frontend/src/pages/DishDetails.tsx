import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DishesService, { Dish } from "../services/DishesService";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";
import Undo from "@mui/icons-material/Undo";
import PlayCircle from "@mui/icons-material/PlayCircle";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import EditSquare from "@mui/icons-material/EditSquare";
import MacroCircle from "../components/MacroCircle";
import "./styles/DishDetails.css";
import { useTranslation } from "react-i18next";

export default function DishDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = useState<Dish | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [servings, setServings] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hasFetched = useRef<number | null>(null);
  const totalImages = 5;
  const emptyCategories = t("no_categories");

  const getImageStyle = (index: number) => {
    let offset = index - currentImageIndex;

    if (offset > totalImages / 2) {
      offset -= totalImages;
    } else if (offset < -totalImages / 2) {
      offset += totalImages;
    }

    const absOffset = Math.abs(offset);
    const isCenter = offset === 0;
    const direction = offset > 0 ? 1 : -1;

    let scale = 0.6;
    let opacity = 0;
    let zIndex = 1;
    let translateX = direction * absOffset * 100;

    if (isCenter) {
      scale = 0.9;
      opacity = 1;
      zIndex = 10;
      translateX = 0;
    } else if (absOffset === 1) {
      scale = 0.7;
      opacity = 0.5;
      zIndex = 5;
    } else if (absOffset === 2) {
      scale = 0.5;
      opacity = 0.25;
      zIndex = 3;
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
      const data = await DishesService.getDishById(dishId);
      setDish(data);
      setIsLoading(false);
    };
    load();
  }, [id]);

  if (isLoading)
    return (
      <div className="loading-container">
        <p>Loading...</p>
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
      <div className="dish-grid">
        <div className="grid-item grid-1">
          <div className="dish-image-box">
            <div className="carousel-container">
              <button
                className="carousel-arrow carousel-arrow-left"
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === 0 ? totalImages - 1 : prev - 1
                  )
                }
                aria-label="Previous image"
              >
                <ChevronLeft className="carousel-arrow-icon" />
              </button>

              <div className="center-mode-slider">
                <div className="center-mode-container">
                  {Array.from({ length: totalImages }).map((_, index) => {
                    const { scale, opacity, zIndex, translateX } =
                      getImageStyle(index);
                    const isCenter = index === currentImageIndex;

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
                        {!dish.mainImageId || dish.mainImageId <= 1 ? (
                          <RestaurantMenu className="carousel-placeholder-icon" />
                        ) : (
                          <img alt={`${dish.name} view ${index + 1}`} />
                        )}
                        {isCenter && (
                          <div className="edit-icon-overlay">
                            <EditSquare className="edit-icon-overlay-icon" />
                          </div>
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
                    prev === totalImages - 1 ? 0 : prev + 1
                  )
                }
                aria-label="Next image"
              >
                <ChevronRight className="carousel-arrow-icon" />
              </button>
            </div>

            <div className="carousel-indicators">
              {Array.from({ length: totalImages }).map((_, index) => (
                <button
                  key={`carousel-indicator-${dish.id}-${index}`}
                  className={`indicator ${
                    index === currentImageIndex ? "active" : ""
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`Go to image ${index + 1}`}
                  type="button"
                />
              ))}
            </div>
          </div>
          <div className="categories-box">
            <div className="categories-content">
              {dish.categories && dish.categories.length > 0
                ? dish.categories.map((c) => c.name).join(", ")
                : emptyCategories}
            </div>
          </div>
        </div>

        <div className="grid-item grid-2">
          <div className="dish-name-container">
            <h1 className="dish-name-box">{dish.name}</h1>
            <div className="dish-name-icon">
              <EditSquare className="edit-square-icon" />
            </div>
          </div>
          <div className="description-container">
            <div className="description-box">
              <p>{dish.description ?? t("empty_description")}</p>
            </div>
            <div className="description-icon">
              <EditSquare className="edit-square-icon" />
            </div>
          </div>
        </div>

        <div className="grid-item grid-3">
          <div className="grid-3-left">
            <div className="ingredients-box">
              <h3 className="section-title">
                {t("dish_details_page_ingredients")}
              </h3>
              <div className="ingredients-list">
                {dish.ingredients && dish.ingredients.length > 0 ? (
                  <ul className="ingredients-ul">
                    {dish.ingredients.map((ing) => (
                      <li key={ing.id}>
                        {ing.name}: {ing.quantity}
                      </li>
                    ))}
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

              <div className="macros-grid">
                <div className="kcal-box">
                  <div className="kcal-value">{Math.round((dish.calories ?? 0) * servings)}</div>
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
              <div className="comments-box">
                {t("dish_details_page_comments")}
              </div>
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
    </div>
  );
}
