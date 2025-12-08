import { useEffect, useState } from "react";
import DishesService, { Dish } from "../services/DishesService";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";
import "./styles/DishesPage.css";
import { useTranslation } from "react-i18next";
import AddBoxIcon from "@mui/icons-material/AddBox";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CreateDishModal from "../components/CreateDishModal";

export default function DishesPage() {
  const { t } = useTranslation();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchDishes() {
      setLoading(true);
      const data = await DishesService.getAllDishes();
      if (mounted) {
        setDishes(data);
        setLoading(false);
      }
    }

    fetchDishes();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="dishes-page">
      {loading ? (
        <p>{t("dishes_page_loading")}</p>
      ) : (
        <>
          <div className="page-title">{t("dishes_page_title")}</div>
          <div className="page-subtitle">
            <AutoAwesomeIcon id="auto-awesome-icon" />
            <AddBoxIcon
              id="add-box-icon"
              onClick={() => setIsModalOpen(true)}
              style={{ cursor: "pointer" }}
            />
            <FilterAltIcon id="filter-alt-icon" />
          </div>
          <div className="dishes-container">
            <div className="dishes-grid">
              {dishes.map((dish) => (
                <div className="dishes-box" key={dish.id}>
                  <div className="dishes-owner">{dish.ownerName ?? "-"}</div>
                  <div className="dishes-image-wrap">
                    {dish.mainImageId ? (
                      <img alt={dish.name} className="dishes-image" />
                    ) : (
                      <RestaurantMenu sx={{ fontSize: 50, color: "white" }} />
                    )}
                  </div>

                  <div className="dishes-body">
                    <div className="dishes-name">{dish.name}</div>
                    <div className="dishes-categories">
                      {dish.categories && dish.categories.length > 0
                        ? dish.categories.map((c) => c.name).join(", ")
                        : "Brak kategorii"}
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
      />
    </div>
  );
}
