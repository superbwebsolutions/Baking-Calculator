export interface IngredientData {
  id: string;
  name: string;
  density: number;
  category: string;
  weightPerPiece?: number;
}

export const INGREDIENTS: IngredientData[] = [
  // Flours & Starches
  { id: 'ap_flour', name: 'All-Purpose Flour', density: 120, category: 'Flours & Starches' },
  { id: 'bread_flour', name: 'Bread Flour', density: 120, category: 'Flours & Starches' },
  { id: 'ww_flour', name: 'Whole Wheat Flour', density: 113, category: 'Flours & Starches' },
  { id: 'white_ww_flour', name: 'White Whole Wheat Flour', density: 113, category: 'Flours & Starches' },
  { id: 'cake_flour', name: 'Cake Flour', density: 120, category: 'Flours & Starches' },
  { id: 'pastry_flour', name: 'Pastry Flour', density: 106, category: 'Flours & Starches' },
  { id: 'rye_flour', name: 'Rye Flour (Medium)', density: 106, category: 'Flours & Starches' },
  { id: 'almond_flour', name: 'Almond Flour', density: 96, category: 'Flours & Starches' },
  { id: 'cornmeal', name: 'Cornmeal (Yellow)', density: 156, category: 'Flours & Starches' },
  { id: 'cornstarch', name: 'Cornstarch', density: 112, category: 'Flours & Starches' },
  { id: 'cocoa', name: 'Cocoa Powder (Unsweetened)', density: 84, category: 'Flours & Starches' },
  
  // Sugars & Sweeteners
  { id: 'sugar', name: 'Granulated Sugar', density: 198, category: 'Sugars & Sweeteners' },
  { id: 'brown_sugar', name: 'Brown Sugar (Packed)', density: 213, category: 'Sugars & Sweeteners' },
  { id: 'powdered_sugar', name: 'Powdered Sugar (Unsifted)', density: 113, category: 'Sugars & Sweeteners' },
  { id: 'honey', name: 'Honey', density: 340, category: 'Sugars & Sweeteners' },
  { id: 'maple_syrup', name: 'Maple Syrup', density: 312, category: 'Sugars & Sweeteners' },
  { id: 'molasses', name: 'Molasses', density: 340, category: 'Sugars & Sweeteners' },
  { id: 'corn_syrup', name: 'Corn Syrup', density: 312, category: 'Sugars & Sweeteners' },

  // Fats & Dairy
  { id: 'butter', name: 'Butter', density: 226, category: 'Fats & Dairy' },
  { id: 'shortening', name: 'Vegetable Shortening', density: 184, category: 'Fats & Dairy' },
  { id: 'oil', name: 'Vegetable/Canola Oil', density: 198, category: 'Fats & Dairy' },
  { id: 'olive_oil', name: 'Olive Oil', density: 198, category: 'Fats & Dairy' },
  { id: 'milk', name: 'Milk (Whole)', density: 227, category: 'Fats & Dairy' },
  { id: 'heavy_cream', name: 'Heavy Cream', density: 227, category: 'Fats & Dairy' },
  { id: 'buttermilk', name: 'Buttermilk', density: 227, category: 'Fats & Dairy' },
  { id: 'sour_cream', name: 'Sour Cream', density: 227, category: 'Fats & Dairy' },
  { id: 'yogurt', name: 'Yogurt (Plain)', density: 227, category: 'Fats & Dairy' },

  // Liquids
  { id: 'water', name: 'Water', density: 227, category: 'Liquids' },
  { id: 'vanilla', name: 'Vanilla Extract', density: 227, category: 'Liquids' },
  
  // Leaveners & Salts
  { id: 'salt', name: 'Salt (Table)', density: 273, category: 'Leaveners & Salts' },
  { id: 'salt_kosher_diamond', name: 'Kosher Salt (Diamond Crystal)', density: 135, category: 'Leaveners & Salts' },
  { id: 'salt_kosher_morton', name: 'Kosher Salt (Morton)', density: 250, category: 'Leaveners & Salts' },
  { id: 'baking_soda', name: 'Baking Soda', density: 288, category: 'Leaveners & Salts' },
  { id: 'baking_powder', name: 'Baking Powder', density: 192, category: 'Leaveners & Salts' },
  { id: 'yeast_ady', name: 'Active Dry Yeast', density: 144, category: 'Leaveners & Salts' },
  { id: 'yeast_instant', name: 'Instant Yeast', density: 144, category: 'Leaveners & Salts' },
  { id: 'sourdough_starter', name: 'Sourdough Starter (100%)', density: 227, category: 'Leaveners & Salts' },

  // Add-ins & Other
  { id: 'eggs', name: 'Eggs (Large)', density: 240, category: 'Add-ins & Other', weightPerPiece: 50 },
  { id: 'oats', name: 'Oats (Rolled)', density: 85, category: 'Add-ins & Other' },
  { id: 'chocolate_chips', name: 'Chocolate Chips', density: 170, category: 'Add-ins & Other' },
  { id: 'walnuts', name: 'Walnuts (Chopped)', density: 113, category: 'Add-ins & Other' },
  { id: 'pecans', name: 'Pecans (Chopped)', density: 113, category: 'Add-ins & Other' },
  { id: 'raisins', name: 'Raisins', density: 142, category: 'Add-ins & Other' },
];

