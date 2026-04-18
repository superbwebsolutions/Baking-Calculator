import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { ScreenScroll } from "@/src/components/screen-scroll";
import { SelectField } from "@/src/components/select-field";
import {
  INGREDIENTS,
  PAN_SHAPES,
  UNITS,
  calculatePanArea,
  convertIngredient,
} from "@/src/lib/baking-data";
import { type RecipeIngredient, useRecipes } from "@/src/lib/recipe-context";
import { colors, radius, shadowCard } from "@/src/lib/theme";
import { createId, decimalToFraction, parseNumber } from "@/src/lib/utils";

type CalculatorSlug = "bakers-math" | "ddt" | "levain" | "yeast" | "oven" | "recipe-scaler";

const titles: Record<CalculatorSlug, string> = {
  "bakers-math": "Baker's Percentage",
  ddt: "Dough Temp (DDT)",
  levain: "Levain Calculator",
  yeast: "Yeast Converter",
  oven: "Oven Temperature",
  "recipe-scaler": "Recipe Scaler",
};

const unitOptions = UNITS.map((unit) => ({ label: unit.short, value: unit.id }));
const panShapeOptions = PAN_SHAPES.map((shape) => ({ label: shape.name, value: shape.id }));
const DEGREE_SYMBOL = "\u00B0";
const OUNCES_IN_GRAMS = 28.3495;

const cardStyle = {
  gap: 14,
  padding: 18,
  borderRadius: radius.card,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadowCard,
};

const smallInputStyle = {
  borderRadius: radius.input,
  backgroundColor: colors.cardMuted,
  borderWidth: 1,
  borderColor: colors.border,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 16,
  fontWeight: "600" as const,
  color: colors.text,
};

const heroInputStyle = {
  borderRadius: radius.input,
  backgroundColor: colors.cardMuted,
  borderWidth: 1,
  borderColor: colors.border,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 30,
  fontWeight: "800" as const,
  color: colors.text,
};

const eyebrowStyle = {
  fontSize: 12,
  fontWeight: "700" as const,
  color: colors.faint,
  textTransform: "uppercase" as const,
};

const secondaryButtonStyle = {
  alignItems: "center" as const,
  justifyContent: "center" as const,
  borderRadius: radius.input,
  backgroundColor: colors.cardMuted,
  paddingHorizontal: 14,
  paddingVertical: 12,
};

const getUnitShort = (unitId: string) => UNITS.find((unit) => unit.id === unitId)?.short ?? unitId;
const convertWeightUnit = (value: number, from: "g" | "oz", to: "g" | "oz") => {
  if (from === to) return value;
  return from === "g" ? value / OUNCES_IN_GRAMS : value * OUNCES_IN_GRAMS;
};

const formatWeightInput = (value: number) => parseFloat(value.toFixed(2)).toString();

export function CalculatorRouteScreen() {
  const params = useLocalSearchParams<{ slug?: string; recipeId?: string }>();
  const slug = params.slug as CalculatorSlug | undefined;
  const recipeId = Array.isArray(params.recipeId) ? params.recipeId[0] : params.recipeId;

  return (
    <>
      <Stack.Screen options={{ title: slug ? titles[slug] ?? "Calculator" : "Calculator" }} />
      {slug === "ddt" ? <DDTCalculatorScreen /> : null}
      {slug === "levain" ? <LevainCalculatorScreen /> : null}
      {slug === "yeast" ? <YeastConverterScreen /> : null}
      {slug === "oven" ? <OvenTempConverterScreen /> : null}
      {slug === "bakers-math" ? <BakersPercentageScreen /> : null}
      {slug === "recipe-scaler" ? <RecipeScalerScreen recipeId={recipeId} /> : null}
      {!slug || !(slug in titles) ? (
        <ScreenScroll>
          <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text }}>Calculator not found</Text>
        </ScreenScroll>
      ) : null}
    </>
  );
}

