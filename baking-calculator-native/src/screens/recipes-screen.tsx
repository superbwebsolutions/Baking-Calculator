import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { OptionSheet } from "@/src/components/option-sheet";
import { ScreenScroll } from "@/src/components/screen-scroll";
import { SelectField } from "@/src/components/select-field";
import { UNITS } from "@/src/lib/baking-data";
import {
  DEFAULT_RECIPES,
  type Recipe,
  type RecipeIngredient,
  useRecipes,
} from "@/src/lib/recipe-context";
import { colors, radius, shadowCard } from "@/src/lib/theme";
import { createId } from "@/src/lib/utils";

const unitOptions = UNITS.map((unit) => ({ label: unit.short, value: unit.id }));
const getUnitShort = (unitId: string) => UNITS.find((unit) => unit.id === unitId)?.short ?? unitId;

const createMenuOptions = [
  { label: "Custom Recipe", value: "blank" },
  ...DEFAULT_RECIPES.map((recipe) => ({ label: `Template: ${recipe.name}`, value: recipe.id })),
];

export function RecipesScreen() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  const startBlankRecipe = () => {
    setEditingRecipe({
      id: "",
      name: "",
      yieldAmount: "1 batch",
      ingredients: [{ id: createId("ingredient"), amount: "1", unit: "cup", name: "" }],
    });
  };

  const startTemplateRecipe = (templateId: string) => {
    const recipe = DEFAULT_RECIPES.find((item) => item.id === templateId);
    if (!recipe) return;

    setEditingRecipe({
      ...recipe,
      id: "",
      ingredients: recipe.ingredients.map((ingredient) => ({
        ...ingredient,
        id: createId("ingredient"),
      })),
    });
  };

  const saveRecipe = () => {
    if (!editingRecipe) return;

    const payload = {
      name: editingRecipe.name.trim() || "Untitled Recipe",
      yieldAmount: editingRecipe.yieldAmount.trim() || "1 batch",
      ingredients: editingRecipe.ingredients.filter(
        (ingredient) => ingredient.name.trim() || ingredient.amount.trim() || ingredient.unit.trim()
      ),
    };

    if (editingRecipe.id) {
      updateRecipe(editingRecipe.id, payload);
    } else {
      addRecipe(payload);
    }

    setEditingRecipe(null);
  };

  if (editingRecipe) {
    return (
      <ScreenScroll>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 32, fontWeight: "800", color: colors.text }}>
            {editingRecipe.id ? "Edit Recipe" : "New Recipe"}
          </Text>
          <Pressable onPress={() => setEditingRecipe(null)}>
            <Text style={{ color: colors.muted, fontWeight: "700" }}>Cancel</Text>
          </Pressable>
        </View>

        <View style={cardStyle}>
          <FieldLabel>Name</FieldLabel>
          <TextInput
            value={editingRecipe.name}
            onChangeText={(value) => setEditingRecipe({ ...editingRecipe, name: value })}
            placeholder="Recipe name"
            style={recipeInputStyle}
          />
          <FieldLabel>Yield</FieldLabel>
          <TextInput
            value={editingRecipe.yieldAmount}
            onChangeText={(value) => setEditingRecipe({ ...editingRecipe, yieldAmount: value })}
            placeholder="Yield"
            style={recipeInputStyle}
          />

          <View style={{ gap: 10 }}>
            {editingRecipe.ingredients.map((ingredient) => (
              <IngredientEditorRow
                key={ingredient.id}
                ingredient={ingredient}
                onChange={(next) =>
                  setEditingRecipe({
                    ...editingRecipe,
                    ingredients: editingRecipe.ingredients.map((item) =>
                      item.id === ingredient.id ? next : item
                    ),
                  })
                }
                onRemove={() =>
                  setEditingRecipe({
                    ...editingRecipe,
                    ingredients: editingRecipe.ingredients.filter((item) => item.id !== ingredient.id),
                  })
                }
              />
            ))}
          </View>

          <Pressable
            onPress={() =>
              setEditingRecipe({
                ...editingRecipe,
                ingredients: [
                  ...editingRecipe.ingredients,
                  { id: createId("ingredient"), amount: "", unit: "g", name: "" },
                ],
              })
            }
            style={secondaryButton}
          >
            <Text style={{ color: colors.text, fontWeight: "700" }}>Add Ingredient</Text>
          </Pressable>

          <Pressable onPress={saveRecipe} style={primaryButton}>
            <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>Save Recipe</Text>
          </Pressable>
        </View>
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <Pressable onPress={() => setCreateMenuOpen(true)} style={primaryButton}>
        <Text style={{ color: "white", fontWeight: "700" }}>New Recipe</Text>
      </Pressable>

      <OptionSheet
        title="Create Recipe"
        visible={createMenuOpen}
        options={createMenuOptions}
        onClose={() => setCreateMenuOpen(false)}
        onSelect={(value) => {
          if (value === "blank") {
            startBlankRecipe();
            return;
          }
          startTemplateRecipe(value);
        }}
      />

      <View style={{ gap: 14 }}>
        {recipes.map((recipe) => {
          const isExpanded = expandedRecipeId === recipe.id;

          return (
            <View key={recipe.id} style={cardStyle}>
              <Pressable
                onPress={() => setExpandedRecipeId((current) => (current === recipe.id ? null : recipe.id))}
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>{recipe.name}</Text>
                  <Text style={{ color: colors.muted }}>
                    Yield: {recipe.yieldAmount} - {recipe.ingredients.length} ingredients
                  </Text>
                </View>
                <Text style={{ color: colors.faint, fontSize: 22, fontWeight: "700" }}>{isExpanded ? "v" : ">"}</Text>
              </Pressable>

              {isExpanded ? (
                <>
                  <View style={{ gap: 8 }}>
                    {recipe.ingredients.map((ingredient) => (
                      <View
                        key={ingredient.id}
                        style={{ flexDirection: "row", justifyContent: "space-between", gap: 16 }}
                      >
                        <Text style={{ color: colors.text, flex: 1 }}>{ingredient.name || "Unnamed ingredient"}</Text>
                        <Text style={{ color: colors.muted, fontWeight: "600" }}>
                          {ingredient.amount} {getUnitShort(ingredient.unit)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <Pressable onPress={() => setEditingRecipe(recipe)} style={[secondaryButton, { flex: 1 }]}>
                      <Text style={{ color: colors.text, fontWeight: "700" }}>Edit</Text>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/calculators/recipe-scaler",
                          params: { recipeId: recipe.id },
                        })
                      }
                      style={[secondaryButton, { flex: 1 }]}
                    >
                      <Text style={{ color: colors.text, fontWeight: "700" }}>Scale</Text>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        Alert.alert("Delete recipe?", recipe.name, [
                          { text: "Cancel", style: "cancel" },
                          { text: "Delete", style: "destructive", onPress: () => deleteRecipe(recipe.id) },
                        ])
                      }
                      style={[secondaryButton, { paddingHorizontal: 18 }]}
                    >
                      <Text style={{ color: colors.danger, fontWeight: "700" }}>Delete</Text>
                    </Pressable>
                  </View>
                </>
              ) : null}
            </View>
          );
        })}
      </View>
    </ScreenScroll>
  );
}

