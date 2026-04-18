import { Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { type ReactNode, useState } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenScroll } from "@/src/components/screen-scroll";
import { PAN_SHAPES } from "@/src/lib/baking-data";
import { colors, radius, shadowCard } from "@/src/lib/theme";
import {
  DEFAULT_WIDGET_STATE,
  WIDGET_CONVERT_INGREDIENTS,
  WIDGET_TOOLS,
  calculateBakersMath,
  calculateDDTWaterTemp,
  calculateLevain,
  calculateOven,
  calculateQuickConvert,
  calculateRecipeScale,
  adjustConvertAmountGram,
  convertAmountPreservingQuantity,
  convertBakersMathUnit,
  convertDDTUnit,
  convertLevainUnit,
  convertRecipeScalerPanUnit,
  getConvertAmountStep,
  formatWidgetWeightOneDecimal,
  formatYeastAmount,
  getPanDimensionLabels,
  getPanShapeLabel,
  getYeastResults,
  toggleDDTMixingMethod,
  type WidgetBakersMathState,
  type WidgetConvertState,
  type WidgetDDTState,
  type WidgetLevainState,
  type WidgetOvenState,
  type WidgetRecipeScalerState,
  type WidgetState,
  type WidgetYeastState,
} from "@/src/lib/widget-tooling";

const { width } = Dimensions.get("window");
const WIDGET_WIDTH = Math.min(width - 40, 390);
const WIDGET_HEIGHT = Math.min(Math.max(WIDGET_WIDTH * 1.02, 340), 430);
const DEGREE_SYMBOL = "\u00B0";
const widgetPalette = {
  shell: "#2C2C2E",
  surface: "#1F1F22",
  raised: "#3A3A3C",
  border: "#4A4A4F",
  text: "#FFFFFF",
  muted: "#C7C7CC",
  faint: "#8E8E93",
  accent: colors.accent,
  accentSoft: "rgba(255, 107, 107, 0.22)",
};

const YEAST_UNITS: WidgetYeastState["unit"][] = ["tsp", "tbsp", "g", "oz"];
const QUICK_CONVERT_UNITS: WidgetConvertState["fromUnitId"][] = ["cup", "tbsp", "tsp", "g", "oz"];

