import { INGREDIENTS, PAN_SHAPES, calculatePanArea, convertIngredient } from "@/src/lib/baking-data";
import { BAKE_TOOLS, type BakeToolId } from "@/src/lib/tools";
import { decimalToFraction } from "@/src/lib/utils";

const OUNCES_IN_GRAMS = 28.3495;

export type WidgetToolId = BakeToolId;

export interface WidgetDDTState {
  unit: "F" | "C";
  desired: number;
  room: number;
  flour: number;
  friction: number;
  mixingMethod: "machine" | "hand";
}

export interface WidgetYeastState {
  amount: number;
  inputType: "fresh" | "ady" | "instant";
  unit: "tsp" | "tbsp" | "g" | "oz";
  format: "fraction" | "decimal";
}

export interface WidgetOvenState {
  tempF: number;
}

export interface WidgetBakersMathState {
  weightUnit: "g" | "oz";
  flour: number;
  water: number;
  salt: number;
  yeast: number;
}

export interface WidgetLevainState {
  unit: "g" | "oz";
  targetWeight: number;
  ratioStarter: number;
  ratioFlour: number;
  ratioWater: number;
}

export interface WidgetRecipeScalerState {
  mode: "servings" | "pan";
  panUnit: "in" | "cm";
  originalServings: number;
  newServings: number;
  originalShape: string;
  originalDim1: number;
  originalDim2: number;
  newShape: string;
  newDim1: number;
  newDim2: number;
}

export interface WidgetConvertState {
  amount: number;
  ingredientId: string;
  fromUnitId: "cup" | "tbsp" | "tsp" | "g" | "oz";
  toUnitId: "cup" | "tbsp" | "tsp" | "g" | "oz";
}

export interface WidgetState {
  activeTool: WidgetToolId;
  ddt: WidgetDDTState;
  yeast: WidgetYeastState;
  oven: WidgetOvenState;
  bakersMath: WidgetBakersMathState;
  levain: WidgetLevainState;
  recipeScaler: WidgetRecipeScalerState;
  convert: WidgetConvertState;
}

const widgetLabels: Record<WidgetToolId, string> = {
  convert: "Convert",
  "recipe-scaler": "Scale",
  "bakers-math": "Baker %",
  levain: "Levain",
  ddt: "DDT",
  yeast: "Yeast",
  oven: "Oven",
};

const widgetOrder: WidgetToolId[] = ["convert", "recipe-scaler", "oven", "bakers-math", "levain", "ddt", "yeast"];

export const WIDGET_TOOLS = widgetOrder
  .map((id) => BAKE_TOOLS.find((tool) => tool.id === id))
  .filter((tool): tool is NonNullable<(typeof BAKE_TOOLS)[number]> => Boolean(tool))
  .map((tool) => ({
    ...tool,
    widgetLabel: widgetLabels[tool.id],
  }));

export const DEFAULT_WIDGET_STATE: WidgetState = {
  activeTool: "convert",
  ddt: {
    unit: "F",
    desired: 78,
    room: 72,
    flour: 72,
    friction: 24,
    mixingMethod: "machine",
  },
  yeast: {
    amount: 2.25,
    inputType: "ady",
    unit: "tsp",
    format: "fraction",
  },
  oven: {
    tempF: 350,
  },
  bakersMath: {
    weightUnit: "oz",
    flour: 35.27,
    water: 26.46,
    salt: 0.71,
    yeast: 0.35,
  },
  levain: {
    unit: "oz",
    targetWeight: 7,
    ratioStarter: 1,
    ratioFlour: 2,
    ratioWater: 2,
  },
  recipeScaler: {
    mode: "servings",
    panUnit: "in",
    originalServings: 4,
    newServings: 8,
    originalShape: "round",
    originalDim1: 8,
    originalDim2: 8,
    newShape: "square",
    newDim1: 9,
    newDim2: 9,
  },
  convert: {
    amount: 1,
    ingredientId: "ap_flour",
    fromUnitId: "cup",
    toUnitId: "g",
  },
};

export const WIDGET_CONVERT_INGREDIENTS = ["ap_flour", "sugar", "butter", "water", "salt"]
  .map((ingredientId) => INGREDIENTS.find((ingredient) => ingredient.id === ingredientId))
  .filter((ingredient): ingredient is NonNullable<(typeof INGREDIENTS)[number]> => Boolean(ingredient));

