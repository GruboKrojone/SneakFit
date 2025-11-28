import { useEffect, useState } from "react";
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

export default function DishDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = useState<Dish | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [servings, setServings] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const totalImages = 5;

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
    let translateX = direction * absOffset * 60;

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
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      const parsed = Number(id);
      const data = await DishesService.getDishById(parsed);
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
        <p>Nie znaleziono dania</p>
      </div>
    );

  return (
    <div className="dish-details-container">
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
                        key={index}
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

            <div className="carousel-indicators" style={{ display: "none" }}>
              {Array.from({ length: totalImages }).map((_, index) => (
                <div
                  key={index}
                  className={`indicator ${
                    index === currentImageIndex ? "active" : ""
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>
          <div className="categories-box">
            <div className="categories-content">
              {dish.categories && dish.categories.length > 0
                ? dish.categories.map((c) => c.name).join(", ")
                : "Brak kategorii"}
            </div>
          </div>
        </div>

        <div className="grid-item grid-2">
          <div className="dish-name-container">
            <h1 className="dish-name-box">{dish.name}</h1>
            <div className="edit-icon">
              <EditSquare sx={{ fontSize: 24, color: "white" }} />
            </div>
          </div>
          <div className="description-container">
            <div className="description-box">
              <p>{dish.description ?? "Brak opisu"}</p>
            </div>
            <div className="edit-icon description-icon">
              <EditSquare sx={{ fontSize: 24, color: "white" }} />
            </div>
          </div>
        </div>

        <div className="grid-item grid-3">
          <div className="grid-3-left">
            <div className="ingredients-box">
              <h3 className="section-title">Składniki:</h3>
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
                  <p>Brak składników</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid-3-right">
            <div className="servings-section">
              <div className="servings-box">
                <h3 className="section-title">Porcje:</h3>
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
                  <div className="kcal-value">{dish.calories ?? 0}</div>
                  <div className="kcal-label">kcal</div>
                </div>
                <MacroCircle
                  value={dish.protein ?? 0}
                  label="białko"
                  maxValue={100}
                />
                <MacroCircle
                  value={dish.carbs ?? 0}
                  label="węglowodany"
                  maxValue={100}
                />
                <MacroCircle
                  value={dish.fat ?? 0}
                  label="tłuszcze"
                  maxValue={100}
                />
              </div>
              <div className="comments-box">Komentarze</div>
            </div>
          </div>
        </div>

        <div className="grid-item grid-4">
          <div className="action-buttons">
            <button className="btn btn-decline" onClick={() => navigate(-1)}>
              <Undo sx={{ fontSize: 64, marginRight: 1 }} />
              Nie dziś
            </button>
            <button className="btn btn-accept">
              <PlayCircle sx={{ fontSize: 164, marginRight: 1 }} />
              Zaczynamy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}