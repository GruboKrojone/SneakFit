import { useState, useEffect, useCallback, useRef } from "react";
import DishesService, { Dish } from "../services/DishesService";

export const useFetchDishes = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const loadDishes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedDishes = await DishesService.getAllDishes();
      setDishes(loadedDishes);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Błąd przy ładowaniu dań";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadDishes();
  }, [loadDishes]);

  const addDish = (newDish: Dish) => {
    setDishes((prevDishes) => [...prevDishes, newDish]);
  };

  return {
    dishes,
    setDishes,
    isLoading,
    error,
    addDish,
    refetchDishes: loadDishes,
  };
};