export function getDDTFrictionPreset(unit: "F" | "C", mixingMethod: "machine" | "hand") {
  if (unit === "F") {
    return mixingMethod === "machine" ? 24 : 6;
  }

  return mixingMethod === "machine" ? 13 : 3;
}

export function calculateDDTWaterTemp(state: Pick<WidgetDDTState, "desired" | "room" | "flour" | "friction">) {
  return state.desired * 3 - (state.room + state.flour + state.friction);
}

function convertTemperature(value: number, fromUnit: "F" | "C", toUnit: "F" | "C") {
  if (fromUnit === toUnit) return value;
  return fromUnit === "F" ? Math.round(((value - 32) * 5) / 9) : Math.round((value * 9) / 5 + 32);
}

export function convertDDTUnit(state: WidgetDDTState, nextUnit: "F" | "C"): WidgetDDTState {
  if (state.unit === nextUnit) return state;

  return {
    ...state,
    unit: nextUnit,
    desired: convertTemperature(state.desired, state.unit, nextUnit),
    room: convertTemperature(state.room, state.unit, nextUnit),
    flour: convertTemperature(state.flour, state.unit, nextUnit),
    friction: getDDTFrictionPreset(nextUnit, state.mixingMethod),
  };
}

export function toggleDDTMixingMethod(state: WidgetDDTState): WidgetDDTState {
  const mixingMethod = state.mixingMethod === "machine" ? "hand" : "machine";
  return {
    ...state,
    mixingMethod,
    friction: getDDTFrictionPreset(state.unit, mixingMethod),
  };
}

const yeastRatios: Record<WidgetYeastState["inputType"], number> = {
  fresh: 1,
  ady: 0.4,
  instant: 0.33,
};

export function getYeastResults(state: WidgetYeastState) {
  const baseAmount = state.amount / yeastRatios[state.inputType];

  return (Object.keys(yeastRatios) as WidgetYeastState["inputType"][])
    .filter((type) => type !== state.inputType)
    .map((type) => ({
      type,
      value: baseAmount * yeastRatios[type],
    }));
}

export function formatYeastAmount(
  value: number,
  unit: WidgetYeastState["unit"],
  format: WidgetYeastState["format"]
) {
  if (format === "fraction" && (unit === "tsp" || unit === "tbsp" || unit === "oz")) {
    return decimalToFraction(value);
  }

  return parseFloat(value.toFixed(2)).toString();
}

export function calculateOven(tempF: number) {
  const tempC = Math.round(((tempF - 32) * 5) / 9);
  const gasMark =
    tempF < 225 ? 0 : tempF === 225 ? 0.25 : tempF === 250 ? 0.5 : Math.round((tempF - 250) / 25);

  return {
    tempC,
    gasMark,
  };
}

function convertWeight(value: number, fromUnit: "g" | "oz", toUnit: "g" | "oz") {
  if (fromUnit === toUnit) return value;
  return fromUnit === "g" ? value / OUNCES_IN_GRAMS : value * OUNCES_IN_GRAMS;
}

export function convertBakersMathUnit(
  state: WidgetBakersMathState,
  nextUnit: WidgetBakersMathState["weightUnit"]
): WidgetBakersMathState {
  if (state.weightUnit === nextUnit) return state;

  const round2 = (value: number) => parseFloat(value.toFixed(2));

  return {
    weightUnit: nextUnit,
    flour: round2(convertWeight(state.flour, state.weightUnit, nextUnit)),
    water: round2(convertWeight(state.water, state.weightUnit, nextUnit)),
    salt: round2(convertWeight(state.salt, state.weightUnit, nextUnit)),
    yeast: round2(convertWeight(state.yeast, state.weightUnit, nextUnit)),
  };
}

/** Display-only; matches iOS `weightOneDecimalLabel` (one decimal). */
export function formatWidgetWeightOneDecimal(value: number): string {
  return value.toFixed(1);
}

export function calculateBakersMath(state: WidgetBakersMathState) {
  const hydration = state.flour > 0 ? (state.water / state.flour) * 100 : 0;
  const saltPct = state.flour > 0 ? (state.salt / state.flour) * 100 : 0;
  const yeastPct = state.flour > 0 ? (state.yeast / state.flour) * 100 : 0;
  const totalDough = state.flour + state.water + state.salt + state.yeast;

  return {
    hydration,
    saltPct,
    yeastPct,
    totalDough,
  };
}