function IngredientEditorRow({
  ingredient,
  onChange,
  onRemove,
}: {
  ingredient: RecipeIngredient;
  onChange: (ingredient: RecipeIngredient) => void;
  onRemove: () => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
        <View style={{ flex: 0.28, gap: 6 }}>
          <FieldLabel>Qty</FieldLabel>
          <TextInput
            value={ingredient.amount}
            onChangeText={(value) => onChange({ ...ingredient, amount: value })}
            placeholder="Qty"
            keyboardType="decimal-pad"
            style={recipeInputStyle}
          />
        </View>
        <View style={{ flex: 0.34, gap: 6 }}>
          <FieldLabel>Unit</FieldLabel>
          <SelectField
            title="Choose Unit"
            options={unitOptions}
            value={ingredient.unit}
            onChange={(value) => onChange({ ...ingredient, unit: value })}
            compact
          />
        </View>
        <View style={{ flex: 0.38, gap: 6 }}>
          <FieldLabel>Action</FieldLabel>
          <Pressable onPress={onRemove} style={secondaryButton}>
            <Text style={{ color: colors.danger, fontWeight: "700", textAlign: "center" }}>Remove</Text>
          </Pressable>
        </View>
      </View>
      <FieldLabel>Ingredient</FieldLabel>
      <TextInput
        value={ingredient.name}
        onChangeText={(value) => onChange({ ...ingredient, name: value })}
        placeholder="Ingredient name"
        style={recipeInputStyle}
      />
    </View>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <Text style={{ fontSize: 12, fontWeight: "700", color: colors.faint, textTransform: "uppercase" }}>
      {children}
    </Text>
  );
}

const cardStyle = {
  gap: 12,
  padding: 18,
  borderRadius: radius.card,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadowCard,
};

const recipeInputStyle = {
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

const primaryButton = {
  borderRadius: radius.input,
  backgroundColor: colors.accent,
  paddingVertical: 14,
  alignItems: "center" as const,
};

const secondaryButton = {
  borderRadius: radius.input,
  backgroundColor: colors.cardMuted,
  paddingVertical: 12,
  paddingHorizontal: 14,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};
