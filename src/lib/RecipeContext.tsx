import React, { createContext, useContext, useState, useEffect } from 'react';

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
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (id: string, recipe: Omit<Recipe, 'id'>) => void;
  deleteRecipe: (id: string) => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const DEFAULT_RECIPES: Recipe[] = [
  {
    id: 'default_sourdough',
    name: 'Basic Sourdough Boule',
    yieldAmount: '1 Loaf',
    ingredients: [
      { id: '1', amount: '450', unit: 'g', name: 'Bread Flour' },
      { id: '2', amount: '50', unit: 'g', name: 'Whole Wheat Flour' },
      { id: '3', amount: '350', unit: 'g', name: 'Water' },
      { id: '4', amount: '100', unit: 'g', name: 'Sourdough Starter (100%)' },
      { id: '5', amount: '10', unit: 'g', name: 'Kosher Salt (Diamond Crystal)' },
    ]
  },
  {
    id: 'default_cookies',
    name: 'Chocolate Chip Cookies',
    yieldAmount: '24 Cookies',
    ingredients: [
      { id: '1', amount: '2.25', unit: 'cup', name: 'All-Purpose Flour' },
      { id: '2', amount: '1', unit: 'tsp', name: 'Baking Soda' },
      { id: '3', amount: '1', unit: 'tsp', name: 'Salt (Table)' },
      { id: '4', amount: '1', unit: 'cup', name: 'Butter' },
      { id: '5', amount: '0.75', unit: 'cup', name: 'Granulated Sugar' },
      { id: '6', amount: '0.75', unit: 'cup', name: 'Brown Sugar (Packed)' },
      { id: '7', amount: '1', unit: 'tsp', name: 'Vanilla Extract' },
      { id: '8', amount: '2', unit: 'ea', name: 'Eggs (Large)' },
      { id: '9', amount: '2', unit: 'cup', name: 'Chocolate Chips' },
    ]
  },
  {
    id: 'default_pizza',
    name: 'Neapolitan Pizza Dough',
    yieldAmount: '3 Pizzas',
    ingredients: [
      { id: '1', amount: '500', unit: 'g', name: 'Bread Flour' },
      { id: '2', amount: '325', unit: 'g', name: 'Water' },
      { id: '3', amount: '10', unit: 'g', name: 'Salt (Table)' },
      { id: '4', amount: '3', unit: 'g', name: 'Instant Yeast' },
      { id: '5', amount: '10', unit: 'g', name: 'Olive Oil' },
    ]
  }
];

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('baking_recipes_v3');
    if (saved) {
      return JSON.parse(saved);
    }
    // Fallback to old key if exists, otherwise defaults
    const v2Saved = localStorage.getItem('baking_recipes_v2');
    if (v2Saved) {
      const parsed = JSON.parse(v2Saved);
      if (parsed.length > 0) {
        return parsed.map((r: Recipe) => 
          r.id === 'default_cookies' && r.name === 'Classic Chocolate Chip Cookies' 
            ? { ...r, name: 'Chocolate Chip Cookies' } 
            : r
        );
      }
    }
    const oldSaved = localStorage.getItem('baking_recipes');
    if (oldSaved) {
      const parsed = JSON.parse(oldSaved);
      if (parsed.length > 0) return parsed;
    }
    return DEFAULT_RECIPES;
  });

  useEffect(() => {
    localStorage.setItem('baking_recipes_v3', JSON.stringify(recipes));
  }, [recipes]);

  const addRecipe = (recipe: Omit<Recipe, 'id'>) => {
    setRecipes(prev => [...prev, { ...recipe, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const updateRecipe = (id: string, recipe: Omit<Recipe, 'id'>) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...recipe, id } : r));
  };

  const deleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  return (
    <RecipeContext.Provider value={{ recipes, addRecipe, updateRecipe, deleteRecipe }}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) throw new Error('useRecipes must be used within RecipeProvider');
  return context;
}
