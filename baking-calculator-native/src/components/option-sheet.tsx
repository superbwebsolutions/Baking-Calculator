import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { colors, radius, shadowCard } from "@/src/lib/theme";

export interface OptionItem {
  label: string;
  value: string;
}

interface OptionSheetProps {
  title: string;
  visible: boolean;
  options: OptionItem[];
  selectedValue?: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}

export function OptionSheet({
  title,
  visible,
  options,
  selectedValue,
  onClose,
  onSelect,
}: OptionSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.35)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{
            maxHeight: "72%",
            backgroundColor: colors.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 20,
            gap: 16,
            ...shadowCard,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>{title}</Text>
            <Pressable onPress={onClose}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.accent }}>Done</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 12 }}>
            {options.map((option) => {
              const selected = option.value === selectedValue;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  style={{
                    borderRadius: radius.input,
                    borderWidth: 1,
                    borderColor: selected ? colors.accent : colors.border,
                    backgroundColor: selected ? colors.accentSoft : colors.card,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                >
                  <Text
                    style={{
                      color: selected ? colors.accent : colors.text,
                      fontWeight: selected ? "700" : "600",
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
