import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ThumbDown from "@mui/icons-material/ThumbDown";
import Favorite from "@mui/icons-material/Favorite";
import ThumbUp from "@mui/icons-material/ThumbUp";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import { ClipLoader } from "react-spinners";

import { useFetchDishes } from "../hooks/useFetchDishes";
import CreateDishModal from "./CreateDishModal";
import "./styles/DishSlider.css";

export default function DishSlider() {
  const { locale } = useParams<{ locale: string }>();
  const { dishes, isLoading } = useFetchDishes();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastAction, setLastAction] = useState<
    "pass" | "loved" | "smash" | null
  >(null);
  const [actionCardIndex, setActionCardIndex] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth });
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAnimationEnd = (cardIndex: number) => {
    return () => {
      if (cardIndex === currentIndex) {
        setCurrentIndex(currentIndex + 1);
        setLastAction(null);
        setActionCardIndex(null);
      }
    };
  };

  const handleAction = (action: "pass" | "loved" | "smash") => {
    setLastAction(action);
    setActionCardIndex(currentIndex);
  };

  const getCardStyle = (index: number) => {
    const offset = index - currentIndex;
    const absOffset = Math.abs(offset);

    const containerWidth = sliderRef.current?.offsetWidth || dimensions.width;
    const isMobile = dimensions.width <= 768;
    const cardWidth = isMobile
      ? containerWidth * 0.95
      : Math.min(containerWidth * 0.9, 400);

    const maxSafeTranslate = (containerWidth - cardWidth) / 2;
    const baseTranslate = Math.min(isMobile ? 50 : 200, maxSafeTranslate / 3);

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

  const getAddRecipeCard = (index: number) => {
    return (
      <div
        key={`add-recipe-${index}`}
        className="dish-card add-recipe-card"
        style={getCardStyle(index) as React.CSSProperties}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="add-recipe-card-info">
            <p className="add-recipe-card-text">
              Niestety skończyły nam się pyszne przepisy,<br></br> lecz nic straconego!!!
            </p>
          <div className="add-recipe-card-icon">
            <AddCircleOutline id="add-recipe-icon" />
          </div>
            <p className="add-recipe-card-text">Dodaj własny żeby nikogo więcej<br></br> nie spotkała ta smutna wiadomość </p>
        </div>
      </div>
    );
  };

  return (
    <div className={"slider-wrapper"}>
      <CreateDishModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      {isLoading ? (
        <div className="loading-container">
          <ClipLoader color="#112270ff" size={60} />
          <p>Ładowanie dań...</p>
        </div>
      ) : dishes.length === 0 ? (
        getAddRecipeCard(0)
      ) : (
        <>
          {dishesToRender.map((index) => {
            let actualIndex = index;
            if (index < 0) {
              actualIndex = dishes.length + index;
            } else if (index >= dishes.length) {
              return getAddRecipeCard(index);
            }

            if (actualIndex < 0 || actualIndex >= dishes.length) {
              return null;
            }

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
                  offset === 0
                    ? () => navigate(`/${locale}/dish/${dish.id}`)
                    : undefined
                }
                onAnimationEnd={handleAnimationEnd(index)}
              >
                <div className="dish-image">
                  {!dish.mainImageId || dish.mainImageId <= 1 ? (
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
                        handleAction("pass");
                      }}
                    >
                      <ThumbDown sx={{ fontSize: 24 }} />
                    </button>
                    <button
                      className="action-button btn-smash"
                      title="Loved"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction("loved");
                      }}
                    >
                      <Favorite sx={{ fontSize: 24 }} />
                    </button>
                    <button
                      className="action-button btn-loved"
                      title="Smash"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction("smash");
                      }}
                    >
                      <ThumbUp sx={{ fontSize: 24 }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
