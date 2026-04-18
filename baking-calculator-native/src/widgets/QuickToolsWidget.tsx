import { HStack, Text, VStack } from "@expo/ui/swift-ui";
import { font, foregroundStyle, padding } from "@expo/ui/swift-ui/modifiers";
import { createWidget } from "expo-widgets";

import { getToolById } from "@/src/lib/tools";

type QuickToolsWidgetProps = {
  toolIds: string[];
};

const QuickTools = (props: QuickToolsWidgetProps) => {
  "widget";

  const tools = props.toolIds
    .map((toolId) => getToolById(toolId))
    .filter((tool): tool is NonNullable<ReturnType<typeof getToolById>> => Boolean(tool));

  return (
    <VStack modifiers={[padding({ all: 14 })]}>
      <Text modifiers={[font({ weight: "bold", size: 16 }), foregroundStyle("#111111")]}>
        Quick Tools
      </Text>
      {tools.slice(0, 4).map((tool) => (
        <HStack key={tool.id}>
          <Text modifiers={[font({ size: 13 }), foregroundStyle("#111111")]}>
            {tool.title}
          </Text>
        </HStack>
      ))}
      {tools.length === 0 ? (
        <Text modifiers={[font({ size: 12 }), foregroundStyle("#6B7280")]}>
          Choose your favorite Bake-It tools in the app.
        </Text>
      ) : null}
    </VStack>
  );
};

export default createWidget("QuickToolsWidget", QuickTools);
