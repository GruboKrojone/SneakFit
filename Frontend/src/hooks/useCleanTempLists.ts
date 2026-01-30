import { useEffect, useCallback } from 'react';
import { cleanupExpiredRecipes, clearAllRecipeData } from '../utils/recipeStorage';

export const useCleanTempLists = () => {
  useEffect(() => {
    cleanupExpiredRecipes();
  }, []);

  const clearAllChoices = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      try {
        clearAllRecipeData();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  return {
    clearAllChoices,
  };
};
