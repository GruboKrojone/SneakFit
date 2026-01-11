import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ThumbDown from "@mui/icons-material/ThumbDown";
import Favorite from "@mui/icons-material/Favorite";
import ThumbUp from "@mui/icons-material/ThumbUp";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import { ClipLoader } from "react-spinners";
import CreateDishModal from "./CreateDishModal";
import "./styles/DishSlider.css";
import { useTranslation } from "react-i18next";
import { useFetchDishes } from "../hooks/useFetchDishes";

type ActionType = "pass" | "loved" | "smash" | null;

export default function DishSlider() {
  const { t } = useTranslation();
  const { locale } = useParams<{ locale: string }>();
  const { dishes, isLoading, refetchDishes } = useFetchDishes();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastAction, setLastAction] = useState<ActionType>(null);
  const [actionCardIndex, setActionCardIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleActionTransitionEnd = (cardIndex: number) => () => {
    if (cardIndex === actionCardIndex && lastAction) {
      setLastAction(null);
      setIsAnimating(false);
      setDragOffset({ x: 0, y: 0 });
      setIsTransitioning(true);
    }
  };

  const handleTransitionEnd = (cardIndex: number) => () => {
    if (cardIndex === actionCardIndex && isTransitioning) {
      setCurrentIndex(currentIndex + 1);

      setTimeout(() => {
        setLastAction(null);
        setIsAnimating(false);
        setIsTransitioning(false);
        setActionCardIndex(null);
        setDragOffset({ x: 0, y: 0 });
      }, 30);
    }
  };

  const handleAction = (
    action: Exclude<ActionType, null>,
    fromDrag: boolean = false
  ) => {
    if (
      lastAction ||
      isAnimating ||
      isTransitioning ||
      actionCardIndex !== null
    ) {
      return;
    }

    setActionCardIndex(currentIndex);
    if (!fromDrag) {
      setDragOffset({ x: 0, y: 0 });
    }
    setIsAnimating(false);
    requestAnimationFrame(() => {
      setIsAnimating(true);
      requestAnimationFrame(() => {
        setLastAction(action);
      });
    });
  };

  const handleDragStart = (e: React.PointerEvent, index: number) => {
    if (
      index !== currentIndex ||
      lastAction ||
      isTransitioning ||
      isAnimating ||
      actionCardIndex !== null
    )
      return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleDragMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleDragEnd = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    const threshold = 100;
    let actionTriggered = false;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < -threshold) {
        handleAction("pass", true);
        actionTriggered = true;
      } else if (deltaX > threshold) {
        handleAction("smash", true);
        actionTriggered = true;
      }
    } else if (deltaY < -threshold) {
      handleAction("loved", true);
      actionTriggered = true;
    }

    setIsDragging(false);
    setDragStart(null);

    if (!actionTriggered) {
      setDragOffset({ x: 0, y: 0 });
    }

    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    if (!actionTriggered && Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) {
      const target = e.target as HTMLElement;
      const isButton = target.closest("button") !== null;
      if (!isButton) {
        navigate("/" + locale + "/dish/" + dishes[currentIndex]?.id);
      }
    }
  };

  const getActionCardStyle = (action: ActionType) => {
    let finalTransform = "";
    if (action === "pass") {
      finalTransform = "translateX(-200%) scale(0.8) rotate(-15deg)";
    } else if (action === "smash") {
      finalTransform = "translateX(200%) scale(0.8) rotate(15deg)";
    } else if (action === "loved") {
      finalTransform = "translateY(-200%) scale(0.9) rotate(0deg)";
    }

    return {
      transform: finalTransform,
      opacity: 0,
      filter: "blur(0px)",
      zIndex: 100,
      transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
      willChange: "transform, opacity",
    };
  };

  const getDragStyle = () => {
    const rotation = dragOffset.x * 0.1;
    const opacity = Math.max(
      0.5,
      1 - Math.abs(dragOffset.x) / 300 - Math.abs(dragOffset.y) / 300
    );
    return {
      transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg) scale(1)`,
      opacity,
      filter: "blur(0px)",
      zIndex: 100,
      transition: "none",
    };
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

    if (index === actionCardIndex && isAnimating && !lastAction) {
      const rotation = dragOffset.x * 0.1;
      return {
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg) scale(1)`,
        opacity: 1,
        filter: "blur(0px)",
        zIndex: 100,
        transition: "none",
      };
    }

    if (index === actionCardIndex && lastAction) {
      return getActionCardStyle(lastAction);
    }

    if (index === actionCardIndex && isTransitioning) {
      return {
        transform: `translateX(${baseTranslate}px) translateY(0) scale(0.8) rotate(0deg)`,
        opacity: 0,
        filter: "blur(5px)",
        zIndex: 0,
        transition:
          "transform 0.3s ease-in-out, opacity 0.3s ease-in-out, filter 0.3s ease-in-out",
        pointerEvents: "none",
      };
    }

    if (offset === 0 && isDragging) {
      return getDragStyle();
    }

    switch (absOffset) {
      case 0:
        return {
          transform: "translateX(0) translateY(0) scale(1) rotate(0deg)",
          opacity: 1,
          filter: "blur(0px)",
          zIndex: 10,
          transition:
            "transform 0.3s ease-out, opacity 0.3s ease-out, filter 0.3s ease-out",
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

  const getActionClassName = (action: ActionType) => {
    switch (action) {
      case "pass":
        return "drag-pass";
      case "smash":
        return "drag-smash";
      case "loved":
        return "drag-loved";
      default:
        return "";
    }
  };

  const dishesToRender = Array.from(
    { length: 7 },
    (_, i) => currentIndex - 3 + i
  );

  const getAddRecipeCard = (index: number) => {
    const cardKey = "add-recipe-" + index;
    const offset = index - currentIndex;
    const handlePointerDown =
      offset === 0 ? () => setIsModalOpen(true) : undefined;
    const clickableClass = offset === 0 ? "clickable" : "";

    return (
      <div
        key={cardKey}
        className={`dish-card add-recipe-card ${clickableClass}`}
        style={getCardStyle(index) as React.CSSProperties}
        onPointerDown={handlePointerDown}
      >
        <div className="add-recipe-card-info">
          <p className="add-recipe-card-text">{t("no_more_dishes")}</p>
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

    return dishesToRender.map((index) => {
      let actualIndex = index;
      if (index < 0) actualIndex = dishes.length + index;
      else if (index >= dishes.length) return getAddRecipeCard(index);

      if (actualIndex < 0 || actualIndex >= dishes.length) return null;

      const dish = dishes[actualIndex];
      const offset = index - currentIndex;
      const cardKey = dish.id + "-" + index;
      const frontCardClass = offset === 0 ? "front-card" : "";
      const classNames = "dish-card " + frontCardClass;
      const cardTitle = offset === 0 ? t("dish_details") : "";

      return (
        <div
          key={cardKey}
          className={classNames}
          title={cardTitle}
          style={getCardStyle(index) as React.CSSProperties}
          onPointerDown={(e) => {
            if (offset === 0) {
              handleDragStart(e, index);
            }
          }}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          onTransitionEnd={(e) => {
            if (e.propertyName !== "transform") return;

            e.stopPropagation();

            if (index === actionCardIndex && lastAction && !isTransitioning) {
              handleActionTransitionEnd(index)();
            } else if (
              index === actionCardIndex &&
              isTransitioning &&
              !lastAction
            ) {
              handleTransitionEnd(index)();
            }
          }}
        >
          <div className="dish-image">
            {!dish.mainImageId || dish.mainImageId <= 1 ? (
              <RestaurantMenu className="restaurant-menu-icon" />
            ) : (
              <img alt={dish.name} />
            )}
            {index === actionCardIndex && lastAction && (
              <div className="action-overlay">
                <span className={getActionClassName(lastAction)}>
                  {lastAction === "pass" && "PASS"}
                  {lastAction === "smash" && "SMASH"}
                  {lastAction === "loved" && "LOVED"}
                </span>
              </div>
            )}
            {offset === 0 &&
              isDragging &&
              (() => {
                const absX = Math.abs(dragOffset.x);
                const absY = Math.abs(dragOffset.y);

                if (absX > absY) {
                  if (dragOffset.x < -50)
                    return (
                      <div className="drag-overlay">
                        <span className="drag-hint drag-pass">PASS</span>
                      </div>
                    );
                  if (dragOffset.x > 50)
                    return (
                      <div className="drag-overlay">
                        <span className="drag-hint drag-smash">SMASH</span>
                      </div>
                    );
                } else if (dragOffset.y < -50) {
                  return (
                    <div className="drag-overlay">
                      <span className="drag-hint drag-loved">LOVED</span>
                    </div>
                  );
                }
                return null;
              })()}
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
                <span key={cat.id} className="category-tag">
                  {cat.name}
                </span>
              ))}
            </div>
            <div className="dish-actions">
              <button
                className="action-button btn-pass"
                title="Pass"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  handleAction("pass");
                }}
              >
                <ThumbDown className="action-button-icon" />
              </button>
              <button
                className="action-button btn-smash"
                title="Loved"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  handleAction("loved");
                }}
              >
                <Favorite className="action-button-icon" />
              </button>
              <button
                className="action-button btn-loved"
                title="Smash"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  handleAction("smash");
                }}
              >
                <ThumbUp className="action-button-icon" />
              </button>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <>
      {renderContent()}
      <CreateDishModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDishAdded={refetchDishes}
      />
    </>
  );
}
