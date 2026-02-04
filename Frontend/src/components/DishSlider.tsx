import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ThumbDown from "@mui/icons-material/ThumbDown";
import Favorite from "@mui/icons-material/Favorite";
import ThumbUp from "@mui/icons-material/ThumbUp";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import { ClipLoader } from "react-spinners";
import CreateDishModal from "./CreateDishModal";
import DishImage from "./DishImage";
import "./styles/DishSlider.css";
import { useTranslation } from "react-i18next";
import { useFetchDishes } from "../hooks/useFetchDishes";
import { useCleanTempLists } from "../hooks/useCleanTempLists";
import {
  addLikedRecipe,
  addNotLikedRecipe,
  addFavouriteRecipe,
  getAllRatedRecipeIds,
} from "../utils/recipeStorage";
import DishesService from "../services/DishesService";

type ActionType = "pass" | "loved" | "smash" | null;

export default function DishSlider() {
  const { t } = useTranslation();
  const { locale } = useParams<{ locale: string }>();
  const { dishes, isLoading, refetchDishes } = useFetchDishes();
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [passedCards, setPassedCards] = useState<number[]>([]);
  const [newlyPassedCard, setNewlyPassedCard] = useState<number | null>(null);
  const [enteringCard, setEnteringCard] = useState<number | null>(null);
  const [shouldStartEntering, setShouldStartEntering] = useState(false);
  const [showAddRecipeCard, setShowAddRecipeCard] = useState(false);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [animationType, setAnimationType] = useState<ActionType>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement>(null);

  useCleanTempLists();

  const ratedRecipeIds = getAllRatedRecipeIds();
  const visibleCards = dishes
    .map((dish, index) => ({ dish, originalIndex: index }))
    .filter(({ originalIndex, dish }) => 
      !usedIndices.has(originalIndex) && !ratedRecipeIds.includes(dish.id)
    );

  useEffect(() => {
    if (visibleCards.length === 0 && !showAddRecipeCard) {
      setShowAddRecipeCard(true);
    }
  }, [visibleCards.length, showAddRecipeCard]);

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (shouldStartEntering && enteringCard !== null) {
      requestAnimationFrame(() => {
        setEnteringCard(null);
        setNewlyPassedCard(enteringCard);
        setShouldStartEntering(false);
      });
    }
  }, [shouldStartEntering, enteringCard]);

  useEffect(() => {
    if (newlyPassedCard !== null && !isAnimating) {
      const timer = requestAnimationFrame(() => {
        setTimeout(() => setNewlyPassedCard(null), 300);
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [newlyPassedCard, isAnimating]);

  const handleTransitionEnd = () => {
    if (isAnimating && animatingIndex !== null) {
      const currentDish = dishes[animatingIndex];
      
      if (currentDish) {
        switch (animationType) {
          case "pass":
            addNotLikedRecipe(currentDish.id);
            break;
          case "smash":
            addLikedRecipe(currentDish.id);
            break;
          case "loved":
            addFavouriteRecipe(currentDish.id);
            DishesService.addDishToFavorites(currentDish.id);
            break;
        }
      }
      
      setUsedIndices((prev) => new Set(prev).add(animatingIndex));
      if (animationType === "pass") {
        setPassedCards((prev) => [...prev, animatingIndex]);
        setEnteringCard(animatingIndex);
        setShouldStartEntering(true);
      }
      setAnimatingIndex(null);
      setAnimationType(null);
      setIsAnimating(false);
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleAction = (
    action: Exclude<ActionType, null>,
    fromDrag: boolean = false,
  ) => {
    if (isAnimating || visibleCards.length === 0) return;

    const cardIndex = visibleCards[0].originalIndex;
    setAnimatingIndex(cardIndex);
    setAnimationType(action);
    if (!fromDrag) {
      setDragOffset({ x: 0, y: 0 });
    }
    setIsAnimating(true);
  };

  const handleDragStart = (e: React.PointerEvent, cardIndex: number) => {
    if (
      isAnimating ||
      visibleCards.length === 0 ||
      visibleCards[0].originalIndex !== cardIndex
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
      if (!isButton && visibleCards.length > 0) {
        navigate("/" + locale + "/dish/" + visibleCards[0].dish.id);
      }
    }
  };

  const getMainCardExitStyle = (action: ActionType) => {
    if (action === "loved") {
      return {
        transform: "translateY(-200vh) scale(0.9) rotate(0deg)",
        opacity: 0,
        zIndex: 100,
        transition:
          "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out",
      };
    } else if (action === "smash") {
      return {
        transform: "translateX(200%) scale(0.8) rotate(25deg)",
        opacity: 0,
        zIndex: 100,
        transition:
          "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out",
      };
    } else {
      return {
        transform: "translateX(-200%) scale(0.8) rotate(-25deg)",
        opacity: 0,
        zIndex: 100,
        transition:
          "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out",
      };
    }
  };

  const getCardDimensions = () => {
    const containerWidth = sliderRef.current?.offsetWidth || dimensions.width;
    const isMobile = dimensions.width <= 768;
    const cardWidth = isMobile
      ? containerWidth * 0.95
      : Math.min(containerWidth * 0.9, 400);
    const maxSafeTranslate = (containerWidth - cardWidth) / 2;
    const baseTranslate = Math.min(isMobile ? 20 : 80, maxSafeTranslate / 3);
    return { baseTranslate };
  };

  const getCardStyle = (stackPosition: number, originalIndex: number) => {
    if (originalIndex === animatingIndex && isAnimating && animationType) {
      if (stackPosition === 0) {
        return getMainCardExitStyle(animationType);
      }
    }

    if (stackPosition === 0 && isDragging) {
      const rotation = dragOffset.x * 0.1;
      const opacity = Math.max(
        0.5,
        1 - Math.abs(dragOffset.x) / 300 - Math.abs(dragOffset.y) / 300,
      );
      return {
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg) scale(1)`,
        opacity,
        filter: "blur(0px)",
        zIndex: 100,
        transition: "none",
      };
    }

    const { baseTranslate } = getCardDimensions();

    switch (stackPosition) {
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
          transform: `translateX(${baseTranslate}px) scale(0.95)`,
          opacity: 0.7,
          filter: "blur(2px)",
          zIndex: 5,
          transition:
            "transform 0.3s ease-out, opacity 0.3s ease-out, filter 0.3s ease-out",
        };
      case 2:
        return {
          transform: `translateX(${baseTranslate * 2}px) scale(0.9)`,
          opacity: 0.4,
          filter: "blur(4px)",
          zIndex: 2,
          transition:
            "transform 0.3s ease-out, opacity 0.3s ease-out, filter 0.3s ease-out",
        };
      default:
        return {
          transform: `translateX(${baseTranslate * 3}px) scale(0.85)`,
          opacity: 0,
          filter: "blur(6px)",
          zIndex: 1,
          transition:
            "transform 0.3s ease-out, opacity 0.3s ease-out, filter 0.3s ease-out",
        };
    }
  };

  const getLeftCardStyle = (stackPosition: number, originalIndex?: number) => {
    const { baseTranslate } = getCardDimensions();

    if (originalIndex === enteringCard) {
      return {
        transform: "translateX(0) scale(1)",
        opacity: 0,
        filter: "blur(0px)",
        zIndex: 4,
        transition: "none",
      };
    }

    switch (stackPosition) {
      case 0:
        return {
          transform: `translateX(-${baseTranslate}px) scale(0.95)`,
          opacity: 0.7,
          filter: "blur(2px)",
          zIndex: 5,
          transition:
            "transform 0.3s ease-out, opacity 0.3s ease-out, filter 0.3s ease-out",
        };
      case 1:
        return {
          transform: `translateX(-${baseTranslate * 2}px) scale(0.9)`,
          opacity: 0.4,
          filter: "blur(4px)",
          zIndex: 2,
          transition:
            "transform 0.3s ease-out, opacity 0.3s ease-out, filter 0.3s ease-out",
        };
      default:
        return {
          transform: `translateX(-${baseTranslate * 3}px) scale(0.85)`,
          opacity: 0,
          filter: "blur(6px)",
          zIndex: 1,
          transition:
            "transform 0.3s ease-out, opacity 0.3s ease-out, filter 0.3s ease-out",
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

  const renderActionButtons = (disabled: boolean = false) => (
    <div className="dish-actions">
      <button
        className="action-button btn-pass"
        title={t("action_pass")}
        disabled={disabled}
        {...(!disabled && {
          onPointerDown: (e: React.PointerEvent) => {
            e.stopPropagation();
            handleAction("pass");
          },
        })}
      >
        <ThumbDown className="action-button-icon" />
      </button>
      <button
        className="action-button btn-smash"
        title={t("action_loved")}
        disabled={disabled}
        {...(!disabled && {
          onPointerDown: (e: React.PointerEvent) => {
            e.stopPropagation();
            handleAction("loved");
          },
        })}
      >
        <Favorite className="action-button-icon" />
      </button>
      <button
        className="action-button btn-loved"
        title={t("action_smash")}
        disabled={disabled}
        {...(!disabled && {
          onPointerDown: (e: React.PointerEvent) => {
            e.stopPropagation();
            handleAction("smash");
          },
        })}
      >
        <ThumbUp className="action-button-icon" />
      </button>
    </div>
  );

  const renderDishImage = (dish: { id: number; name: string }) => (
    <div className="dish-image">
      <DishImage 
        dishId={dish.id} 
        alt={dish.name} 
        placeholderClassName="restaurant-menu-icon"
      />
    </div>
  );

  const renderActionOverlay = (type: ActionType) => {
    if (!type) return null;
    return (
      <div className="action-overlay">
        <span className={getActionClassName(type)}>
          {type === "pass" && t("action_pass_label")}
          {type === "smash" && t("action_smash_label")}
          {type === "loved" && t("action_loved_label")}
        </span>
      </div>
    );
  };

  const renderDragOverlay = () => {
    if (!isDragging) return null;

    const absX = Math.abs(dragOffset.x);
    const absY = Math.abs(dragOffset.y);

    if (absX > absY) {
      if (dragOffset.x < -50) {
        return (
          <div className="drag-overlay">
            <span className="drag-hint drag-pass">{t("action_pass_label")}</span>
          </div>
        );
      }
      if (dragOffset.x > 50) {
        return (
          <div className="drag-overlay">
            <span className="drag-hint drag-smash">{t("action_smash_label")}</span>
          </div>
        );
      }
    } else if (dragOffset.y < -50) {
      return (
        <div className="drag-overlay">
          <span className="drag-hint drag-loved">{t("action_loved_label")}</span>
        </div>
      );
    }
    return null;
  };

  const getAddRecipeCard = (stackPosition: number) => {
    const cardKey = "add-recipe-card";
    const handlePointerDown =
      stackPosition === 0 ? () => setIsModalOpen(true) : undefined;
    const clickableClass = stackPosition === 0 ? "clickable" : "";

    return (
      <div
        key={cardKey}
        className={`dish-card add-recipe-card ${clickableClass}`}
        style={getCardStyle(stackPosition, -1) as React.CSSProperties}
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

    const maxPassedCards = 3;
    const recentPassedCards = passedCards.slice(-maxPassedCards).reverse();

    const leftCards = [];

    recentPassedCards.forEach((originalIndex, i) => {
      const dish = dishes[originalIndex];
      if (!dish) return;

      const cardKey = "passed-" + dish.id + "-" + originalIndex;
      const stackPosition = i;

      leftCards.push(
        <div
          key={cardKey}
          className="dish-card passed-card"
          style={
            getLeftCardStyle(
              stackPosition,
              originalIndex,
            ) as React.CSSProperties
          }
        >
          {renderDishImage(dish)}
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
            {renderActionButtons(true)}
          </div>
        </div>,
      );
    });

    const emptyCardsCount = maxPassedCards - recentPassedCards.length;
    for (let i = 0; i < emptyCardsCount; i++) {
      const stackPosition = recentPassedCards.length + i;
      const cardKey = "empty-left-" + i;

      leftCards.push(
        <div
          key={cardKey}
          className="dish-card empty-placeholder-card"
          style={getLeftCardStyle(stackPosition) as React.CSSProperties}
        >
          <div className="dish-image"></div>
          <div className="dish-info">
            <div className="dish-header"></div>
            <p className="dish-description"></p>
            <div className="dish-categories"></div>
            {renderActionButtons(true)}
          </div>
        </div>,
      );
    }

    const maxVisibleCards = 4;
    const dishCards = visibleCards
      .slice(0, maxVisibleCards)
      .map(({ dish, originalIndex }, stackPosition) => {
        const cardKey = dish.id + "-" + originalIndex;
        const isTopCard = stackPosition === 0;
        const frontCardClass = isTopCard ? "front-card" : "";
        const classNames = "dish-card " + frontCardClass;
        const cardTitle = isTopCard ? t("dish_details") : "";

        return (
          <div
            key={cardKey}
            className={classNames}
            title={cardTitle}
            style={
              getCardStyle(stackPosition, originalIndex) as React.CSSProperties
            }
            onPointerDown={(e) => {
              if (isTopCard) {
                handleDragStart(e, originalIndex);
              }
            }}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            onTransitionEnd={(e) => {
              if (e.propertyName !== "transform") return;
              e.stopPropagation();

              if (originalIndex === animatingIndex && isAnimating) {
                handleTransitionEnd();
              }
            }}
          >
            {renderDishImage(dish)}
            {originalIndex === animatingIndex &&
              animationType &&
              renderActionOverlay(animationType)}
            {isTopCard && renderDragOverlay()}
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
              {renderActionButtons(false)}
            </div>
          </div>
        );
      });

    const emptyRightCardsCount = Math.max(0, 4 - visibleCards.length);
    for (let i = 0; i < emptyRightCardsCount; i++) {
      const stackPosition = visibleCards.length + i;
      const cardKey = "empty-right-" + i;

      dishCards.push(
        <div
          key={cardKey}
          className="dish-card empty-placeholder-card"
          style={getCardStyle(stackPosition, -2 - i) as React.CSSProperties}
        >
          <div className="dish-image"></div>
          <div className="dish-info">
            <div className="dish-header"></div>
            <p className="dish-description"></p>
            <div className="dish-categories"></div>
            <div className="dish-actions">
              <button className="action-button btn-pass" disabled>
                <ThumbDown className="action-button-icon" />
              </button>
              <button className="action-button btn-smash" disabled>
                <Favorite className="action-button-icon" />
              </button>
              <button className="action-button btn-loved" disabled>
                <ThumbUp className="action-button-icon" />
              </button>
            </div>
          </div>
        </div>,
      );
    }

    if (visibleCards.length === 0) {
      const addRecipeCard = getAddRecipeCard(0);
      const cardWithAnimation = {
        ...addRecipeCard,
        props: {
          ...addRecipeCard.props,
          className: `${addRecipeCard.props.className} ${showAddRecipeCard ? "fade-in-card" : ""}`,
        },
      };
      return [cardWithAnimation];
    }

    const allCards = [...leftCards, ...dishCards];

    return allCards;
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