export const UNITS = [
  // Weights (Base: Grams)
  { id: 'g', name: 'Grams', short: 'g', type: 'weight', toBase: 1 },
  { id: 'oz', name: 'Ounces', short: 'oz', type: 'weight', toBase: 28.3495 },
  { id: 'lb', name: 'Pounds', short: 'lb', type: 'weight', toBase: 453.592 },
  
  // Volumes (Base: US Cups)
  { id: 'cup', name: 'Cups (US)', short: 'cup', type: 'volume', toBase: 1 },
  { id: 'tbsp', name: 'Tablespoons', short: 'tbsp', type: 'volume', toBase: 0.0625 },
  { id: 'tsp', name: 'Teaspoons', short: 'tsp', type: 'volume', toBase: 0.0208333 },
  { id: 'ml', name: 'Milliliters', short: 'ml', type: 'volume', toBase: 0.00422675 },

  // Count
  { id: 'ea', name: 'Each / Piece', short: 'ea', type: 'count', toBase: 1 },
];

export function convertIngredient(
  amount: number,
  fromUnitId: string,
  toUnitId: string,
  ingredientId: string
): number {
  if (!amount || isNaN(amount)) return 0;

  const fromUnit = UNITS.find(u => u.id === fromUnitId);
  const toUnit = UNITS.find(u => u.id === toUnitId);
  const ingredient = INGREDIENTS.find(i => i.id === ingredientId);

  if (!fromUnit || !toUnit || !ingredient) return 0;

  // Same unit type conversion (e.g., oz to g, or tbsp to cup)
  if (fromUnit.type === toUnit.type) {
    const baseAmount = amount * fromUnit.toBase;
    return baseAmount / toUnit.toBase;
  }

  // Volume to Weight
  if (fromUnit.type === 'volume' && toUnit.type === 'weight') {
    const cups = amount * fromUnit.toBase; // Convert to base volume (cups)
    const grams = cups * ingredient.density; // Convert cups to grams using density
    return grams / toUnit.toBase; // Convert grams to target weight unit
  }

  // Weight to Volume
  if (fromUnit.type === 'weight' && toUnit.type === 'volume') {
    const grams = amount * fromUnit.toBase; // Convert to base weight (grams)
    const cups = grams / ingredient.density; // Convert grams to cups using density
    return cups / toUnit.toBase; // Convert cups to target volume unit
  }

  // Count to Weight
  if (fromUnit.type === 'count' && toUnit.type === 'weight' && ingredient.weightPerPiece) {
    const grams = amount * ingredient.weightPerPiece;
    return grams / toUnit.toBase;
  }

  // Weight to Count
  if (fromUnit.type === 'weight' && toUnit.type === 'count' && ingredient.weightPerPiece) {
    const grams = amount * fromUnit.toBase;
    return grams / ingredient.weightPerPiece;
  }

  // Count to Volume
  if (fromUnit.type === 'count' && toUnit.type === 'volume' && ingredient.weightPerPiece) {
    const grams = amount * ingredient.weightPerPiece;
    const cups = grams / ingredient.density;
    return cups / toUnit.toBase;
  }

  // Volume to Count
  if (fromUnit.type === 'volume' && toUnit.type === 'count' && ingredient.weightPerPiece) {
    const cups = amount * fromUnit.toBase;
    const grams = cups * ingredient.density;
    return grams / ingredient.weightPerPiece;
  }

  return 0;
}

export const PAN_SHAPES = [
  { id: 'round', name: 'Round Pan' },
  { id: 'square', name: 'Square Pan' },
  { id: 'rectangle', name: 'Rectangular Pan' },
  { id: 'loaf', name: 'Loaf Pan' },
  { id: 'oval', name: 'Oval Pan' },
];

export function calculatePanArea(shape: string, dim1: number, dim2?: number): number {
  if (shape === 'round') {
    const radius = dim1 / 2;
    return Math.PI * radius * radius;
  }
  if (shape === 'square') {
    return dim1 * dim1;
  }
  if ((shape === 'rectangle' || shape === 'loaf') && dim2) {
    return dim1 * dim2;
  }
  if (shape === 'oval' && dim2) {
    return Math.PI * (dim1 / 2) * (dim2 / 2);
  }
  return 0;
}
