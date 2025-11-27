import { useEffect, useState } from "react";
import DishesService, { Dish } from "../services/DishesService";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";
import "./styles/DishesPage.css";

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

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
        <p>Ładowanie przepisów...</p>
      ) : (
        <div className="dishes-container">
          <h1 className="dishes-title">Przepisy użytkowników</h1>
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
      )}
    </div>
  );
}
