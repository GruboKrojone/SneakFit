import { useEffect, useState, useRef, useMemo } from "react";
import DishesService, { Dish } from "../services/DishesService";
import DishImage from "../components/DishImage";
import "./styles/DishesPage.css";
import { useTranslation } from "react-i18next";
import AddBoxIcon from "@mui/icons-material/AddBox";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate, useParams } from "react-router-dom";
import CreateDishModal from "../components/CreateDishModal";
import FiltersModal from "../components/FiltersModal";

export default function DishesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { locale } = useParams<{ locale: string }>();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterCategories, setFilterCategories] = useState<number[]>([]);
  const hasFetched = useRef(false);
  const emptyCategories = t("no_categories");

  const filteredDishes = useMemo(() => {
    if (filterCategories.length === 0) return dishes;
    return dishes.filter((dish) =>
      dish.categories && dish.categories.some((cat) => filterCategories.includes(cat.id))
    );
  }, [dishes, filterCategories]);

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

  return (
    <div className="dishes-page">
      {loading ? (
        <>
          <div className="page-title">{t("dishes_page_title")}</div>
          <div className="page-subtitle">
            <AutoAwesomeIcon id="auto-awesome-icon" />
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
            <AutoAwesomeIcon id="auto-awesome-icon" />
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
      />
    </div>
  );
}
