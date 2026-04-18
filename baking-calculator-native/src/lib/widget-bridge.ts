import { createWidget } from "expo-widgets";
import { type DDTWidgetData, DEFAULT_DDT_DATA, calculateWaterTemp } from "./ddt-logic";

export { type DDTWidgetData, DEFAULT_DDT_DATA, calculateWaterTemp };

// THE HYBRID BRIDGE:
// We use the expo-widgets library's own storage to share data.
// This is 100% stable because the library handles all the App Group permissions.
const ddtWidget = createWidget<DDTWidgetData>("DDTWidget", "NativeDDTLayout" as never);

export async function getDDTState(): Promise<DDTWidgetData> {
  try {
    // We try to read the timeline from the library's storage
    const timeline = await ddtWidget.getTimeline();
    if (timeline && timeline.length > 0) {
      return timeline[0].props as DDTWidgetData;
    }
  } catch (e) {
    console.warn("Failed to read widget timeline, using default state.");
  }
  
  // Fallback to localStorage if library storage is empty
  try {
    const saved = localStorage.getItem("ddt_widget_state");
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  return { ...DEFAULT_DDT_DATA };
}

export async function updateDDTWidget(data: Partial<DDTWidgetData>) {
  try {
    const current = await getDDTState();
    const fullData = { ...current, ...data };
    fullData.target = calculateWaterTemp(fullData);

    // PERSISTENCE 1: LocalStorage for the App
    try {
      localStorage.setItem("ddt_widget_state", JSON.stringify(fullData));
    } catch (e) {}

    // PERSISTENCE 2: Library Storage for the Widget
    // This automatically writes to the App Group UserDefaults
    ddtWidget.updateSnapshot(fullData);
    
    console.log("Widget synced successfully via Library Storage");
  } catch (error) {
    console.error("Failed to sync widget via Library:", error);
  }
}