function DDTCalculatorScreen() {
  const [unit, setUnit] = useState<"F" | "C">("F");
  const [desiredTemp, setDesiredTemp] = useState("78");
  const [roomTemp, setRoomTemp] = useState("72");
  const [flourTemp, setFlourTemp] = useState("72");
  const [frictionFactor, setFrictionFactor] = useState("24");
  const [mixingMethod, setMixingMethod] = useState<"machine" | "hand">("machine");

  const convertUnit = (nextUnit: "F" | "C") => {
    if (nextUnit === unit) return;

    const convert = (value: string) => {
      const parsed = parseNumber(value);
      return nextUnit === "C"
        ? Math.round(((parsed - 32) * 5) / 9).toString()
        : Math.round((parsed * 9) / 5 + 32).toString();
    };

    setDesiredTemp(convert(desiredTemp));
    setRoomTemp(convert(roomTemp));
    setFlourTemp(convert(flourTemp));
    setFrictionFactor(
      nextUnit === "C"
        ? mixingMethod === "machine"
          ? "13"
          : "3"
        : mixingMethod === "machine"
          ? "24"
          : "6"
    );
    setUnit(nextUnit);
  };

  const updateMethod = (nextMethod: "machine" | "hand") => {
    setMixingMethod(nextMethod);
    setFrictionFactor(
      unit === "F"
        ? nextMethod === "machine"
          ? "24"
          : "6"
        : nextMethod === "machine"
          ? "13"
          : "3"
    );
  };

  const waterTemp =
    parseNumber(desiredTemp) * 3 -
    (parseNumber(roomTemp) + parseNumber(flourTemp) + parseNumber(frictionFactor));

  return (
    <ScreenScroll>
      <View style={cardStyle}>
        <LabeledNumberInput
          label="Desired Dough Temp"
          value={desiredTemp}
          onChange={setDesiredTemp}
          suffix={`${DEGREE_SYMBOL}${unit}`}
        />
        <LabeledNumberInput label="Room Temp" value={roomTemp} onChange={setRoomTemp} suffix={`${DEGREE_SYMBOL}${unit}`} />
        <LabeledNumberInput label="Flour Temp" value={flourTemp} onChange={setFlourTemp} suffix={`${DEGREE_SYMBOL}${unit}`} />
        <LabeledNumberInput
          label="Friction Factor"
          value={frictionFactor}
          onChange={setFrictionFactor}
          suffix={`${DEGREE_SYMBOL}${unit}`}
        />
        <SegmentedControl
          options={[
            { label: "Stand Mixer", value: "machine" },
            { label: "Hand Knead", value: "hand" },
          ]}
          value={mixingMethod}
          onChange={(value) => updateMethod(value as "machine" | "hand")}
        />
      </View>

      <SegmentedControl
        options={[
          { label: `${DEGREE_SYMBOL}F`, value: "F" },
          { label: `${DEGREE_SYMBOL}C`, value: "C" },
        ]}
        value={unit}
        onChange={(value) => convertUnit(value as "F" | "C")}
      />

      <ResultCard label="Required Water Temp" value={`${waterTemp}${DEGREE_SYMBOL}${unit}`} />
    </ScreenScroll>
  );
}

