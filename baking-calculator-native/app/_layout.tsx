import "expo-sqlite/localStorage/install";

import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { addUserInteractionListener } from "expo-widgets";

import { RecipeProvider } from "@/src/lib/recipe-context";
import { TimerProvider } from "@/src/lib/timer-context";
import { updateDDTWidget, DEFAULT_DDT_DATA, type DDTWidgetData, getDDTState } from "@/src/lib/widget-bridge";

export default function RootLayout() {
  useEffect(() => {
    // Load persisted state on app start
    const syncWidget = async () => {
      const ddtState = await getDDTState();
      updateDDTWidget(ddtState);
    };

    syncWidget();

    const subscription = addUserInteractionListener(async (event) => {
      const action = event.target;
      const current = await getDDTState();
      
      console.log("Widget interaction:", action);

      if (action === "toggle-unit") {
        current.unit = current.unit === "F" ? "C" : "F";
      } else if (action === "inc-room") {
        current.room += 1;
      } else if (action === "dec-room") {
        current.room -= 1;
      } else if (action === "inc-flour") {
        current.flour += 1;
      } else if (action === "dec-flour") {
        current.flour -= 1;
      }

      // Sync updated state back to the widget and storage
      updateDDTWidget(current);
    });

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TimerProvider>
        <RecipeProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="calculators/[slug]"
              options={{ headerBackButtonDisplayMode: "minimal" }}
            />
          </Stack>
        </RecipeProvider>
      </TimerProvider>
    </GestureHandlerRootView>
  );
}
