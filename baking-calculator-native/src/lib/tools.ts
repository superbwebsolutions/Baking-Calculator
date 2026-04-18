export type BakeToolId =
  | "convert"
  | "recipe-scaler"
  | "bakers-math"
  | "levain"
  | "ddt"
  | "yeast"
  | "oven";

export interface BakeToolDefinition {
  id: BakeToolId;
  title: string;
  description: string;
  route: string;
  symbol: string;
  showOnHome: boolean;
}

export const BAKE_TOOLS: BakeToolDefinition[] = [
  {
    id: "convert",
    title: "Ingredient Converter",
    description: "Convert cups, grams, ounces, and pieces with ingredient density.",
    route: "/convert",
    symbol: "arrow.up.arrow.down",
    showOnHome: false,
  },
  {
    id: "recipe-scaler",
    title: "Recipe Scaler",
    description: "Resize recipes by servings or pan dimensions.",
    route: "/calculators/recipe-scaler",
    symbol: "chart.pie.fill",
    showOnHome: true,
  },
  {
    id: "bakers-math",
    title: "Baker's Percentage",
    description: "Break a dough formula into baker's percentages.",
    route: "/calculators/bakers-math",
    symbol: "percent",
    showOnHome: true,
  },
  {
    id: "levain",
    title: "Levain Calculator",
    description: "Work out starter, flour, and water for your build.",
    route: "/calculators/levain",
    symbol: "testtube.2",
    showOnHome: true,
  },
  {
    id: "ddt",
    title: "Dough Temp (DDT)",
    description: "Calculate target water temperature for mixing.",
    route: "/calculators/ddt",
    symbol: "thermometer.medium",
    showOnHome: true,
  },
  {
    id: "yeast",
    title: "Yeast Converter",
    description: "Translate between fresh, ADY, and instant yeast.",
    route: "/calculators/yeast",
    symbol: "drop.fill",
    showOnHome: true,
  },
  {
    id: "oven",
    title: "Oven Temperature",
    description: "Convert Fahrenheit, Celsius, and gas mark.",
    route: "/calculators/oven",
    symbol: "flame.fill",
    showOnHome: true,
  },
];

export const HOME_TOOLS = BAKE_TOOLS.filter((tool) => tool.showOnHome);

export function getToolById(id: string) {
  return BAKE_TOOLS.find((tool) => tool.id === id);
}
