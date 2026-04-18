import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { createId } from "@/src/lib/utils";

export interface RecipeIngredient {
  id: string;
  amount: string;
  unit: string;
  name: string;
}

export interface Recipe {
  id: string;
  name: string;
  yieldAmount: string;
  ingredients: RecipeIngredient[];
}

interface RecipeContextType {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, "id">) => void;
  updateRecipe: (id: string, recipe: Omit<Recipe, "id">) => void;
  deleteRecipe: (id: string) => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const DEFAULT_RECIPES: Recipe[] = [
  {
    id: "default_sourdough",
    name: "Basic Sourdough Boule",
    yieldAmount: "1 loaf",
    ingredients: [
      { id: "1", amount: "450", unit: "g", name: "Bread Flour" },
      { id: "2", amount: "50", unit: "g", name: "Whole Wheat Flour" },
      { id: "3", amount: "350", unit: "g", name: "Water" },
      { id: "4", amount: "100", unit: "g", name: "Sourdough Starter (100%)" },
      { id: "5", amount: "10", unit: "g", name: "Kosher Salt (Diamond Crystal)" },
    ],
  },
  {
    id: "default_cookies",
    name: "Chocolate Chip Cookies",
    yieldAmount: "24 cookies",
    ingredients: [
      { id: "1", amount: "2.25", unit: "cup", name: "All-Purpose Flour" },
      { id: "2", amount: "1", unit: "tsp", name: "Baking Soda" },
      { id: "3", amount: "1", unit: "tsp", name: "Salt (Table)" },
      { id: "4", amount: "1", unit: "cup", name: "Butter" },
      { id: "5", amount: "0.75", unit: "cup", name: "Granulated Sugar" },
      { id: "6", amount: "0.75", unit: "cup", name: "Brown Sugar (Packed)" },
      { id: "7", amount: "1", unit: "tsp", name: "Vanilla Extract" },
      { id: "8", amount: "2", unit: "ea", name: "Eggs (Large)" },
      { id: "9", amount: "2", unit: "cup", name: "Chocolate Chips" },
    ],
  },
  {
    id: "default_pizza",
    name: "Neapolitan Pizza Dough",
    yieldAmount: "3 pizzas",
    ingredients: [
      { id: "1", amount: "500", unit: "g", name: "Bread Flour" },
      { id: "2", amount: "325", unit: "g", name: "Water" },
      { id: "3", amount: "10", unit: "g", name: "Salt (Table)" },
      { id: "4", amount: "3", unit: "g", name: "Instant Yeast" },
      { id: "5", amount: "10", unit: "g", name: "Olive Oil" },
    ],
  },
];

function loadRecipes(): Recipe[] {
  const current = localStorage.getItem("baking_recipes_v3");
  if (current) {
    return JSON.parse(current) as Recipe[];
  }

  const legacy = localStorage.getItem("baking_recipes_v2");
  if (legacy) {
    const parsed = JSON.parse(legacy) as Recipe[];
    if (parsed.length > 0) {
      return parsed.map((recipe) =>
        recipe.id === "default_cookies" && recipe.name === "Classic Chocolate Chip Cookies"
          ? { ...recipe, name: "Chocolate Chip Cookies" }
          : recipe
      );
    }
  }

  const oldest = localStorage.getItem("baking_recipes");
  if (oldest) {
    const parsed = JSON.parse(oldest) as Recipe[];
    if (parsed.length > 0) return parsed;
  }

  return DEFAULT_RECIPES;
}

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(loadRecipes);

  useEffect(() => {
    localStorage.setItem("baking_recipes_v3", JSON.stringify(recipes));
  }, [recipes]);

  const value = useMemo<RecipeContextType>(
    () => ({
      recipes,
      addRecipe: (recipe) => {
        setRecipes((current) => [...current, { ...recipe, id: createId("recipe") }]);
      },
      updateRecipe: (id, recipe) => {
        setRecipes((current) => current.map((item) => (item.id === id ? { ...recipe, id } : item)));
      },
      deleteRecipe: (id) => {
        setRecipes((current) => current.filter((item) => item.id !== id));
      },
    }),
    [recipes]
  );

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipes must be used within RecipeProvider");
  }
  return context;
}
