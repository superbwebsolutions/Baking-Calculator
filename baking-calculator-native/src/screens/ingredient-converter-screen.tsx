import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { ScreenScroll } from "@/src/components/screen-scroll";
import { SelectField } from "@/src/components/select-field";
import { INGREDIENTS, UNITS, convertIngredient } from "@/src/lib/baking-data";
import { colors, radius, shadowCard } from "@/src/lib/theme";
import { parseNumber } from "@/src/lib/utils";

const ingredientOptions = INGREDIENTS.map((ingredient) => ({
  label: ingredient.name,
  value: ingredient.id,
}));

const unitOptions = UNITS.map((unit) => ({
  label: unit.name,
  value: unit.id,
}));

export function IngredientConverterScreen() {
  const [ingredientId, setIngredientId] = useState(INGREDIENTS[0].id);
  const [inputAmount, setInputAmount] = useState("1");
  const [fromUnit, setFromUnit] = useState("cup");
  const [toUnit, setToUnit] = useState("oz");

  const amount = parseNumber(inputAmount);
  const result = convertIngredient(amount, fromUnit, toUnit, ingredientId);
  const formatted = result === 0 ? "0" : parseFloat(result.toFixed(2)).toString();

  const otherUnits = useMemo(
    () => UNITS.filter((unit) => unit.id !== fromUnit && unit.id !== toUnit),
    [fromUnit, toUnit]
  );

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setInputAmount(formatted);
  };

  return (
    <ScreenScroll>
      <SelectField
        title="Choose Ingredient"
        label="Ingredient"
        options={ingredientOptions}
        value={ingredientId}
        onChange={setIngredientId}
      />

      <View
        style={{
          gap: 14,
          padding: 18,
          borderRadius: radius.card,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadowCard,
        }}
      >
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: colors.faint, textTransform: "uppercase" }}>
            From
          </Text>
          <TextInput
            value={inputAmount}
            onChangeText={setInputAmount}
            keyboardType="decimal-pad"
            placeholder="0"
            style={{
              borderRadius: radius.input,
              backgroundColor: colors.cardMuted,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 16,
              fontSize: 30,
              fontWeight: "800",
              color: colors.text,
            }}
          />
          <SelectField title="From Unit" options={unitOptions} value={fromUnit} onChange={setFromUnit} />
        </View>

        <Pressable
          onPress={handleSwap}
          style={{
            alignSelf: "center",
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: colors.accent,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SymbolView name={"arrow.up.arrow.down" as never} size={18} tintColor={"white"} />
        </Pressable>

        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: colors.faint, textTransform: "uppercase" }}>
            To
          </Text>
          <View
            style={{
              borderRadius: radius.input,
              backgroundColor: colors.accentSoft,
              paddingHorizontal: 16,
              paddingVertical: 18,
            }}
          >
            <Text
              selectable
              style={{ fontSize: 30, fontWeight: "800", color: colors.accent, fontVariant: ["tabular-nums"] }}
            >
              {formatted}
            </Text>
          </View>
          <SelectField title="To Unit" options={unitOptions} value={toUnit} onChange={setToUnit} />
        </View>
      </View>

      <View
        style={{
          gap: 12,
          padding: 18,
          borderRadius: radius.card,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadowCard,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "700", color: colors.faint, textTransform: "uppercase" }}>
          Also Equals
        </Text>
        {otherUnits.map((unit) => {
          const otherResult = convertIngredient(amount, fromUnit, unit.id, ingredientId);
          const value = otherResult === 0 ? "0" : parseFloat(otherResult.toFixed(2)).toString();

          return (
            <View
              key={unit.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 8,
              }}
            >
              <Text selectable style={{ fontSize: 24, fontWeight: "800", color: colors.text }}>
                {value}
              </Text>
              <Text style={{ color: colors.muted, fontWeight: "600" }}>{unit.name}</Text>
            </View>
          );
        })}
      </View>
    </ScreenScroll>
  );
}
