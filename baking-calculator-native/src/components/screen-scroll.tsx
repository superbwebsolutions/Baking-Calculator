import { ScrollView, type ScrollViewProps, type ViewStyle } from "react-native";

import { colors } from "@/src/lib/theme";

interface ScreenScrollProps extends ScrollViewProps {
  gap?: number;
  padded?: boolean;
}

export function ScreenScroll({
  children,
  contentContainerStyle,
  gap = 16,
  padded = true,
  ...props
}: ScreenScrollProps) {
  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: colors.background }, props.style]}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        {
          gap,
          paddingHorizontal: padded ? 20 : 0,
          paddingTop: padded ? 20 : 0,
          paddingBottom: padded ? 36 : 0,
        } satisfies ViewStyle,
        contentContainerStyle,
      ]}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
