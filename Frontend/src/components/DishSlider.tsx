import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThumbDown from "@mui/icons-material/ThumbDown";
import Favorite from "@mui/icons-material/Favorite";
import ThumbUp from "@mui/icons-material/ThumbUp";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";

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
  const navigate = useNavigate();

  useEffect(() => {
    const loadDishes = async () => {
      try {
        const loadedDishes = await DishesService.getAllDishes();
        setDishes(loadedDishes);
      } catch (error) {
        console.error("Failed to load dishes:", error);
        setDishes(await DishesService.getAllDishes());
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

  const handleAnimationEnd = (cardIndex: number) => {
    return () => {
      if (cardIndex === currentIndex) {
        setCurrentIndex(currentIndex + 1);
        setLastAction(null);
        setActionCardIndex(null);
      }
    };
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

  if (isLoading) {
    return (
      <div className="dish-slider-container">
        <p style={{ color: "white", fontSize: "20px" }}>Loading dishes...</p>
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

    if (index === actionCardIndex && lastAction) {
      return {
        transform: "translateX(0) scale(1)",
        opacity: 1,
        filter: "blur(0px)",
        zIndex: 100,
      };
    }

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
          filter: offset > 0 ? "blur(5px)" : "blur(5px)",
          zIndex: 5,
        };
      case 2:
        return {
          transform: `translateX(${translate}px) scale(0.6)`,
          opacity: offset > 0 ? 0.3 : 0.3,
          filter: offset > 0 ? "blur(8px)" : "blur(8px)",
          zIndex: 2,
        };
      case 3:
        return {
          transform: `translateX(${translate}px) scale(0.5)`,
          opacity: 0,
          filter: "blur(10px)",
          zIndex: 1,
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

  const dishesToRender = Array.from(
    { length: 7 },
    (_, i) => currentIndex - 3 + i
  );

  return (
    <div className="dish-slider-container">
      <div className={`slider-wrapper ${isComplete ? "hidden" : ""}`}>
        {dishesToRender.map((index) => {
          let actualIndex = index;
          if (index < 0) {
            actualIndex = dishes.length + index;
          } else if (index >= dishes.length) {
            actualIndex = index - dishes.length;
          }

          if (actualIndex < 0 || actualIndex >= dishes.length) return null;

          const dish = dishes[actualIndex];
          const offset = index - currentIndex;

          return (
            <div
              key={`${dish.id}-${index}`}
              className={`dish-card ${
                actualIndex === actionCardIndex && lastAction
                  ? `action-${lastAction}`
                  : ""
              } ${offset === 0 ? "front-card" : ""}`}
              title={offset === 0 ? "Szczególy dania" : ""}
              style={getCardStyle(index) as React.CSSProperties}
              onClick={
                offset === 0 ? () => navigate(`/dish/${dish.id}`) : undefined
              }
              onAnimationEnd={handleAnimationEnd(index)}
            >
              <div className="dish-image">
                {!dish.mainPictureId || dish.mainPictureId <= 1 ? (
                  <RestaurantMenu sx={{ fontSize: 60, color: "white" }} />
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
                </div>
                {dish.description ? (
                  <p className="dish-description">{dish.description}</p>
                ) : (
                  <p className="dish-description">Brak opisu</p>
                )}
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
                    title="Pass"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePass();
                    }}
                  >
                    <ThumbDown sx={{ fontSize: 24 }} />
                  </button>
                  <button
                    className="action-button btn-smash"
                    title="Loved"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSmash();
                    }}
                  >
                    <Favorite sx={{ fontSize: 24 }} />
                  </button>
                  <button
                    className="action-button btn-loved"
                    title="Smash"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoved();
                    }}
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
          <h2>Niestety skończyły się przepisy</h2>
          <p>Wróć później po więcej pysznych opcji</p>
        </div>
      )}

      {dishes.length < 1 && !isLoading && (
        <div className="no-more-dishes visible">
          <h2>Niestety skończyły się przepisy</h2>
          <p>Wróć później po więcej pysznych opcji</p>
        </div>
      )}
    </div>
  );
}
