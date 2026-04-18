import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { NativeTabs } from "expo-router/unstable-native-tabs";

import { triggerMediumHaptic } from "@/src/lib/haptics";
import { colors } from "@/src/lib/theme";

export default function TabLayout() {
  return (
    <NativeTabs
      backgroundColor="#000000"
      blurEffect="none"
      disableTransparentOnScrollEdge
      iconColor={{ default: "#FFFFFF", selected: colors.accent }}
      labelStyle={{
        default: { color: "#FFFFFF" },
        selected: { color: colors.accent },
      }}
      tintColor={colors.accent}
      shadowColor="#000000"
    >
      <NativeTabs.Trigger name="index" listeners={{ tabPress: triggerMediumHaptic }}>
        <NativeTabs.Trigger.Icon src={<NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="home-filled" />} />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="convert" listeners={{ tabPress: triggerMediumHaptic }}>
        <NativeTabs.Trigger.Icon src={<NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="swap-horiz" />} />
        <NativeTabs.Trigger.Label>Convert</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="recipes" listeners={{ tabPress: triggerMediumHaptic }}>
        <NativeTabs.Trigger.Icon src={<NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="menu-book" />} />
        <NativeTabs.Trigger.Label>Recipes</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" listeners={{ tabPress: triggerMediumHaptic }}>
        <NativeTabs.Trigger.Icon src={<NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="person" />} />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
