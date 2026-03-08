import { useEffect, useState, useRef, useMemo } from "react";
import DishesService, { Dish } from "../services/DishesService";
import AuthService from "../services/AuthService";
import DishImage from "../components/DishImage";
import "./styles/DishesPage.css";
import { useTranslation } from "react-i18next";
import AddBoxIcon from "@mui/icons-material/AddBox";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate, useParams } from "react-router-dom";
import CreateDishModal from "../components/CreateDishModal";
import FiltersModal from "../components/FiltersModal";
import AiRecipeModal from "../components/AiRecipeModal";
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import StarHalf from "@mui/icons-material/StarHalf";

export default function DishesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { locale } = useParams<{ locale: string }>();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [filterCategories, setFilterCategories] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<string>("none");
  const [minRating, setMinRating] = useState(0);
  const hasFetched = useRef(false);
  const emptyCategories = t("no_categories");
  
  const currentUser = AuthService.getCurrentUser();
  const currentUserId = currentUser?.id;

  const filteredDishes = useMemo(() => {
    let result = dishes;

    if (currentUserId) {
      result = result.filter(dish => dish.isPublic || dish.ownerId === currentUserId);
    } else {
      result = result.filter(dish => dish.isPublic);
    }

    if (filterCategories.length > 0) {
      result = result.filter((dish) =>
        dish.categories?.some((cat) => filterCategories.includes(cat.id))
      );
    }

    if (minRating > 0) {
      result = result.filter((dish) => (dish.rates || 0) >= minRating);
    }

    if (sortBy === "rating_desc") {
      result = [...result].sort((a, b) => (b.rates || 0) - (a.rates || 0));
    } else if (sortBy === "rating_asc") {
      result = [...result].sort((a, b) => (a.rates || 0) - (b.rates || 0));
    }

    return result;
  }, [dishes, filterCategories, sortBy, minRating]);

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const data = await DishesService.getAllDishes();
      setDishes(data);
    } catch (error) {
      console.error("Failed to fetch dishes:", error);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchDishes();
  }, []);

  const renderRating = (rating: number = 0) => {
    return (
      <div className="dish-rating">
        {[1, 2, 3, 4, 5].map((starValue) => {
          if (rating >= starValue) {
            return <Star key={starValue} className="star-icon filled" />;
          } else if (rating >= starValue - 0.5) {
            return <StarHalf key={starValue} className="star-icon half" />;
          } else {
            return <StarBorder key={starValue} className="star-icon empty" />;
          }
        })}
      </div>
    );
  };

  return (
    <div className="dishes-page">
      {loading ? (
        <>
          <div className="page-title">{t("dishes_page_title")}</div>
          <div className="page-subtitle">
            <AutoAwesomeIcon 
              id="auto-awesome-icon" 
              onClick={() => setIsAiModalOpen(true)}
            />
            <AddBoxIcon
              id="add-box-icon"
              onClick={() => setIsModalOpen(true)}
            />
            <FilterAltIcon id="filter-alt-icon" />
          </div>
          <div className="dishes-container">
            <div className="dishes-loading">
              {t("loading")}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="page-title">{t("dishes_page_title")}</div>
          <div className="page-subtitle">
            <AutoAwesomeIcon 
              id="auto-awesome-icon" 
              onClick={() => setIsAiModalOpen(true)}
            />
            <AddBoxIcon
              id="add-box-icon"
              onClick={() => setIsModalOpen(true)}
            />
            <FilterAltIcon 
              id="filter-alt-icon" 
              onClick={() => setIsFiltersOpen(true)}
            />
          </div>
          <div className="dishes-container">
            {filteredDishes.length > 0 ? (
              <div className="dishes-grid">
                {filteredDishes.map((dish) => (
                  <div
                    className="dishes-box"
                    key={dish.id}
                    onPointerUp={() => navigate(`/${locale}/dish/${dish.id}`)}
                  >
                    <div className="dishes-owner">{dish.ownerName ?? "-"}</div>
                    <div className="dishes-image-wrap">
                      <DishImage 
                        dishId={dish.id} 
                        alt={dish.name} 
                        className="dishes-image" 
                        placeholderClassName="dishes-restaurant-icon"
                      />
                    </div>
                    <div className="dishes-body">
                      <div className="dishes-name">{dish.name}</div>
                      {renderRating(dish.rates)}
                      <div className="dishes-categories">
                        {dish.categories && dish.categories.length > 0
                          ? dish.categories.map((c) => {
                              let localizedName = c.nameEn;
                              if (i18n.language === "pl") localizedName = c.namePl || c.nameEn;
                              else if (i18n.language === "de") localizedName = c.nameDe || c.nameEn;
                              else if (i18n.language === "es") localizedName = c.nameEs || c.nameEn;
                              
                              return (
                                <span 
                                  key={c.id} 
                                  className="dishes-category-tag"
                                  style={{ 
                                    borderColor: c.color,
                                    color: c.color,
                                    background: `${c.color}15`
                                  }}
                                >
                                  {localizedName}
                                </span>
                              );
                            })
                          : emptyCategories}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results-text">
                {t("no_matching_results")}
              </div>
            )}
          </div>
        </>
      )}
      <CreateDishModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDishAdded={fetchDishes}
      />
      <FiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        selectedCategories={filterCategories}
        onApplyFilters={setFilterCategories}
        onClearFilters={() => setFilterCategories([])}
        selectedSort={sortBy}
        onApplySort={setSortBy}
        minRating={minRating}
        onApplyMinRating={setMinRating}
      />
      <AiRecipeModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
}