export function convertLevainUnit(state: WidgetLevainState, nextUnit: WidgetLevainState["unit"]): WidgetLevainState {
  if (state.unit === nextUnit) return state;

  const raw = convertWeight(state.targetWeight, state.unit, nextUnit);
  const targetWeight = parseFloat(raw.toFixed(2));

  return {
    ...state,
    unit: nextUnit,
    targetWeight,
  };
}

/** Step size for the widget ingredient converter (+/-), aligned with iOS widget `convertStep`. */
export function getConvertAmountStep(fromUnitId: WidgetConvertState["fromUnitId"]): number {
  switch (fromUnitId) {
    case "cup":
      return 0.25;
    case "tbsp":
    case "tsp":
      return 1;
    case "g":
      return 10;
    case "oz":
      return 0.5;
    default:
      return 1;
  }
}

/** Snap +/- for grams to a 10 g grid so 1 g + up becomes 10 g, not 11 g. */
export function adjustConvertAmountGram(amount: number, delta: number): number {
  if (delta > 0) {
    return Math.floor(amount / 10) * 10 + 10;
  }
  return Math.max(0, Math.ceil(amount / 10) * 10 - 10);
}

/** Keep the same physical quantity when changing the "from" unit (avoids e.g. 120 g becoming 120 tbsp). */
export function convertAmountPreservingQuantity(state: WidgetConvertState, nextFromUnitId: WidgetConvertState["fromUnitId"]): number {
  if (state.fromUnitId === nextFromUnitId) return state.amount;
  const converted = convertIngredient(state.amount, state.fromUnitId, nextFromUnitId, state.ingredientId);
  return parseFloat(converted.toFixed(2));
}

export function calculateLevain(state: WidgetLevainState) {
  const totalParts = state.ratioStarter + state.ratioFlour + state.ratioWater;
  const partWeight = totalParts > 0 ? state.targetWeight / totalParts : 0;

  return {
    totalParts,
    starter: partWeight * state.ratioStarter,
    flour: partWeight * state.ratioFlour,
    water: partWeight * state.ratioWater,
  };
}

export function convertRecipeScalerPanUnit(
  state: WidgetRecipeScalerState,
  nextUnit: WidgetRecipeScalerState["panUnit"]
) {
  if (state.panUnit === nextUnit) return state;

  const multiplier = nextUnit === "cm" ? 2.54 : 1 / 2.54;
  const convertDimension = (value: number) => parseFloat((value * multiplier).toFixed(2));

  return {
    ...state,
    panUnit: nextUnit,
    originalDim1: convertDimension(state.originalDim1),
    originalDim2: convertDimension(state.originalDim2),
    newDim1: convertDimension(state.newDim1),
    newDim2: convertDimension(state.newDim2),
  };
}

export function calculateRecipeScale(state: WidgetRecipeScalerState) {
  if (state.mode === "servings") {
    return state.newServings / Math.max(1, state.originalServings);
  }

  const originalArea = calculatePanArea(state.originalShape, state.originalDim1, state.originalDim2);
  const newArea = calculatePanArea(state.newShape, state.newDim1, state.newDim2);

  return originalArea > 0 ? newArea / originalArea : 1;
}

export function getPanShapeLabel(shapeId: string) {
  return PAN_SHAPES.find((shape) => shape.id === shapeId)?.name ?? shapeId;
}

export function cyclePanShape(shapeId: string) {
  const index = PAN_SHAPES.findIndex((shape) => shape.id === shapeId);
  const nextIndex = index >= 0 ? (index + 1) % PAN_SHAPES.length : 0;
  return PAN_SHAPES[nextIndex]?.id ?? "round";
}

export function getPanDimensionLabels(shapeId: string) {
  if (shapeId === "round") {
    return { primary: "Diameter", secondary: null };
  }

  if (shapeId === "square") {
    return { primary: "Side", secondary: null };
  }

  if (shapeId === "oval") {
    return { primary: "Width", secondary: "Height" };
  }

  return { primary: "Width", secondary: "Length" };
}

export function calculateQuickConvert(state: WidgetConvertState) {
  const ingredient =
    WIDGET_CONVERT_INGREDIENTS.find((item) => item.id === state.ingredientId) ?? WIDGET_CONVERT_INGREDIENTS[0];

  return {
    ingredient,
    convertedAmount: convertIngredient(state.amount, state.fromUnitId, state.toUnitId, ingredient.id),
  };
}
