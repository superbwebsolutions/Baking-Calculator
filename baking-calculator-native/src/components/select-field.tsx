import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { OptionSheet, type OptionItem } from "@/src/components/option-sheet";
import { colors, radius } from "@/src/lib/theme";

interface SelectFieldProps {
  label?: string;
  placeholder?: string;
  options: OptionItem[];
  value: string;
  onChange: (value: string) => void;
  title: string;
  compact?: boolean;
}

export function SelectField({
  label,
  placeholder = "Select...",
  options,
  value,
  onChange,
  title,
  compact = false,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label ?? placeholder,
    [options, placeholder, value]
  );

  return (
    <>
      <View style={{ gap: 8 }}>
        {label ? (
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.faint, textTransform: "uppercase" }}>
            {label}
          </Text>
        ) : null}
        <Pressable
          onPress={() => setOpen(true)}
          style={{
            borderRadius: radius.input,
            backgroundColor: colors.cardMuted,
            borderWidth: 1.5,
            borderColor: colors.text,
            paddingHorizontal: compact ? 12 : 16,
            paddingVertical: compact ? 12 : 14,
            minHeight: compact ? 46 : undefined,
            justifyContent: "center",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              color: value ? colors.text : colors.faint,
              fontWeight: "600",
              fontSize: compact ? 14 : 16,
            }}
          >
            {selectedLabel}
          </Text>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: compact ? 14 : 16 }}>v</Text>
        </Pressable>
      </View>
      <OptionSheet
        title={title}
        visible={open}
        options={options}
        selectedValue={value}
        onClose={() => setOpen(false)}
        onSelect={onChange}
      />
    </>
  );
}