export function WidgetSimulatorScreen() {
  const [widgetState, setWidgetState] = useState(DEFAULT_WIDGET_STATE);

  const updateSection = <K extends Exclude<keyof WidgetState, "activeTool">>(
    key: K,
    updater: (section: WidgetState[K]) => WidgetState[K]
  ) => {
    setWidgetState((current) => ({
      ...current,
      [key]: updater(current[key]),
    }));
  };

  return (
    <ScreenScroll contentContainerStyle={{ alignItems: "center" }}>
      <Stack.Screen options={{ title: "Widget Simulator", headerBackButtonDisplayMode: "minimal" }} />

      <View style={styles.explainer}>
        <Text style={styles.explainerTitle}>Widget-to-App Parity Preview</Text>
        <Text style={styles.explainerText}>
          This simulator now mirrors the same tool lineup as the app and keeps the tool area scrollable so longer
          calculator controls do not get clipped inside the large widget shell.
        </Text>
      </View>

      <View style={styles.widgetShell}>
        <ScrollView
          style={styles.toolScroll}
          contentContainerStyle={styles.toolScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {widgetState.activeTool === "ddt" ? (
            <DDTToolPanel
              state={widgetState.ddt}
              onChange={(updater) => updateSection("ddt", updater)}
            />
          ) : null}
          {widgetState.activeTool === "levain" ? (
            <LevainToolPanel
              state={widgetState.levain}
              onChange={(updater) => updateSection("levain", updater)}
            />
          ) : null}
          {widgetState.activeTool === "yeast" ? (
            <YeastToolPanel
              state={widgetState.yeast}
              onChange={(updater) => updateSection("yeast", updater)}
            />
          ) : null}
          {widgetState.activeTool === "oven" ? (
            <OvenToolPanel
              state={widgetState.oven}
              onChange={(updater) => updateSection("oven", updater)}
            />
          ) : null}
          {widgetState.activeTool === "bakers-math" ? (
            <BakersMathToolPanel
              state={widgetState.bakersMath}
              onChange={(updater) => updateSection("bakersMath", updater)}
            />
          ) : null}
          {widgetState.activeTool === "recipe-scaler" ? (
            <RecipeScalerToolPanel
              state={widgetState.recipeScaler}
              onChange={(updater) => updateSection("recipeScaler", updater)}
            />
          ) : null}
          {widgetState.activeTool === "convert" ? (
            <ConvertToolPanel
              state={widgetState.convert}
              onChange={(updater) => updateSection("convert", updater)}
            />
          ) : null}
        </ScrollView>

        <View style={styles.tabBar}>
          {WIDGET_TOOLS.map((tool) => {
            const active = widgetState.activeTool === tool.id;
            return (
              <Pressable
                key={tool.id}
                onPress={() => setWidgetState((current) => ({ ...current, activeTool: tool.id }))}
                style={styles.tabButton}
              >
                <View style={[styles.tabIconBubble, active && styles.tabIconBubbleActive]}>
                  <SymbolView name={tool.symbol as never} size={14} tintColor={active ? "white" : widgetPalette.muted} />
                </View>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tool.widgetLabel}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScreenScroll>
  );
}

function DDTToolPanel({
  state,
  onChange,
}: {
  state: WidgetDDTState;
  onChange: (updater: (state: WidgetDDTState) => WidgetDDTState) => void;
}) {
  const waterTemp = calculateDDTWaterTemp(state);

  return (
    <ToolSurface
      title="Dough Temp (DDT)"
      subtitle="Water target"
      actions={
        <>
          <PillButton
            label={state.mixingMethod === "machine" ? "Mixer" : "Hand"}
            onPress={() => onChange((current) => toggleDDTMixingMethod(current))}
          />
          <PillButton
            label={`${DEGREE_SYMBOL}${state.unit}`}
            onPress={() => onChange((current) => convertDDTUnit(current, current.unit === "F" ? "C" : "F"))}
          />
        </>
      }
    >
      <HeroValue value={`${Math.round(waterTemp)}${DEGREE_SYMBOL}${state.unit}`} caption="Required water temp" />
      <View style={styles.stepperGrid}>
        <CompactStepperCard
          label="Desired"
          value={`${state.desired}${DEGREE_SYMBOL}${state.unit}`}
          onDecrease={() => onChange((current) => ({ ...current, desired: current.desired - 1 }))}
          onIncrease={() => onChange((current) => ({ ...current, desired: current.desired + 1 }))}
        />
        <CompactStepperCard
          label="Room"
          value={`${state.room}${DEGREE_SYMBOL}${state.unit}`}
          onDecrease={() => onChange((current) => ({ ...current, room: current.room - 1 }))}
          onIncrease={() => onChange((current) => ({ ...current, room: current.room + 1 }))}
        />
        <CompactStepperCard
          label="Flour"
          value={`${state.flour}${DEGREE_SYMBOL}${state.unit}`}
          onDecrease={() => onChange((current) => ({ ...current, flour: current.flour - 1 }))}
          onIncrease={() => onChange((current) => ({ ...current, flour: current.flour + 1 }))}
        />
        <CompactStepperCard
          label="Friction"
          value={`${state.friction}${DEGREE_SYMBOL}${state.unit}`}
          onDecrease={() => onChange((current) => ({ ...current, friction: current.friction - 1 }))}
          onIncrease={() => onChange((current) => ({ ...current, friction: current.friction + 1 }))}
        />
      </View>
    </ToolSurface>
  );
}

function YeastToolPanel({
  state,
  onChange,
}: {
  state: WidgetYeastState;
  onChange: (updater: (state: WidgetYeastState) => WidgetYeastState) => void;
}) {
  const results = getYeastResults(state);
  const amountStep = state.unit === "g" ? 1 : state.unit === "oz" ? 0.25 : 0.25;

  return (
    <ToolSurface
      title="Yeast Converter"
      subtitle="Fresh / ADY / Instant"
      actions={
        <>
          <PillButton
            label={state.unit.toUpperCase()}
            onPress={() => onChange((current) => ({ ...current, unit: cycleValue(YEAST_UNITS, current.unit) }))}
          />
          <PillButton
            label={state.format === "fraction" ? "Frac" : "Dec"}
            onPress={() =>
              onChange((current) => ({
                ...current,
                format: current.format === "fraction" ? "decimal" : "fraction",
              }))
            }
          />
        </>
      }
    >
      <View style={styles.inlineChips}>
        {[
          { id: "fresh", label: "Fresh" },
          { id: "ady", label: "ADY" },
          { id: "instant", label: "Instant" },
        ].map((item) => {
          const active = state.inputType === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onChange((current) => ({ ...current, inputType: item.id as WidgetYeastState["inputType"] }))}
              style={[styles.choiceChip, active && styles.choiceChipActive]}
            >
              <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <StepperRow
        label="Amount"
        value={`${formatCompactNumber(state.amount)} ${state.unit}`}
        onDecrease={() =>
          onChange((current) => ({
            ...current,
            amount: Math.max(0, parseFloat((current.amount - amountStep).toFixed(2))),
          }))
        }
        onIncrease={() =>
          onChange((current) => ({
            ...current,
            amount: parseFloat((current.amount + amountStep).toFixed(2)),
          }))
        }
      />

      <View style={styles.dualHero}>
        {results.map((result) => (
          <MetricHero
            key={result.type}
            label={result.type === "ady" ? "Active Dry" : result.type === "instant" ? "Instant" : "Fresh"}
            value={`${formatYeastAmount(result.value, state.unit, state.format)} ${state.unit}`}
            accent={result.type === "fresh"}
          />
        ))}
      </View>
    </ToolSurface>
  );
}

function OvenToolPanel({
  state,
  onChange,
}: {
  state: WidgetOvenState;
  onChange: (updater: (state: WidgetOvenState) => WidgetOvenState) => void;
}) {
  const { tempC, gasMark } = calculateOven(state.tempF);
  const presets = [325, 350, 375, 400, 450];

  return (
    <ToolSurface title="Oven Temperature" subtitle="F / C / Gas">
      <HeroValue value={`${state.tempF}${DEGREE_SYMBOL}F`} caption={`${tempC}${DEGREE_SYMBOL}C | Gas ${gasMark}`} />
      <StepperRow
        label="Temperature"
        value={`${state.tempF}${DEGREE_SYMBOL}F`}
        onDecrease={() => onChange((current) => ({ ...current, tempF: current.tempF - 25 }))}
        onIncrease={() => onChange((current) => ({ ...current, tempF: current.tempF + 25 }))}
      />
      <View style={styles.inlineChips}>
        {presets.map((preset) => {
          const active = preset === state.tempF;
          return (
            <Pressable
              key={preset}
              onPress={() => onChange((current) => ({ ...current, tempF: preset }))}
              style={[styles.choiceChip, active && styles.choiceChipActive]}
            >
              <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>{preset}{DEGREE_SYMBOL}F</Text>
            </Pressable>
          );
        })}
      </View>
    </ToolSurface>
  );
}

function BakersMathToolPanel({
  state,
  onChange,
}: {
  state: WidgetBakersMathState;
  onChange: (updater: (state: WidgetBakersMathState) => WidgetBakersMathState) => void;
}) {
  const { hydration, saltPct, yeastPct, totalDough } = calculateBakersMath(state);
  const flourStep = state.weightUnit === "g" ? 50 : 2;
  const waterStep = state.weightUnit === "g" ? 25 : 1;
  const smallStep = state.weightUnit === "g" ? 1 : 0.1;

  return (
    <ToolSurface
      title="Baker's Percentage"
      actions={
        <PillButton
          label={state.weightUnit === "g" ? "Metric" : "Imperial"}
          onPress={() => onChange((current) => convertBakersMathUnit(current, current.weightUnit === "g" ? "oz" : "g"))}
        />
      }
    >
      <HeroValue value={`${hydration.toFixed(1)}%`} caption="Flour = 100%" />
      <Text style={styles.summaryNote}>
        Total dough {formatWidgetWeightOneDecimal(totalDough)} {state.weightUnit}
      </Text>
      <View style={styles.dualHero}>
        <MetricHero label="Salt" value={`${saltPct.toFixed(1)}%`} accent />
        <MetricHero label="Yeast" value={`${yeastPct.toFixed(1)}%`} />
      </View>
      <View style={styles.stepperGrid}>
        <CompactStepperCard
          label="Flour"
          value={`${formatWidgetWeightOneDecimal(state.flour)} ${state.weightUnit}`}
          onDecrease={() => onChange((current) => ({ ...current, flour: Math.max(0, current.flour - flourStep) }))}
          onIncrease={() => onChange((current) => ({ ...current, flour: current.flour + flourStep }))}
        />
        <CompactStepperCard
          label="Water"
          value={`${formatWidgetWeightOneDecimal(state.water)} ${state.weightUnit}`}
          onDecrease={() => onChange((current) => ({ ...current, water: Math.max(0, current.water - waterStep) }))}
          onIncrease={() => onChange((current) => ({ ...current, water: current.water + waterStep }))}
        />
        <CompactStepperCard
          label="Salt"
          value={`${formatWidgetWeightOneDecimal(state.salt)} ${state.weightUnit}`}
          onDecrease={() => onChange((current) => ({ ...current, salt: Math.max(0, roundWeight(current.salt - smallStep)) }))}
          onIncrease={() => onChange((current) => ({ ...current, salt: roundWeight(current.salt + smallStep) }))}
        />
        <CompactStepperCard
          label="Yeast"
          value={`${formatWidgetWeightOneDecimal(state.yeast)} ${state.weightUnit}`}
          onDecrease={() =>
            onChange((current) => ({ ...current, yeast: Math.max(0, roundWeight(current.yeast - smallStep)) }))
          }
          onIncrease={() => onChange((current) => ({ ...current, yeast: roundWeight(current.yeast + smallStep) }))}
        />
      </View>
    </ToolSurface>
  );
}

function LevainToolPanel({
  state,
  onChange,
}: {
  state: WidgetLevainState;
  onChange: (updater: (state: WidgetLevainState) => WidgetLevainState) => void;
}) {
  const levain = calculateLevain(state);
  const targetStep = state.unit === "g" ? 10 : 0.5;

  return (
    <ToolSurface
      title="Levain Calculator"
      actions={
        <PillButton
          label={state.unit === "g" ? "Metric" : "Imperial"}
          onPress={() => onChange((current) => convertLevainUnit(current, current.unit === "g" ? "oz" : "g"))}
        />
      }
    >
      <HeroValue
        value={`${formatCompactNumber(state.targetWeight)} ${state.unit}`}
        caption={`Ratio ${state.ratioStarter}:${state.ratioFlour}:${state.ratioWater}`}
      />
      <View style={styles.tripleHero}>
        <MetricHero label="Starter" value={`${formatCompactNumber(levain.starter)} ${state.unit}`} />
        <MetricHero label="Flour" value={`${formatCompactNumber(levain.flour)} ${state.unit}`} />
        <MetricHero label="Water" value={`${formatCompactNumber(levain.water)} ${state.unit}`} accent />
      </View>
      <StepperRow
        label="Target levain"
        value={`${formatCompactNumber(state.targetWeight)} ${state.unit}`}
        onDecrease={() =>
          onChange((current) => ({ ...current, targetWeight: Math.max(0, roundWeight(current.targetWeight - targetStep)) }))
        }
        onIncrease={() => onChange((current) => ({ ...current, targetWeight: roundWeight(current.targetWeight + targetStep) }))}
      />
      <View style={styles.tripleHero}>
        <CompactStepperCard
          label="Starter"
          value={String(state.ratioStarter)}
          onDecrease={() => onChange((current) => ({ ...current, ratioStarter: Math.max(1, current.ratioStarter - 1) }))}
          onIncrease={() => onChange((current) => ({ ...current, ratioStarter: current.ratioStarter + 1 }))}
        />
        <CompactStepperCard
          label="Flour"
          value={String(state.ratioFlour)}
          onDecrease={() => onChange((current) => ({ ...current, ratioFlour: Math.max(1, current.ratioFlour - 1) }))}
          onIncrease={() => onChange((current) => ({ ...current, ratioFlour: current.ratioFlour + 1 }))}
        />
        <CompactStepperCard
          label="Water"
          value={String(state.ratioWater)}
          onDecrease={() => onChange((current) => ({ ...current, ratioWater: Math.max(1, current.ratioWater - 1) }))}
          onIncrease={() => onChange((current) => ({ ...current, ratioWater: current.ratioWater + 1 }))}
        />
      </View>
    </ToolSurface>
  );
}

function RecipeScalerToolPanel({
  state,
  onChange,
}: {
  state: WidgetRecipeScalerState;
  onChange: (updater: (state: WidgetRecipeScalerState) => WidgetRecipeScalerState) => void;
}) {
  const scale = calculateRecipeScale(state);
  const panShapes = PAN_SHAPES.map((shape) => shape.id);
  const originalLabels = getPanDimensionLabels(state.originalShape);
  const newLabels = getPanDimensionLabels(state.newShape);

  return (
    <ToolSurface
      title="Recipe Scaler"
      subtitle={state.mode === "servings" ? "Yield scaling" : "Pan scaling"}
      actions={
        <>
          <PillButton
            label={state.mode === "servings" ? "Servings" : "Pan"}
            onPress={() =>
              onChange((current) => ({
                ...current,
                mode: current.mode === "servings" ? "pan" : "servings",
              }))
            }
          />
          {state.mode === "pan" ? (
            <PillButton
              label={state.panUnit === "in" ? "Inches" : "Centimeters"}
              onPress={() => onChange((current) => convertRecipeScalerPanUnit(current, current.panUnit === "in" ? "cm" : "in"))}
            />
          ) : null}
        </>
      }
    >
      <HeroValue
        value={`${scale.toFixed(2)}x`}
        caption={state.mode === "servings" ? `${state.originalServings} to ${state.newServings} servings` : "Pan area scaling"}
      />

      {state.mode === "servings" ? (
        <View style={styles.stepperGrid}>
          <CompactStepperCard
            label="Original"
            value={String(state.originalServings)}
            onDecrease={() =>
              onChange((current) => ({ ...current, originalServings: Math.max(1, current.originalServings - 1) }))
            }
            onIncrease={() => onChange((current) => ({ ...current, originalServings: current.originalServings + 1 }))}
          />
          <CompactStepperCard
            label="New"
            value={String(state.newServings)}
            onDecrease={() => onChange((current) => ({ ...current, newServings: Math.max(1, current.newServings - 1) }))}
            onIncrease={() => onChange((current) => ({ ...current, newServings: current.newServings + 1 }))}
          />
        </View>
      ) : (
        <>
          <PanConfigCard
            title="Original pan"
            summary={formatPanSummary(state.originalShape, state.originalDim1, state.originalDim2, state.panUnit)}
            shapeLabel={getPanShapeLabel(state.originalShape)}
            onChangeShape={() =>
              onChange((current) => ({ ...current, originalShape: cycleValue(panShapes, current.originalShape) }))
            }
            primaryLabel={`${originalLabels.primary} (${state.panUnit})`}
            primaryValue={formatCompactNumber(state.originalDim1)}
            onDecreasePrimary={() =>
              onChange((current) => ({ ...current, originalDim1: Math.max(1, roundWeight(current.originalDim1 - 1)) }))
            }
            onIncreasePrimary={() => onChange((current) => ({ ...current, originalDim1: roundWeight(current.originalDim1 + 1) }))}
            secondaryLabel={originalLabels.secondary ? `${originalLabels.secondary} (${state.panUnit})` : undefined}
            secondaryValue={originalLabels.secondary ? formatCompactNumber(state.originalDim2) : undefined}
            onDecreaseSecondary={
              originalLabels.secondary
                ? () =>
                    onChange((current) => ({
                      ...current,
                      originalDim2: Math.max(1, roundWeight(current.originalDim2 - 1)),
                    }))
                : undefined
            }
            onIncreaseSecondary={
              originalLabels.secondary
                ? () => onChange((current) => ({ ...current, originalDim2: roundWeight(current.originalDim2 + 1) }))
                : undefined
            }
          />
          <PanConfigCard
            title="New pan"
            summary={formatPanSummary(state.newShape, state.newDim1, state.newDim2, state.panUnit)}
            shapeLabel={getPanShapeLabel(state.newShape)}
            onChangeShape={() => onChange((current) => ({ ...current, newShape: cycleValue(panShapes, current.newShape) }))}
            primaryLabel={`${newLabels.primary} (${state.panUnit})`}
            primaryValue={formatCompactNumber(state.newDim1)}
            onDecreasePrimary={() => onChange((current) => ({ ...current, newDim1: Math.max(1, roundWeight(current.newDim1 - 1)) }))}
            onIncreasePrimary={() => onChange((current) => ({ ...current, newDim1: roundWeight(current.newDim1 + 1) }))}
            secondaryLabel={newLabels.secondary ? `${newLabels.secondary} (${state.panUnit})` : undefined}
            secondaryValue={newLabels.secondary ? formatCompactNumber(state.newDim2) : undefined}
            onDecreaseSecondary={
              newLabels.secondary
                ? () => onChange((current) => ({ ...current, newDim2: Math.max(1, roundWeight(current.newDim2 - 1)) }))
                : undefined
            }
            onIncreaseSecondary={
              newLabels.secondary
                ? () => onChange((current) => ({ ...current, newDim2: roundWeight(current.newDim2 + 1) }))
                : undefined
            }
            accent
          />
        </>
      )}
    </ToolSurface>
  );
}

function ConvertToolPanel({
  state,
  onChange,
}: {
  state: WidgetConvertState;
  onChange: (updater: (state: WidgetConvertState) => WidgetConvertState) => void;
}) {
  const { ingredient, convertedAmount } = calculateQuickConvert(state);

  return (
    <ToolSurface
      title="Ingredient Converter"
      subtitle="Volume to weight"
      actions={
        <PillButton
          label={ingredient.name}
          onPress={() =>
            onChange((current) => ({
              ...current,
              ingredientId: cycleValue(WIDGET_CONVERT_INGREDIENTS.map((item) => item.id), current.ingredientId),
            }))
          }
        />
      }
    >
      <HeroValue
        value={`${formatCompactNumber(convertedAmount)} ${state.toUnitId}`}
        caption={`${formatCompactNumber(state.amount)} ${state.fromUnitId} | ${ingredient.name}`}
      />
      <View style={styles.inlineChips}>
        <PillButton
          label={`From: ${state.fromUnitId}`}
          onPress={() =>
            onChange((current) => {
              const nextFrom = cycleValue(QUICK_CONVERT_UNITS, current.fromUnitId);
              const nextAmount = convertAmountPreservingQuantity(current, nextFrom);
              return {
                ...current,
                fromUnitId: nextFrom,
                amount: Math.max(0, nextAmount),
              };
            })
          }
        />
        <PillButton
          label={`To: ${state.toUnitId}`}
          onPress={() =>
            onChange((current) => ({
              ...current,
              toUnitId: cycleValue(QUICK_CONVERT_UNITS, current.toUnitId),
            }))
          }
        />
      </View>
      <StepperRow
        label="Amount"
        value={`${formatCompactNumber(state.amount)} ${state.fromUnitId}`}
        onDecrease={() =>
          onChange((current) => {
            const step = getConvertAmountStep(current.fromUnitId);
            const next =
              current.fromUnitId === "g"
                ? adjustConvertAmountGram(current.amount, -step)
                : Math.max(0, roundWeight(current.amount - step));
            return { ...current, amount: next };
          })
        }
        onIncrease={() =>
          onChange((current) => {
            const step = getConvertAmountStep(current.fromUnitId);
            const next =
              current.fromUnitId === "g"
                ? adjustConvertAmountGram(current.amount, step)
                : roundWeight(current.amount + step);
            return { ...current, amount: next };
          })
        }
      />
    </ToolSurface>
  );
}

function ToolSurface({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.toolCard}>
      <View style={styles.toolHeader}>
        <View style={{ flex: 1, minWidth: 0, gap: subtitle ? 4 : 0 }}>
          <Text style={styles.toolTitle}>{title}</Text>
          {subtitle ? <Text style={styles.toolSubtitle}>{subtitle}</Text> : null}
        </View>
        {actions ? <View style={styles.toolActions}>{actions}</View> : null}
      </View>
      <View style={styles.toolContent}>{children}</View>
    </View>
  );
}

function HeroValue({ value, caption }: { value: string; caption: string }) {
  return (
    <View style={styles.heroCard}>
      <Text style={styles.heroCaption}>{caption}</Text>
      <Text style={styles.heroText} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function MetricHero({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={[styles.metricHero, accent && styles.metricHeroAccent]}>
      <Text style={[styles.metricHeroLabel, accent && styles.metricHeroLabelAccent]}>{label}</Text>
      <Text style={[styles.metricHeroValue, accent && styles.metricHeroValueAccent]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function MetricCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={[styles.metricCard, accent && styles.metricCardAccent]}>
      <Text style={[styles.metricCardLabel, accent && styles.metricCardLabelAccent]}>{label}</Text>
      <Text style={[styles.metricCardValue, accent && styles.metricCardValueAccent]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function CompactStepperCard({
  label,
  value,
  onDecrease,
  onIncrease,
  accent = false,
}: {
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
  accent?: boolean;
}) {
  return (
    <View style={[styles.compactStepperCard, accent && styles.compactStepperCardAccent]}>
      <Text style={[styles.compactStepperLabel, accent && styles.compactStepperLabelAccent]}>{label}</Text>
      <Text style={styles.compactStepperValue} numberOfLines={1}>
        {value}
      </Text>
      <View style={styles.compactStepperButtons}>
        <CircleButton symbol="minus" onPress={onDecrease} />
        <CircleButton symbol="plus" onPress={onIncrease} />
      </View>
    </View>
  );
}

function StepperRow({
  label,
  value,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={styles.stepperLabel}>{label}</Text>
        <Text style={styles.stepperValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <View style={styles.stepperButtons}>
        <CircleButton symbol="minus" onPress={onDecrease} />
        <CircleButton symbol="plus" onPress={onIncrease} />
      </View>
    </View>
  );
}

function ShapeRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <View style={styles.shapeRow}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.stepperLabel}>{label}</Text>
        <Text style={styles.stepperValue}>{value}</Text>
      </View>
      <PillButton label="Change" onPress={onPress} />
    </View>
  );
}

function PanConfigCard({
  title,
  summary,
  shapeLabel,
  onChangeShape,
  primaryLabel,
  primaryValue,
  onDecreasePrimary,
  onIncreasePrimary,
  secondaryLabel,
  secondaryValue,
  onDecreaseSecondary,
  onIncreaseSecondary,
  accent = false,
}: {
  title: string;
  summary: string;
  shapeLabel: string;
  onChangeShape: () => void;
  primaryLabel: string;
  primaryValue: string;
  onDecreasePrimary: () => void;
  onIncreasePrimary: () => void;
  secondaryLabel?: string;
  secondaryValue?: string;
  onDecreaseSecondary?: () => void;
  onIncreaseSecondary?: () => void;
  accent?: boolean;
}) {
  return (
    <View style={[styles.panConfigCard, accent && styles.panConfigCardAccent]}>
      <View style={styles.panConfigHeader}>
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <Text style={styles.panConfigTitle}>{title}</Text>
          <Text style={styles.panConfigSummary}>{summary}</Text>
        </View>
        <PillButton label={shapeLabel} onPress={onChangeShape} />
      </View>
      <View style={styles.stepperGrid}>
        <CompactStepperCard
          label={primaryLabel}
          value={primaryValue}
          onDecrease={onDecreasePrimary}
          onIncrease={onIncreasePrimary}
          accent={accent}
        />
        {secondaryLabel && secondaryValue && onDecreaseSecondary && onIncreaseSecondary ? (
          <CompactStepperCard
            label={secondaryLabel}
            value={secondaryValue}
            onDecrease={onDecreaseSecondary}
            onIncrease={onIncreaseSecondary}
            accent={accent}
          />
        ) : null}
      </View>
    </View>
  );
}

function PillButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.pillButton}>
      <Text style={styles.pillButtonText} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function CircleButton({ symbol, onPress }: { symbol: "plus" | "minus"; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.circleButton}>
      <SymbolView name={`${symbol}.circle.fill` as never} size={20} tintColor={widgetPalette.accent} />
    </Pressable>
  );
}

function cycleValue<T extends string>(values: T[], current: T) {
  const currentIndex = values.indexOf(current);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % values.length : 0;
  return values[nextIndex];
}

function roundWeight(value: number) {
  return parseFloat(value.toFixed(2));
}

function formatCompactNumber(value: number) {
  return Number.isInteger(value) ? String(value) : parseFloat(value.toFixed(2)).toString();
}

function formatPanSummary(shape: string, dim1: number, dim2: number, unit: string) {
  const labels = getPanDimensionLabels(shape);
  const primary = formatCompactNumber(dim1);
  const secondary = labels.secondary ? ` x ${formatCompactNumber(dim2)}` : "";
  return `${getPanShapeLabel(shape)} ${primary}${secondary} ${unit}`;
}

const styles = StyleSheet.create({
  explainer: {
    width: "100%",
    maxWidth: WIDGET_WIDTH,
    gap: 8,
  },
  explainerTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  explainerText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  widgetShell: {
    width: WIDGET_WIDTH,
    height: WIDGET_HEIGHT,
    backgroundColor: widgetPalette.shell,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: widgetPalette.border,
    ...shadowCard,
  },
  toolScroll: {
    flex: 1,
    backgroundColor: widgetPalette.surface,
  },
  toolScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  toolCard: {
    gap: 10,
  },
  toolHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  toolTitle: {
    color: widgetPalette.text,
    fontSize: 17,
    fontWeight: "800",
  },
  toolSubtitle: {
    color: widgetPalette.muted,
    fontSize: 11,
    lineHeight: 16,
  },
  toolActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 6,
    maxWidth: 140,
  },
  toolContent: {
    gap: 8,
  },
  heroCard: {
    borderRadius: radius.card,
    backgroundColor: widgetPalette.accent,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 3,
  },
  heroCaption: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  heroText: {
    color: "white",
    fontSize: 30,
    fontWeight: "900",
  },
  dualHero: {
    flexDirection: "row",
    gap: 10,
  },
  tripleHero: {
    flexDirection: "row",
    gap: 8,
  },
  metricHero: {
    flex: 1,
    borderRadius: radius.input,
    backgroundColor: widgetPalette.raised,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 3,
  },
  metricHeroAccent: {
    backgroundColor: widgetPalette.accentSoft,
  },
  metricHeroLabel: {
    color: widgetPalette.muted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  metricHeroLabelAccent: {
    color: widgetPalette.accent,
  },
  metricHeroValue: {
    color: widgetPalette.text,
    fontSize: 16,
    fontWeight: "800",
    flexShrink: 1,
  },
  metricHeroValueAccent: {
    color: widgetPalette.text,
  },
  metricCard: {
    borderRadius: radius.input,
    backgroundColor: widgetPalette.raised,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  metricCardAccent: {
    backgroundColor: widgetPalette.accentSoft,
  },
  metricCardLabel: {
    color: widgetPalette.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  metricCardLabelAccent: {
    color: widgetPalette.accent,
  },
  metricCardValue: {
    color: widgetPalette.text,
    fontSize: 15,
    fontWeight: "800",
    flexShrink: 1,
  },
  metricCardValueAccent: {
    color: widgetPalette.text,
  },
  summaryNote: {
    color: widgetPalette.muted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  stepperGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  compactStepperCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: radius.input,
    backgroundColor: widgetPalette.raised,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  compactStepperCardAccent: {
    backgroundColor: widgetPalette.accentSoft,
  },
  compactStepperLabel: {
    color: widgetPalette.muted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  compactStepperLabelAccent: {
    color: widgetPalette.accent,
  },
  compactStepperValue: {
    color: widgetPalette.text,
    fontSize: 15,
    fontWeight: "800",
    flexShrink: 1,
  },
  compactStepperButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radius.input,
    backgroundColor: widgetPalette.raised,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  shapeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radius.input,
    backgroundColor: widgetPalette.raised,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  stepperLabel: {
    color: widgetPalette.muted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  stepperValue: {
    color: widgetPalette.text,
    fontSize: 15,
    fontWeight: "800",
    flexShrink: 1,
  },
  stepperButtons: {
    flexDirection: "row",
    gap: 8,
  },
  pillButton: {
    borderRadius: radius.pill,
    backgroundColor: widgetPalette.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  pillButtonText: {
    color: widgetPalette.text,
    fontSize: 10,
    fontWeight: "800",
  },
  circleButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  choiceChip: {
    borderRadius: radius.pill,
    backgroundColor: widgetPalette.raised,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  choiceChipActive: {
    backgroundColor: widgetPalette.accent,
  },
  choiceChipText: {
    color: widgetPalette.muted,
    fontSize: 10,
    fontWeight: "800",
  },
  choiceChipTextActive: {
    color: "white",
  },
  panConfigCard: {
    gap: 8,
    borderRadius: radius.card,
    backgroundColor: widgetPalette.raised,
    padding: 12,
  },
  panConfigCardAccent: {
    backgroundColor: widgetPalette.accentSoft,
  },
  panConfigHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  panConfigTitle: {
    color: widgetPalette.text,
    fontSize: 14,
    fontWeight: "800",
  },
  panConfigSummary: {
    color: widgetPalette.muted,
    fontSize: 11,
    lineHeight: 16,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 2,
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
    backgroundColor: widgetPalette.surface,
    borderTopWidth: 1,
    borderTopColor: widgetPalette.border,
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  tabLabel: {
    color: widgetPalette.muted,
    fontSize: 8,
    fontWeight: "800",
  },
  tabLabelActive: {
    color: widgetPalette.text,
  },
  tabIconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  tabIconBubbleActive: {
    backgroundColor: widgetPalette.accent,
  },
});
