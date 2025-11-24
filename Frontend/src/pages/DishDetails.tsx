import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DishesService, { Dish } from "../services/DishesService";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";
import "./styles/DishDetails.css";

export default function DishDetails() {
  const { id } = useParams();
  const [dish, setDish] = useState<Dish | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [servings, setServings] = useState(1);

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
        {/* grid 1: images, categories */}
        <div className="grid-item grid-1">
          <div className="dish-image-box">
            {!dish.mainPictureId || dish.mainPictureId <= 1 ? (
              <RestaurantMenu sx={{ fontSize: 100, color: "white" }} />
            ) : (
              <img
                alt={dish.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}
          </div>
          <div className="categories-box">
            <div className="categories-content">
              {dish.categories && dish.categories.length > 0
                ? dish.categories.map((c) => c.name).join(", ")
                : "Brak kategorii"}
            </div>
          </div>
        </div>

        {/* grid 2: name, description */}
        <div className="grid-item grid-2">
          <h1 className="dish-name-box">{dish.name}</h1>
          <div className="description-box">
            <p>{dish.description ?? "Brak opisu"}</p>
          </div>
        </div>

        {/* grid 3: ingredients, servings, macros */}
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
                    onClick={() => setServings(Math.max(1, servings - 1))}
                  >
                    −
                  </button>
                  <span className="servings-number">{servings}</span>
                  <button
                    className="servings-btn"
                    onClick={() => setServings(servings + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="macros-grid">
                <div className="macro-item">
                  <div className="macro-value">{dish.calories ?? 0}</div>
                  <div className="macro-label">kcal</div>
                </div>
                <div className="macro-item">
                  <div className="macro-value">{dish.protein ?? 0}</div>
                  <div className="macro-label">białko</div>
                </div>
                <div className="macro-item">
                  <div className="macro-value">{dish.carbs ?? 0}</div>
                  <div className="macro-label">węglowodany</div>
                </div>
                <div className="macro-item">
                  <div className="macro-value">{dish.fat ?? 0}</div>
                  <div className="macro-label">tłuszcze</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* grid 4: buttons */}
        <div className="grid-item grid-4">
          <div className="action-buttons">
            <button className="btn btn-decline">Nie dziś</button>
            <button className="btn btn-accept">Zaczynamy</button>
          </div>
        </div>
      </div>
    </div>
  );
}
