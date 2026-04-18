import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

import { ScreenScroll } from "@/src/components/screen-scroll";
import { triggerLightHaptic } from "@/src/lib/haptics";
import { HOME_TOOLS } from "@/src/lib/tools";
import { colors, radius, shadowCard } from "@/src/lib/theme";

const widgetSteps = [
  {
    text: "Press and hold your Home Screen, then tap Edit.",
    image: require("../../assets/widget-instructions/add-widget.jpg"),
    imageHeight: 132,
  },
  {
    text: "Tap Add Widget and search for Bake-It.",
    image: require("../../assets/widget-instructions/choose-bakeit.jpg"),
    imageHeight: 210,
  },
  {
    text: "Choose the Bake-It widget and tap Add Widget.",
  },
];

export function HomeScreen() {
  const [showWidgetSteps, setShowWidgetSteps] = useState(false);

  return (
    <ScreenScroll>
      <View style={{ gap: 14 }}>
        <View
          style={{
            borderRadius: radius.card,
            backgroundColor: "#2C2C2E",
            borderWidth: 1,
            borderColor: "#3A3A3C",
            overflow: "hidden",
            ...shadowCard,
          }}
        >
          <Pressable
            onPress={() => setShowWidgetSteps((current) => !current)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: colors.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SymbolView name={"square.grid.2x2.fill" as never} size={18} tintColor="white" />
            </View>

            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ color: "white", fontSize: 16, fontWeight: "900" }}>Bake-It Widget</Text>
              <Text style={{ color: "#C7C7CC", fontSize: 13, fontWeight: "600", lineHeight: 18 }}>
                Add it to your Home Screen in a few quick steps.
              </Text>
            </View>

            <View
              style={{
                minWidth: 96,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: colors.accent,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 13, fontWeight: "800" }}>
                {showWidgetSteps ? "Hide Steps" : "Add Widget"}
              </Text>
            </View>
          </Pressable>

          {showWidgetSteps ? (
            <View
              style={{
                gap: 10,
                paddingHorizontal: 16,
                paddingBottom: 16,
                paddingTop: 2,
                borderTopWidth: 1,
                borderTopColor: "#3A3A3C",
              }}
            >
              {widgetSteps.map((step, index) => (
                <View
                  key={step.text}
                  style={{
                    gap: 12,
                    padding: 12,
                    borderRadius: 16,
                    backgroundColor: "#3A3A3C",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: colors.accent,
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 1,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 12, fontWeight: "900" }}>{index + 1}</Text>
                    </View>
                    <Text style={{ flex: 1, color: "white", fontSize: 14, fontWeight: "600", lineHeight: 20 }}>
                      {step.text}
                    </Text>
                  </View>

                  {step.image ? (
                    <Image
                      source={step.image}
                      resizeMode="contain"
                      style={{
                        width: "100%",
                        height: step.imageHeight,
                        borderRadius: 14,
                        backgroundColor: "#1F1F22",
                      }}
                    />
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {HOME_TOOLS.map((tool) => (
          <Pressable
            key={tool.id}
            onPress={() => {
              triggerLightHaptic();
              router.push(tool.route as never);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              padding: 16,
              borderRadius: radius.card,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadowCard,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: colors.cardMuted,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <SymbolView name={tool.symbol as never} size={26} tintColor={colors.text} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.accent }}>{tool.title}</Text>
              <Text style={{ color: colors.muted, lineHeight: 20 }}>{tool.description}</Text>
            </View>
            <Text style={{ color: colors.faint, fontSize: 24 }}>{">"}</Text>
          </Pressable>
        ))}
      </View>
    </ScreenScroll>
  );
}
