import { useState, useEffect } from "react";
import ThumbDown from "@mui/icons-material/ThumbDown";
import Favorite from "@mui/icons-material/Favorite";
import ThumbUp from "@mui/icons-material/ThumbUp";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";
import Star from "@mui/icons-material/Star";

import DishesService, { Dish } from "../services/DishesService";
import "./styles/DishSlider.css";

export default function DishSlider() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [lastAction, setLastAction] = useState<
    "pass" | "loved" | "smash" | null
  >(null);
  const [actionCardIndex, setActionCardIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadDishes = async () => {
      try {
        const loadedDishes = await DishesService.getAllDishes();
        setDishes(loadedDishes);
      } catch (error) {
        console.error("Failed to load dishes:", error);
        setDishes(DishesService.getSampleDishes());
      } finally {
        setIsLoading(false);
      }
    };

    loadDishes();
  }, []);

  useEffect(() => {
    if (currentIndex >= dishes.length && dishes.length > 0) {
      setIsComplete(true);
    }
  }, [currentIndex, dishes.length]);

  const handlePass = () => {
    setLastAction("pass");
    setActionCardIndex(currentIndex);
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setLastAction(null);
      setActionCardIndex(null);
    }, 500);
  };

  const handleLoved = () => {
    setLastAction("loved");
    setActionCardIndex(currentIndex);
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setLastAction(null);
      setActionCardIndex(null);
    }, 500);
  };

  const handleSmash = () => {
    setLastAction("smash");
    setActionCardIndex(currentIndex);
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setLastAction(null);
      setActionCardIndex(null);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="dish-slider-container">
        <p style={{ color: "white", fontSize: "20px" }}>Loading dishes...</p>
      </div>
    );
  }

  if (dishes.length === 0) {
    return (
      <div className="dish-slider-container">
        <div className="no-more-dishes">
          <h2>🎉 No more dishes to explore!</h2>
          <p>Come back later for more delicious options</p>
        </div>
      </div>
    );
  }

  const getCardStyle = (index: number) => {
    const offset = index - currentIndex;
    const absOffset = Math.abs(offset);
    const isMobile = window.innerWidth <= 768;
    const baseTranslate = isMobile ? 30 : 120;
    const translate =
      offset > 0 ? absOffset * baseTranslate : -absOffset * baseTranslate;

    switch (absOffset) {
      case 0:
        return {
          transform: "translateX(0) scale(1)",
          opacity: 1,
          filter: "blur(0px)",
          zIndex: 10,
        };
      case 1:
        return {
          transform: `translateX(${translate}px) scale(0.8)`,
          opacity: 0.6,
          filter: "blur(5px)",
          zIndex: 5,
        };
      case 2:
        return {
          transform: `translateX(${translate}px) scale(0.6)`,
          opacity: 0.3,
          filter: "blur(8px)",
          zIndex: 2,
        };
      default:
        return {
          transform: `translateX(${translate}px) scale(0.5)`,
          opacity: 0,
          filter: "blur(10px)",
          zIndex: 1,
        };
    }
  };

  return (
    <div className="dish-slider-container">
      <div className={`slider-wrapper ${isComplete ? "hidden" : ""}`}>
        {dishes.map((dish, index) => {
          const offset = Math.abs(index - currentIndex);
          if (offset > 2) return null;

          return (
            <div
              key={dish.id}
              className="dish-card"
              style={
                {
                  ...getCardStyle(index),
                  zIndex:
                    index === currentIndex && lastAction
                      ? 100
                      : (getCardStyle(index).zIndex as number),
                } as React.CSSProperties
              }
            >
              <div className="dish-image">
                <RestaurantMenu sx={{ fontSize: 60, color: "white" }} />
                {index === actionCardIndex && lastAction && (
                  <div className={`action-overlay action-${lastAction}`}>
                    {lastAction === "pass" && "PASS"}
                    {lastAction === "smash" && "SMASH"}
                    {lastAction === "loved" && "LOVED"}
                  </div>
                )}
              </div>
              <div className="dish-info">
                <div className="dish-header">
                  <h2 className="dish-name">{dish.name}</h2>
                  <div className="dish-rating">
                    <Star sx={{ fontSize: 20, color: "#ffd700" }} />
                    {dish.rates}
                  </div>
                </div>
                <p className="dish-owner">by {dish.ownerName}</p>
                <div className="dish-categories">
                  {dish.categories.map((cat) => (
                    <span key={cat.id} className="category-tag">
                      {cat.name}
                    </span>
                  ))}
                </div>
                <div className="dish-actions">
                  <button
                    className="action-button btn-pass"
                    onClick={handlePass}
                  >
                    <ThumbDown sx={{ fontSize: 24 }} />
                  </button>
                  <button
                    className="action-button btn-smash"
                    onClick={handleSmash}
                  >
                    <Favorite sx={{ fontSize: 24 }} />
                  </button>
                  <button
                    className="action-button btn-loved  "
                    onClick={handleLoved}
                  >
                    <ThumbUp sx={{ fontSize: 24 }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isComplete && (
        <div className="no-more-dishes visible">
          <h2>No more dishes to explore!</h2>
          <p>Come back later for more delicious options</p>
        </div>
      )}
    </div>
  );
}
