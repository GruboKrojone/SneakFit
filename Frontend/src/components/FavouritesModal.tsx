import { useState, useEffect } from "react";
import Close from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import DishImage from "./DishImage";
import { useNavigate, useParams } from "react-router-dom";
import { getFavouriteRecipeIds, removeFavouriteRecipe } from "../utils/recipeStorage";
import { useFetchDishes } from "../hooks/useFetchDishes";
import type { Dish } from "../services/DishesService";
import "./styles/CreateDishModal.css";
import "./styles/FavouritesModal.css";

interface FavouriteModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function FavouriteModal({
  isOpen,
  onClose,
}: FavouriteModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { locale } = useParams<{ locale: string }>();
  const { dishes } = useFetchDishes();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState<Set<number>>(new Set());
  const [favouriteDishes, setFavouriteDishes] = useState<Dish[]>([]);

  useEffect(() => {
    const favouriteIds = getFavouriteRecipeIds();
    const filteredDishes = dishes.filter(dish => favouriteIds.includes(dish.id));
    setFavouriteDishes(filteredDishes);
  }, [dishes, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectionMode(false);
      setSelectedDishes(new Set());
    }
  }, [isOpen]);

  const handleDishClick = (dishId: number) => {
    if (!selectionMode) {
      navigate(`/${locale}/dish/${dishId}`);
      onClose();
    }
  };

  const handleCheckboxChange = (dishId: number) => {
    setSelectedDishes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dishId)) {
        newSet.delete(dishId);
      } else {
        newSet.add(dishId);
      }
      return newSet;
    });
  };

  const handleRemoveSelected = () => {
    selectedDishes.forEach(dishId => {
      removeFavouriteRecipe(dishId);
    });
    setSelectedDishes(new Set());
    setSelectionMode(false);
    
    const favouriteIds = getFavouriteRecipeIds();
    const filteredDishes = dishes.filter(dish => favouriteIds.includes(dish.id));
    setFavouriteDishes(filteredDishes);
  };

  return (
    <div
      className={`modal-overlay favourite-modal-overlay ${isOpen ? "open" : ""}`}
      onPointerDown={onClose}
    >
      <div className="modal-content" onPointerDown={(e) => e.stopPropagation()}>
        <button
          className="close-button"
          onClick={onClose}
          title={t("close")}
        >
          <Close className="close-icon" />
        </button>

        <h2 className="modal-title">{t("favourites")}</h2>

        <div className="favourite-controls">
          <label className="selection-mode-label">
            <input
              type="checkbox"
              checked={selectionMode}
              onChange={(e) => setSelectionMode(e.target.checked)}
            />
            <span>{t("select_mode")}</span>
          </label>

          {selectionMode && selectedDishes.size > 0 && (
            <button
              className="remove-favourites-button"
              onClick={handleRemoveSelected}
            >
              {t("remove_from_favourites")} ({selectedDishes.size})
            </button>
          )}
        </div>

        {favouriteDishes.length === 0 ? (
          <div className="empty-favourites">
            <p>{t("no_favourites")}</p>
          </div>
        ) : (
          <div className="favourite-dishes-grid">
            {favouriteDishes.map(dish => (
              <button
                key={dish.id}
                type="button"
                className={`favourite-dish-card ${selectionMode ? "" : "clickable"}`}
                onClick={() => handleDishClick(dish.id)}
              >
                {selectionMode && (
                  <div className="dish-checkbox-container">
                    <input
                      type="checkbox"
                      className="dish-checkbox"
                      checked={selectedDishes.has(dish.id)}
                      onChange={() => handleCheckboxChange(dish.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}

                <div className="favourite-dish-image">
                  <DishImage 
                    dishId={dish.id} 
                    alt={dish.name} 
                    placeholderClassName="favourite-restaurant-icon"
                  />
                </div>

                <div className="favourite-dish-info">
                  <h3 className="favourite-dish-name">{dish.name}</h3>
                  {dish.categories.length > 0 && (
                    <div className="favourite-dish-categories">
                      {dish.categories.slice(0, 2).map(cat => (
                        <span key={cat.id} className="favourite-category-tag">
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
