import { useState, useEffect, useCallback, useRef } from "react";
import DishesService, { Dish } from "../services/DishesService";

export const useRecommendedDishes = (maxResults = 20) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const loadDishes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loaded = await DishesService.getRecommendedDishes(maxResults);
      setDishes(loaded);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error loading dishes";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [maxResults]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadDishes();
  }, [loadDishes]);

  return {
    dishes,
    setDishes,
    isLoading,
    error,
    refetchDishes: loadDishes,
  };
};
