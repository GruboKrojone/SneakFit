export interface RecipeEntry {
  id: number;
  timestamp: number;
}

const LIKED_RECIPES_KEY = 'likedRecipes';
const NOT_LIKED_RECIPES_KEY = 'notLikedRecipes';
const FAVOURITE_RECIPES_KEY = 'favouriteRecipes';
const EXPIRY_DURATION = 24 * 60 * 60 * 1000;

const getRecipesFromStorage = (key: string): RecipeEntry[] => {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as RecipeEntry[];
    }
    return [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return [];
  }
};

const saveRecipesToStorage = (key: string, recipes: RecipeEntry[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(recipes));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

const removeExpiredEntries = (recipes: RecipeEntry[]): RecipeEntry[] => {
  const now = Date.now();
  return recipes.filter(entry => {
    const age = now - entry.timestamp;
    return age < EXPIRY_DURATION;
  });
};

export const cleanupExpiredRecipes = (): void => {
  const likedRecipes = getRecipesFromStorage(LIKED_RECIPES_KEY);
  const cleanedLiked = removeExpiredEntries(likedRecipes);
  if (cleanedLiked.length < likedRecipes.length) {
    saveRecipesToStorage(LIKED_RECIPES_KEY, cleanedLiked);
  }

  const notLikedRecipes = getRecipesFromStorage(NOT_LIKED_RECIPES_KEY);
  const cleanedNotLiked = removeExpiredEntries(notLikedRecipes);
  if (cleanedNotLiked.length < notLikedRecipes.length) {
    saveRecipesToStorage(NOT_LIKED_RECIPES_KEY, cleanedNotLiked);
  }

  const favouriteRecipes = getRecipesFromStorage(FAVOURITE_RECIPES_KEY);
  const cleanedFavourites = removeExpiredEntries(favouriteRecipes);
  if (cleanedFavourites.length < favouriteRecipes.length) {
    saveRecipesToStorage(FAVOURITE_RECIPES_KEY, cleanedFavourites);
  }
};

export const addLikedRecipe = (recipeId: number): void => {
  const recipes = getRecipesFromStorage(LIKED_RECIPES_KEY);
  
  const existingIndex = recipes.findIndex(entry => entry.id === recipeId);
  
  if (existingIndex >= 0) {
    recipes[existingIndex].timestamp = Date.now();
  } else {
    recipes.push({
      id: recipeId,
      timestamp: Date.now()
    });
  }
  
  saveRecipesToStorage(LIKED_RECIPES_KEY, recipes);
};

export const addNotLikedRecipe = (recipeId: number): void => {
  const recipes = getRecipesFromStorage(NOT_LIKED_RECIPES_KEY);
  
  const existingIndex = recipes.findIndex(entry => entry.id === recipeId);
  
  if (existingIndex >= 0) {
    recipes[existingIndex].timestamp = Date.now();
  } else {
    recipes.push({
      id: recipeId,
      timestamp: Date.now()
    });
  }
  
  saveRecipesToStorage(NOT_LIKED_RECIPES_KEY, recipes);
};

export const addFavouriteRecipe = (recipeId: number): void => {
  const recipes = getRecipesFromStorage(FAVOURITE_RECIPES_KEY);
  
  const existingIndex = recipes.findIndex(entry => entry.id === recipeId);
  
  if (existingIndex >= 0) {
    recipes[existingIndex].timestamp = Date.now();
  } else {
    recipes.push({
      id: recipeId,
      timestamp: Date.now()
    });
  }
  
  saveRecipesToStorage(FAVOURITE_RECIPES_KEY, recipes);
};

export const removeFavouriteRecipe = (recipeId: number): void => {
  const recipes = getRecipesFromStorage(FAVOURITE_RECIPES_KEY);
  const filteredRecipes = recipes.filter(entry => entry.id !== recipeId);
  saveRecipesToStorage(FAVOURITE_RECIPES_KEY, filteredRecipes);
};

export const getAllRatedRecipeIds = (): number[] => {
  const likedRecipes = getRecipesFromStorage(LIKED_RECIPES_KEY);
  const notLikedRecipes = getRecipesFromStorage(NOT_LIKED_RECIPES_KEY);
  const favouriteRecipes = getRecipesFromStorage(FAVOURITE_RECIPES_KEY);
  
  const validLiked = removeExpiredEntries(likedRecipes);
  const validNotLiked = removeExpiredEntries(notLikedRecipes);
  const validFavourites = removeExpiredEntries(favouriteRecipes);
  
  const allIds = [
    ...validLiked.map(entry => entry.id),
    ...validNotLiked.map(entry => entry.id),
    ...validFavourites.map(entry => entry.id)
  ];
  
  return [...new Set(allIds)];
};

export const isRecipeRated = (recipeId: number): boolean => {
  const ratedIds = getAllRatedRecipeIds();
  return ratedIds.includes(recipeId);
};

export const getLikedRecipeIds = (): number[] => {
  const recipes = getRecipesFromStorage(LIKED_RECIPES_KEY);
  const validRecipes = removeExpiredEntries(recipes);
  return validRecipes.map(entry => entry.id);
};

export const getNotLikedRecipeIds = (): number[] => {
  const recipes = getRecipesFromStorage(NOT_LIKED_RECIPES_KEY);
  const validRecipes = removeExpiredEntries(recipes);
  return validRecipes.map(entry => entry.id);
};

export const getFavouriteRecipeIds = (): number[] => {
  const recipes = getRecipesFromStorage(FAVOURITE_RECIPES_KEY);
  const validRecipes = removeExpiredEntries(recipes);
  return validRecipes.map(entry => entry.id);
};

export const clearAllRecipeData = (): void => {
  localStorage.removeItem(LIKED_RECIPES_KEY);
  localStorage.removeItem(NOT_LIKED_RECIPES_KEY);
  localStorage.removeItem(FAVOURITE_RECIPES_KEY);
};

