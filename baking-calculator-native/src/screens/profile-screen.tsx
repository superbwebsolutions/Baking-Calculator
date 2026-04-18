import { Image, Linking, Pressable, Text, View } from "react-native";

import { ScreenScroll } from "@/src/components/screen-scroll";
import { colors, radius, shadowCard } from "@/src/lib/theme";

const items = [
  {
    label: "Privacy Policy",
    url: "https://bakeit-privacy.carrd.co/",
  },
  {
    label: "Terms of Service",
    url: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
  },
  {
    label: "Contact Support",
    url: "mailto:sayurnaracontact@gmail.com",
  },
];

export function ProfileScreen() {
  return (
    <ScreenScroll>
      <View style={cardStyle}>
        {items.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => {
              void Linking.openURL(item.url);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingVertical: 12,
              borderBottomWidth: item === items[items.length - 1] ? 0 : 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ flex: 1, fontWeight: "700", color: colors.text }}>{item.label}</Text>
            <Text style={{ color: colors.faint, fontSize: 22 }}>{">"}</Text>
          </Pressable>
        ))}
      </View>

      <View style={cardStyle}>
        <View style={{ alignItems: "center", gap: 12, paddingVertical: 8 }}>
          <Image
            source={require("../../assets/icon.png")}
            resizeMode="contain"
            style={{
              width: 88,
              height: 88,
              borderRadius: 20,
            }}
          />
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>Bake-It</Text>
            <Text style={{ color: colors.muted, textAlign: "center", lineHeight: 20 }}>
              Baking calculators and widget tools in one place.
            </Text>
          </View>
        </View>
      </View>
    </ScreenScroll>
  );
}

const cardStyle = {
  gap: 8,
  padding: 18,
  borderRadius: radius.card,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadowCard,
};