function LevainCalculatorScreen() {
  const [unit, setUnit] = useState<"oz" | "g">("oz");
  const [targetWeight, setTargetWeight] = useState("7");
  const [ratioStarter, setRatioStarter] = useState("1");
  const [ratioFlour, setRatioFlour] = useState("2");
  const [ratioWater, setRatioWater] = useState("2");

  const totalWeight = parseNumber(targetWeight);
  const starter = parseNumber(ratioStarter);
  const flour = parseNumber(ratioFlour);
  const water = parseNumber(ratioWater);
  const totalParts = starter + flour + water;
  const partWeight = totalParts > 0 ? totalWeight / totalParts : 0;

  const convertUnit = (nextUnit: "oz" | "g") => {
    if (nextUnit === unit) return;
    const converted = convertWeightUnit(parseNumber(targetWeight), unit, nextUnit);
    setTargetWeight(formatWeightInput(converted));
    setUnit(nextUnit);
  };

  return (
    <ScreenScroll>
      <SegmentedControl
        options={[
          { label: "Imperial", value: "oz" },
          { label: "Metric", value: "g" },
        ]}
        value={unit}
        onChange={(value) => convertUnit(value as "oz" | "g")}
      />

      <View style={cardStyle}>
        <Text style={eyebrowStyle}>Target Levain Weight ({unit})</Text>
        <TextInput value={targetWeight} onChangeText={setTargetWeight} keyboardType="decimal-pad" style={heroInputStyle} />
        <Text style={eyebrowStyle}>Feeding Ratio</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <RatioInput label="Starter" value={ratioStarter} onChange={setRatioStarter} />
          <RatioInput label="Flour" value={ratioFlour} onChange={setRatioFlour} />
          <RatioInput label="Water" value={ratioWater} onChange={setRatioWater} />
        </View>
      </View>

      <View style={cardStyle}>
        <ResultRow label="Mature Starter" value={`${(partWeight * starter).toFixed(1)} ${unit}`} />
        <ResultRow label="Flour" value={`${(partWeight * flour).toFixed(1)} ${unit}`} />
        <ResultRow label="Water" value={`${(partWeight * water).toFixed(1)} ${unit}`} />
      </View>
    </ScreenScroll>
  );
}
function YeastConverterScreen() {
  const yeastTypes = [
    { id: "fresh", name: "Fresh Yeast (Cake)", ratio: 1 },
    { id: "ady", name: "Active Dry Yeast", ratio: 0.4 },
    { id: "instant", name: "Instant Yeast", ratio: 0.33 },
  ];
  const yeastUnits = ["tsp", "tbsp", "g", "oz"];

  const [amount, setAmount] = useState("2.25");
  const [inputType, setInputType] = useState("ady");
  const [unit, setUnit] = useState("tsp");
  const [format, setFormat] = useState<"fraction" | "decimal">("fraction");

  const amountNumber = parseNumber(amount);
  const inputRatio = yeastTypes.find((type) => type.id === inputType)?.ratio ?? 1;
  const baseAmount = amountNumber / inputRatio;

  return (
    <ScreenScroll>
      <View style={cardStyle}>
        <Text style={eyebrowStyle}>Recipe Amount</Text>
        <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={heroInputStyle} />
        <SegmentedControl
          options={yeastUnits.map((item) => ({ label: item, value: item }))}
          value={unit}
          onChange={setUnit}
        />
        <View style={{ gap: 10 }}>
          {yeastTypes.map((type) => (
            <Pressable
              key={type.id}
              onPress={() => setInputType(type.id)}
              style={{
                borderRadius: radius.input,
                borderWidth: 1,
                borderColor: inputType === type.id ? colors.accent : colors.border,
                backgroundColor: inputType === type.id ? colors.accentSoft : colors.cardMuted,
                padding: 14,
              }}
            >
              <Text style={{ fontWeight: "700", color: inputType === type.id ? colors.accent : colors.text }}>
                {type.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <SegmentedControl
        options={[
          { label: "Fraction", value: "fraction" },
          { label: "Decimal", value: "decimal" },
        ]}
        value={format}
        onChange={(value) => setFormat(value as "fraction" | "decimal")}
      />

      <View style={cardStyle}>
        {yeastTypes
          .filter((type) => type.id !== inputType)
          .map((type) => {
            const result = baseAmount * type.ratio;
            const display =
              format === "fraction" && (unit === "tsp" || unit === "tbsp" || unit === "oz")
                ? decimalToFraction(result)
                : parseFloat(result.toFixed(2)).toString();
            return <ResultRow key={type.id} label={type.name} value={`${display} ${unit}`} />;
          })}
      </View>
    </ScreenScroll>
  );
}

function OvenTempConverterScreen() {
  const presets = [
    { f: 275, label: "Very Low" },
    { f: 325, label: "Low" },
    { f: 350, label: "Moderate" },
    { f: 375, label: "Med-High" },
    { f: 400, label: "High" },
    { f: 450, label: "Very High" },
  ];

  const [tempF, setTempF] = useState("350");
  const [tempC, setTempC] = useState("175");
  const [gasMark, setGasMark] = useState("4");

  const calculateGas = (f: number) => {
    if (f < 225) return 0;
    if (f === 225) return 0.25;
    if (f === 250) return 0.5;
    return Math.round((f - 250) / 25);
  };

  const updateF = (value: string) => {
    const parsed = parseNumber(value);
    setTempF(value);
    setTempC(Math.round(((parsed - 32) * 5) / 9).toString());
    setGasMark(String(calculateGas(parsed)));
  };

  const updateC = (value: string) => {
    const parsed = parseNumber(value);
    const f = Math.round((parsed * 9) / 5 + 32);
    setTempC(value);
    setTempF(String(f));
    setGasMark(String(calculateGas(f)));
  };

  const updateGas = (value: string) => {
    const parsed = parseNumber(value);
    const f = Math.round(parsed * 25 + 250);
    setGasMark(value);
    setTempF(String(f));
    setTempC(String(Math.round(((f - 32) * 5) / 9)));
  };

  return (
    <ScreenScroll>
      <View style={cardStyle}>
        <LabeledNumberInput label="Fahrenheit" value={tempF} onChange={updateF} suffix={`${DEGREE_SYMBOL}F`} />
        <LabeledNumberInput label="Celsius" value={tempC} onChange={updateC} suffix={`${DEGREE_SYMBOL}C`} />
        <LabeledNumberInput label="Gas Mark" value={gasMark} onChange={updateGas} suffix="Gas" />
      </View>

      <View style={cardStyle}>
        {presets.map((preset) => (
          <Pressable
            key={preset.f}
            onPress={() => updateF(String(preset.f))}
            style={{
              borderRadius: radius.input,
              borderWidth: 1,
              borderColor: parseNumber(tempF) === preset.f ? colors.accent : colors.border,
              backgroundColor: parseNumber(tempF) === preset.f ? colors.accentSoft : colors.cardMuted,
              padding: 14,
              gap: 4,
            }}
          >
            <Text style={{ fontWeight: "700", color: parseNumber(tempF) === preset.f ? colors.accent : colors.text }}>
              {preset.label}
            </Text>
            <Text style={{ color: colors.muted }}>
              {preset.f}
              {DEGREE_SYMBOL}F - {Math.round(((preset.f - 32) * 5) / 9)}
              {DEGREE_SYMBOL}C - Gas {calculateGas(preset.f)}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScreenScroll>
  );
}

function BakersPercentageScreen() {
  const { recipes } = useRecipes();
  const [weightUnit, setWeightUnit] = useState<"oz" | "g">("oz");
  const [recipeId, setRecipeId] = useState("");
  const [flours, setFlours] = useState([
    { id: "f1", name: "Bread Flour", weight: formatWeightInput(convertWeightUnit(800, "g", "oz")) },
    { id: "f2", name: "Whole Wheat Flour", weight: formatWeightInput(convertWeightUnit(200, "g", "oz")) },
  ]);
  const [others, setOthers] = useState([
    { id: "o1", name: "Water", weight: formatWeightInput(convertWeightUnit(750, "g", "oz")) },
    { id: "o2", name: "Salt", weight: formatWeightInput(convertWeightUnit(20, "g", "oz")) },
    { id: "o3", name: "Yeast", weight: formatWeightInput(convertWeightUnit(10, "g", "oz")) },
  ]);

  const totalFlour = flours.reduce((sum, item) => sum + parseNumber(item.weight), 0);
  const totalOther = others.reduce((sum, item) => sum + parseNumber(item.weight), 0);
  const recipeOptions = recipes.map((recipe) => ({ label: recipe.name, value: recipe.id }));

  const convertRows = (
    rows: { id: string; name: string; weight: string }[],
    from: "oz" | "g",
    to: "oz" | "g"
  ) => rows.map((row) => ({ ...row, weight: formatWeightInput(convertWeightUnit(parseNumber(row.weight), from, to)) }));

  const convertDisplayUnit = (nextUnit: "oz" | "g") => {
    if (nextUnit === weightUnit) return;
    setFlours((current) => convertRows(current, weightUnit, nextUnit));
    setOthers((current) => convertRows(current, weightUnit, nextUnit));
    setWeightUnit(nextUnit);
  };

  const loadRecipe = (nextRecipeId: string) => {
    setRecipeId(nextRecipeId);
    const recipe = recipes.find((item) => item.id === nextRecipeId);
    if (!recipe) return;

    const newFlours: { id: string; name: string; weight: string }[] = [];
    const newOthers: { id: string; name: string; weight: string }[] = [];

    recipe.ingredients.forEach((ingredient) => {
      const knownIngredient = INGREDIENTS.find((item) => item.name === ingredient.name);
      const isFlour =
        knownIngredient?.category === "Flours & Starches" || ingredient.name.toLowerCase().includes("flour");
      const knownUnit = UNITS.find((unit) => unit.id === ingredient.unit || unit.short === ingredient.unit);
      let weight = parseNumber(ingredient.amount);

      if (knownUnit && knownUnit.id !== "g" && knownIngredient) {
        weight = convertIngredient(weight, knownUnit.id, "g", knownIngredient.id);
      }

      const displayWeight =
        weightUnit === "g" ? String(Math.round(weight)) : formatWeightInput(convertWeightUnit(weight, "g", "oz"));
      const next = { id: createId("baker"), name: ingredient.name, weight: displayWeight };
      if (isFlour) newFlours.push(next);
      else newOthers.push(next);
    });

    setFlours(newFlours.length > 0 ? newFlours : [{ id: createId("baker"), name: "Flour", weight: "0" }]);
    setOthers(newOthers);
  };

  return (
    <ScreenScroll>
      <SegmentedControl
        options={[
          { label: "Imperial", value: "oz" },
          { label: "Metric", value: "g" },
        ]}
        value={weightUnit}
        onChange={(value) => convertDisplayUnit(value as "oz" | "g")}
      />

      <View style={{ flexDirection: "row", gap: 12 }}>
        <SummaryBox label="Total Flour" value={`${parseFloat(totalFlour.toFixed(1))}${weightUnit}`} accent />
        <SummaryBox label="Total Dough" value={`${parseFloat((totalFlour + totalOther).toFixed(1))}${weightUnit}`} />
      </View>

      <SelectField
        title="Load Recipe"
        label="Recipe"
        placeholder="Load recipe..."
        options={recipeOptions}
        value={recipeId}
        onChange={loadRecipe}
      />

      <IngredientPercentSection
        title="Flours"
        rows={flours}
        totalFlour={totalFlour}
        unitLabel={weightUnit}
        onChange={setFlours}
      />
      <IngredientPercentSection
        title="Other Ingredients"
        rows={others}
        totalFlour={totalFlour}
        unitLabel={weightUnit}
        onChange={setOthers}
      />
    </ScreenScroll>
  );
}
function RecipeScalerScreen({ recipeId }: { recipeId?: string }) {
  const { recipes } = useRecipes();
  const initialRecipe = recipes.find((recipe) => recipe.id === recipeId);

  const [mode, setMode] = useState<"servings" | "pan">("servings");
  const [panUnit, setPanUnit] = useState<"in" | "cm">("in");
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipeId ?? "");
  const [originalServings, setOriginalServings] = useState("4");
  const [newServings, setNewServings] = useState("8");
  const [originalShape, setOriginalShape] = useState("round");
  const [originalDim1, setOriginalDim1] = useState("8");
  const [originalDim2, setOriginalDim2] = useState("8");
  const [newShape, setNewShape] = useState("square");
  const [newDim1, setNewDim1] = useState("9");
  const [newDim2, setNewDim2] = useState("9");
  const [format, setFormat] = useState<"fraction" | "decimal">("fraction");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    initialRecipe?.ingredients ?? [
      { id: "1", amount: "2", unit: "cup", name: "All-Purpose Flour" },
      { id: "2", amount: "0.5", unit: "cup", name: "Granulated Sugar" },
      { id: "3", amount: "100", unit: "g", name: "Butter" },
    ]
  );

  const recipeOptions = [
    ...recipes.map((recipe) => ({ label: recipe.name, value: recipe.id })),
    { label: "+ New Recipe", value: "__new__" },
  ];

  const multiplier =
    mode === "servings"
      ? parseNumber(newServings, 1) / Math.max(1, parseNumber(originalServings, 1))
      : calculatePanArea(originalShape, parseNumber(originalDim1), parseNumber(originalDim2)) > 0
        ? calculatePanArea(newShape, parseNumber(newDim1), parseNumber(newDim2)) /
          calculatePanArea(originalShape, parseNumber(originalDim1), parseNumber(originalDim2))
        : 1;

  const loadRecipe = (value: string) => {
    if (value === "__new__") {
      router.push("/recipes");
      return;
    }

    setSelectedRecipeId(value);
    const recipe = recipes.find((item) => item.id === value);
    if (!recipe) return;

    setIngredients(recipe.ingredients.map((ingredient) => ({ ...ingredient, id: createId("scaled") })));
  };

  const updateIngredient = (id: string, field: keyof RecipeIngredient, value: string) => {
    setIngredients((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const convertPanUnit = (nextUnit: "in" | "cm") => {
    if (nextUnit === panUnit) return;

    const ratio = nextUnit === "cm" ? 2.54 : 1 / 2.54;
    const convertValue = (value: string) => {
      const parsed = parseNumber(value);
      if (!parsed) return value;
      return parseFloat((parsed * ratio).toFixed(2)).toString();
    };

    setOriginalDim1(convertValue(originalDim1));
    setOriginalDim2(convertValue(originalDim2));
    setNewDim1(convertValue(newDim1));
    setNewDim2(convertValue(newDim2));
    setPanUnit(nextUnit);
  };

  const originalLabels = getPanLabels(originalShape);
  const newLabels = getPanLabels(newShape);

  return (
    <ScreenScroll>
      <SegmentedControl
        options={[
          { label: "By Servings", value: "servings" },
          { label: "By Pan Size", value: "pan" },
        ]}
        value={mode}
        onChange={(value) => setMode(value as "servings" | "pan")}
      />

      <View style={cardStyle}>
        {mode === "servings" ? (
          <View style={{ flexDirection: "row", gap: 12 }}>
            <NumberInputCard label="Original" value={originalServings} onChange={setOriginalServings} />
            <NumberInputCard label="New" value={newServings} onChange={setNewServings} accent />
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            <SegmentedControl
              options={[
                { label: "Inches", value: "in" },
                { label: "Centimeters", value: "cm" },
              ]}
              value={panUnit}
              onChange={(value) => convertPanUnit(value as "in" | "cm")}
            />

            <SelectField
              title="Original Pan"
              label="Original Shape"
              options={panShapeOptions}
              value={originalShape}
              onChange={setOriginalShape}
            />
            <PanDimensionInputs
              primaryLabel={`Size (${panUnit})`}
              secondaryLabel={`Size (${panUnit})`}
              primaryValue={originalDim1}
              secondaryValue={originalLabels.secondary ? originalDim2 : originalDim1}
              onPrimaryChange={setOriginalDim1}
              onSecondaryChange={originalLabels.secondary ? setOriginalDim2 : setOriginalDim1}
              showSecondary
            />

            <SelectField
              title="New Pan"
              label="New Shape"
              options={panShapeOptions}
              value={newShape}
              onChange={setNewShape}
            />
            <PanDimensionInputs
              primaryLabel={`Size (${panUnit})`}
              secondaryLabel={`Size (${panUnit})`}
              primaryValue={newDim1}
              secondaryValue={newLabels.secondary ? newDim2 : newDim1}
              onPrimaryChange={setNewDim1}
              onSecondaryChange={newLabels.secondary ? setNewDim2 : setNewDim1}
              showSecondary
              accent
            />
          </View>
        )}

        <ResultRow label="Scaling Factor" value={`${multiplier.toFixed(2)}x`} accent />
      </View>

      <SelectField
        title="Load Recipe"
        label="Recipe"
        placeholder="Load recipe..."
        options={recipeOptions}
        value={selectedRecipeId}
        onChange={loadRecipe}
      />

      <SegmentedControl
        options={[
          { label: "Fraction", value: "fraction" },
          { label: "Decimal", value: "decimal" },
        ]}
        value={format}
        onChange={(value) => setFormat(value as "fraction" | "decimal")}
      />

      <View style={cardStyle}>
        {ingredients.map((ingredient) => {
          const scaled = parseNumber(ingredient.amount) * multiplier;
          const display =
            format === "fraction"
              ? decimalToFraction(scaled)
              : parseFloat(scaled.toFixed(2)).toString();
          const unitLabel = getUnitShort(ingredient.unit);

          return (
            <View key={ingredient.id} style={{ gap: 10, paddingVertical: 10 }}>
              <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={eyebrowStyle}>Ingredient</Text>
                  <TextInput
                    value={ingredient.name}
                    onChangeText={(value) => updateIngredient(ingredient.id, "name", value)}
                    placeholder="Ingredient name"
                    style={smallInputStyle}
                  />
                </View>
                <View style={{ width: 92, gap: 6 }}>
                  <Text style={eyebrowStyle}>Action</Text>
                  <Pressable
                    onPress={() => setIngredients((current) => current.filter((item) => item.id !== ingredient.id))}
                    style={secondaryButtonStyle}
                  >
                    <Text style={{ color: colors.danger, fontWeight: "700" }}>Remove</Text>
                  </Pressable>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 0.36, gap: 6 }}>
                  <Text style={eyebrowStyle}>Qty</Text>
                  <TextInput
                    value={ingredient.amount}
                    onChangeText={(value) => updateIngredient(ingredient.id, "amount", value)}
                    placeholder="Qty"
                    keyboardType="decimal-pad"
                    style={smallInputStyle}
                  />
                </View>
                <View style={{ flex: 0.64, gap: 6 }}>
                  <Text style={eyebrowStyle}>Unit</Text>
                  <SelectField
                    title="Choose Unit"
                    options={unitOptions}
                    value={ingredient.unit}
                    onChange={(value) => updateIngredient(ingredient.id, "unit", value)}
                    compact
                  />
                </View>
              </View>

              <View
                style={{
                  borderRadius: radius.input,
                  backgroundColor: colors.cardMuted,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <ResultRow label={ingredient.name || "Scaled Amount"} value={`${display} ${unitLabel}`} />
              </View>
            </View>
          );
        })}

        <Pressable
          onPress={() =>
            setIngredients((current) => [
              ...current,
              { id: createId("scaled"), amount: "", unit: "g", name: "" },
            ])
          }
          style={secondaryButtonStyle}
        >
          <Text style={{ color: colors.text, fontWeight: "700" }}>Add Ingredient</Text>
        </Pressable>
      </View>
    </ScreenScroll>
  );
}
function IngredientPercentSection({
  title,
  rows,
  totalFlour,
  unitLabel,
  onChange,
}: {
  title: string;
  rows: { id: string; name: string; weight: string }[];
  totalFlour: number;
  unitLabel: string;
  onChange: (rows: { id: string; name: string; weight: string }[]) => void;
}) {
  return (
    <View style={cardStyle}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>{title}</Text>
        <Pressable
          onPress={() => onChange([...rows, { id: createId("percent"), name: "", weight: "0" }])}
          style={secondaryButtonStyle}
        >
          <Text style={{ color: colors.text, fontWeight: "700" }}>Add</Text>
        </Pressable>
      </View>

      {rows.map((row) => {
        const percentage = totalFlour > 0 ? ((parseNumber(row.weight) / totalFlour) * 100).toFixed(1) : "0.0";

        return (
          <View key={row.id} style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={eyebrowStyle}>Ingredient</Text>
                <TextInput
                  value={row.name}
                  onChangeText={(value) =>
                    onChange(rows.map((item) => (item.id === row.id ? { ...item, name: value } : item)))
                  }
                  placeholder="Ingredient"
                  style={smallInputStyle}
                />
              </View>
              <View style={{ width: 64, gap: 6 }}>
                <Text style={eyebrowStyle}>Remove</Text>
                <Pressable
                  onPress={() => onChange(rows.filter((item) => item.id !== row.id))}
                  style={secondaryButtonStyle}
                >
                  <Text style={{ color: colors.danger, fontWeight: "700" }}>x</Text>
                </Pressable>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 0.45, gap: 6 }}>
                <Text style={eyebrowStyle}>Weight ({unitLabel})</Text>
                <TextInput
                  value={row.weight}
                  onChangeText={(value) =>
                    onChange(rows.map((item) => (item.id === row.id ? { ...item, weight: value } : item)))
                  }
                  keyboardType="decimal-pad"
                  placeholder={unitLabel}
                  style={smallInputStyle}
                />
              </View>
              <View style={{ flex: 0.55, gap: 6 }}>
                <Text style={eyebrowStyle}>Baker's %</Text>
                <View style={[smallInputStyle, { justifyContent: "center" }]}>
                  <Text style={{ fontWeight: "700", color: colors.accent }}>{percentage}%</Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 8,
        padding: 4,
        borderRadius: radius.input,
        backgroundColor: colors.cardMuted,
      }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              alignItems: "center",
              borderRadius: radius.input - 4,
              backgroundColor: active ? colors.card : "transparent",
              paddingVertical: 12,
            }}
          >
            <Text style={{ color: active ? colors.text : colors.muted, fontWeight: "700" }}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        gap: 8,
        padding: 20,
        borderRadius: radius.card,
        backgroundColor: colors.accent,
        ...shadowCard,
      }}
    >
      <Text style={{ color: "rgba(255,255,255,0.86)", fontWeight: "700", textTransform: "uppercase", fontSize: 12 }}>
        {label}
      </Text>
      <Text selectable style={{ color: "white", fontSize: 40, fontWeight: "800", fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
    </View>
  );
}

function ResultRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
      <Text style={{ color: colors.text, fontWeight: "600", flex: 1 }}>{label}</Text>
      <Text
        selectable
        style={{
          color: accent ? colors.accent : colors.text,
          fontWeight: "800",
          fontSize: 18,
          fontVariant: ["tabular-nums"],
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function SummaryBox({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        borderRadius: radius.card,
        backgroundColor: accent ? colors.accent : colors.card,
        borderWidth: accent ? 0 : 1,
        borderColor: colors.border,
        ...shadowCard,
      }}
    >
      <Text style={{ color: accent ? "rgba(255,255,255,0.86)" : colors.muted, fontWeight: "700", fontSize: 12 }}>
        {label}
      </Text>
      <Text style={{ color: accent ? "white" : colors.text, fontWeight: "800", fontSize: 24 }}>{value}</Text>
    </View>
  );
}

function LabeledNumberInput({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: string;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={eyebrowStyle}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          style={[
            heroInputStyle,
            {
              flex: 1,
              minWidth: 0,
              fontSize: 26,
              paddingVertical: 12,
            },
          ]}
        />
        <Text style={{ width: 42, textAlign: "right", fontWeight: "700", color: colors.muted }}>{suffix}</Text>
      </View>
    </View>
  );
}

function RatioInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={{ flex: 1, gap: 8 }}>
      <Text style={eyebrowStyle}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} keyboardType="decimal-pad" style={smallInputStyle} />
    </View>
  );
}

function NumberInputCard({
  label,
  value,
  onChange,
  accent = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  accent?: boolean;
}) {
  return (
    <View style={{ flex: 1, gap: 8 }}>
      <Text style={eyebrowStyle}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        style={[
          heroInputStyle,
          {
            backgroundColor: accent ? colors.accentSoft : colors.cardMuted,
            color: accent ? colors.accent : colors.text,
          },
        ]}
      />
    </View>
  );
}

function PanDimensionInputs({
  primaryLabel,
  secondaryLabel,
  primaryValue,
  secondaryValue,
  onPrimaryChange,
  onSecondaryChange,
  showSecondary,
  accent = false,
}: {
  primaryLabel: string;
  secondaryLabel?: string;
  primaryValue: string;
  secondaryValue: string;
  onPrimaryChange: (value: string) => void;
  onSecondaryChange: (value: string) => void;
  showSecondary: boolean;
  accent?: boolean;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={eyebrowStyle}>{showSecondary ? `${primaryLabel} x ${secondaryLabel}` : primaryLabel}</Text>
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <TextInput
          value={primaryValue}
          onChangeText={onPrimaryChange}
          keyboardType="decimal-pad"
          style={[
            smallInputStyle,
            {
              flex: 1,
              backgroundColor: accent ? colors.accentSoft : colors.cardMuted,
              color: accent ? colors.accent : colors.text,
            },
          ]}
        />
        {showSecondary ? <Text style={{ color: colors.faint, fontWeight: "700" }}>x</Text> : null}
        {showSecondary ? (
          <TextInput
            value={secondaryValue}
            onChangeText={onSecondaryChange}
            keyboardType="decimal-pad"
            style={[
              smallInputStyle,
              {
                flex: 1,
                backgroundColor: accent ? colors.accentSoft : colors.cardMuted,
                color: accent ? colors.accent : colors.text,
              },
            ]}
          />
        ) : null}
      </View>
    </View>
  );
}

function getPanLabels(shape: string) {
  if (shape === "round") {
    return { primary: "Diameter" };
  }
  if (shape === "square") {
    return { primary: "Side" };
  }
  if (shape === "oval") {
    return { primary: "Width", secondary: "Height" };
  }
  return { primary: "Width", secondary: "Length" };
}
