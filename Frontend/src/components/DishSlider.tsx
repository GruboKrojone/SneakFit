import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ThumbDown from "@mui/icons-material/ThumbDown";
import Favorite from "@mui/icons-material/Favorite";
import ThumbUp from "@mui/icons-material/ThumbUp";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import { ClipLoader } from "react-spinners";

import DishesService, { Dish } from "../services/DishesService";
import CreateDishModal from "./CreateDishModal";
import "./styles/DishSlider.css";
import { useTranslation } from "react-i18next";

export default function DishSlider() {
  const { t } = useTranslation();
  const { locale } = useParams<{ locale: string }>();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastAction, setLastAction] = useState<"pass" | "loved" | "smash" | null>(null);
  const [actionCardIndex, setActionCardIndex] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadDishes = async () => {
      try {
        const loadedDishes = await DishesService.getAllDishes();
        setDishes(loadedDishes);
      } catch (error) {
        console.error("Failed to load dishes:", error);
        setDishes([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadDishes();
  }, []);

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAnimationEnd = (cardIndex: number) => () => {
    if (cardIndex === currentIndex) {
      setCurrentIndex(currentIndex + 1);
      setLastAction(null);
      setActionCardIndex(null);
    }
  };

  const handlePass = () => {
    setLastAction("pass");
    setActionCardIndex(currentIndex);
  };
  const handleLoved = () => {
    setLastAction("loved");
    setActionCardIndex(currentIndex);
  };
  const handleSmash = () => {
    setLastAction("smash");
    setActionCardIndex(currentIndex);
  };

  const getCardStyle = (index: number) => {
    const offset = index - currentIndex;
    const absOffset = Math.abs(offset);

    const containerWidth = sliderRef.current?.offsetWidth || dimensions.width;
    const isMobile = dimensions.width <= 768;
    const cardWidth = isMobile ? containerWidth * 0.95 : Math.min(containerWidth * 0.9, 400);

    const maxSafeTranslate = (containerWidth - cardWidth) / 2;
    const baseTranslate = Math.min(isMobile ? 50 : 200, maxSafeTranslate / 3);

    const translate = offset > 0 ? absOffset * baseTranslate : -absOffset * baseTranslate;

    if (index === actionCardIndex && lastAction) {
      return { transform: "translateX(0) scale(1)", opacity: 1, filter: "blur(0px)", zIndex: 100 };
    }

    switch (absOffset) {
      case 0: return { transform: "translateX(0) scale(1)", opacity: 1, filter: "blur(0px)", zIndex: 10 };
      case 1: return { transform: "translateX(" + translate + "px) scale(0.8)", opacity: 0.6, filter: "blur(5px)", zIndex: 5 };
      case 2: return { transform: "translateX(" + translate + "px) scale(0.6)", opacity: 0.3, filter: "blur(8px)", zIndex: 2 };
      case 3: return { transform: "translateX(" + translate + "px) scale(0.5)", opacity: 0, filter: "blur(10px)", zIndex: 1 };
      default: return { transform: "translateX(" + translate + "px) scale(0.5)", opacity: 0, filter: "blur(10px)", zIndex: 1 };
    }
  };

  const dishesToRender = Array.from({ length: 7 }, (_, i) => currentIndex - 3 + i);

  const getAddRecipeCard = (index: number) => {
    const cardKey = "add-recipe-" + index;
    return (
      <div
        key={cardKey}
        className="dish-card add-recipe-card"
        style={getCardStyle(index) as React.CSSProperties}
        onPointerDown={() => setIsModalOpen(true)}
      >
        <div className="add-recipe-card-info">
          <p className="add-recipe-card-text">
            {t("no_more_dishes")}
          </p>
          <div className="add-recipe-card-icon">
            <AddCircleOutline id="add-recipe-icon" />
          </div>
          <p className="add-recipe-card-text">{t("add_own_dish")}</p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <ClipLoader color="#112270ff" size={60} />
          <p>{t("loading_dishes")}</p>
        </div>
      );
    }

    if (dishes.length === 0) {
      return getAddRecipeCard(0);
    }

    return (
      <>
        {dishesToRender.map((index) => {
          let actualIndex = index;
          if (index < 0) actualIndex = dishes.length + index;
          else if (index >= dishes.length) return getAddRecipeCard(index);

          if (actualIndex < 0 || actualIndex >= dishes.length) return null;

          const dish = dishes[actualIndex];
          const offset = index - currentIndex;
          const cardKey = dish.id + "-" + index;
          const actionClass = actualIndex === actionCardIndex && lastAction ? "action-" + lastAction : "";
          const frontCardClass = offset === 0 ? "front-card" : "";
          const classNames = "dish-card " + actionClass + " " + frontCardClass;
          const cardTitle = offset === 0 ? t("dish_details") : "";
          const handlePointerDown = offset === 0 ? () => navigate("/" + locale + "/dish/" + dish.id) : undefined;

          return (
            <div
              key={cardKey}
              className={classNames}
              title={cardTitle}
              style={getCardStyle(index) as React.CSSProperties}
              onPointerDown={handlePointerDown}
              onAnimationEnd={handleAnimationEnd(index)}
            >
              <div className="dish-image">
                {!dish.mainImageId || dish.mainImageId <= 1 ? (
                  <RestaurantMenu sx={{ fontSize: 60, color: "white" }} />
                ) : (
                  <img alt={dish.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
                {index === actionCardIndex && lastAction && (
                  <div className={"action-overlay action-" + lastAction}>
                    {lastAction === "pass" && "PASS"}
                    {lastAction === "smash" && "SMASH"}
                    {lastAction === "loved" && "LOVED"}
                  </div>
                )}
              </div>
              <div className="dish-info">
                <div className="dish-header">
                  <h2 className="dish-name">{dish.name}</h2>
                </div>
                <p className="dish-description">
                  {dish.description || t("empty_description")}
                </p>
                <div className="dish-categories">
                  {dish.categories.map((cat) => (
                    <span key={cat.id} className="category-tag">{cat.name}</span>
                  ))}
                </div>
                <div className="dish-actions">
                  <button className="action-button btn-pass" title="Pass" onPointerDown={(e) => { e.stopPropagation(); handlePass(); }}>
                    <ThumbDown sx={{ fontSize: 24 }} />
                  </button>
                  <button className="action-button btn-smash" title="Loved" onPointerDown={(e) => { e.stopPropagation(); handleLoved(); }}>
                    <Favorite sx={{ fontSize: 24 }} />
                  </button>
                  <button className="action-button btn-loved" title="Smash" onPointerDown={(e) => { e.stopPropagation(); handleSmash(); }}>
                    <ThumbUp sx={{ fontSize: 24 }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className={"slider-wrapper"} ref={sliderRef}>
      <CreateDishModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {renderContent()}
    </div>
  );
}