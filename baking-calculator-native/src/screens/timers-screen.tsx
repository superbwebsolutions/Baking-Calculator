import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { ScreenScroll } from "@/src/components/screen-scroll";
import { triggerStrongHaptic } from "@/src/lib/haptics";
import { colors, radius, shadowCard } from "@/src/lib/theme";
import { useTimers } from "@/src/lib/timer-context";
import { formatTime, parseNumber } from "@/src/lib/utils";

const presets = [
  { label: "Autolyse", minutes: 30 },
  { label: "Fold", minutes: 45 },
  { label: "Proof", minutes: 120 },
  { label: "Bake", minutes: 40 },
];

export function TimersScreen() {
  const { timers, addTimer, removeTimer, toggleTimer, resetTimer } = useTimers();
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("Bake");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("30");
  const [seconds, setSeconds] = useState("0");

  const createTimer = () => {
    const totalSeconds = parseNumber(hours) * 3600 + parseNumber(minutes) * 60 + parseNumber(seconds);
    if (totalSeconds <= 0) return;
    triggerStrongHaptic();
    addTimer(label, totalSeconds);
    setShowForm(false);
    setLabel("Bake");
    setHours("0");
    setMinutes("30");
    setSeconds("0");
  };

  return (
    <ScreenScroll>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
        <Pressable
          onPress={() => setShowForm((current) => !current)}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: colors.accent,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 28, lineHeight: 30 }}>{showForm ? "x" : "+"}</Text>
        </Pressable>
      </View>

      {showForm ? (
        <View style={cardStyle}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>New Timer</Text>
          <TextInput value={label} onChangeText={setLabel} placeholder="Label" style={inputStyle} />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TimerInput label="Hours" value={hours} onChange={setHours} />
            <TimerInput label="Mins" value={minutes} onChange={setMinutes} />
            <TimerInput label="Secs" value={seconds} onChange={setSeconds} />
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {presets.map((preset) => (
              <Pressable
                key={preset.label}
                onPress={() => {
                  setLabel(preset.label);
                  setHours(Math.floor(preset.minutes / 60).toString());
                  setMinutes((preset.minutes % 60).toString());
                  setSeconds("0");
                }}
                style={{
                  borderRadius: 14,
                  backgroundColor: colors.cardMuted,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ fontWeight: "700", color: colors.text }}>{preset.label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={createTimer}
            style={{
              borderRadius: radius.input,
              backgroundColor: colors.accent,
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>Add Timer</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={{ gap: 14 }}>
        {timers.map((timer) => {
          const progress = timer.duration > 0 ? ((timer.duration - timer.remaining) / timer.duration) * 100 : 0;
          return (
            <View key={timer.id} style={cardStyle}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>{timer.label}</Text>
                <Pressable onPress={() => void removeTimer(timer.id)}>
                  <Text style={{ color: colors.danger, fontWeight: "700" }}>Delete</Text>
                </Pressable>
              </View>

              <Text
                selectable
                style={{
                  fontSize: 40,
                  fontWeight: "800",
                  color: timer.remaining === 0 ? colors.danger : colors.text,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {formatTime(timer.remaining)}
              </Text>

              <View
                style={{
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: colors.cardMuted,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${Math.min(100, Math.max(0, progress))}%`,
                    height: "100%",
                    backgroundColor: colors.accent,
                  }}
                />
              </View>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <ActionButton title="Reset" onPress={() => void resetTimer(timer.id)} tone="muted" />
                <ActionButton
                  title={timer.isRunning ? "Pause" : "Start"}
                  onPress={() => {
                    if (!timer.isRunning) {
                      triggerStrongHaptic();
                    }
                    void toggleTimer(timer.id);
                  }}
                  tone={timer.isRunning ? "warning" : "accent"}
                />
              </View>
            </View>
          );
        })}
      </View>
    </ScreenScroll>
  );
}

function TimerInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Text style={{ fontSize: 12, fontWeight: "700", color: colors.faint, textTransform: "uppercase" }}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} keyboardType="number-pad" style={inputStyle} />
    </View>
  );
}

function ActionButton({
  title,
  onPress,
  tone,
}: {
  title: string;
  onPress: () => void;
  tone: "accent" | "warning" | "muted";
}) {
  const backgroundColor =
    tone === "accent" ? colors.accent : tone === "warning" ? "#F59E0B" : colors.cardMuted;
  const textColor = tone === "muted" ? colors.text : "#FFFFFF";

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        borderRadius: radius.input,
        backgroundColor,
        paddingVertical: 12,
      }}
    >
      <Text style={{ color: textColor, fontWeight: "700" }}>{title}</Text>
    </Pressable>
  );
}

const cardStyle = {
  gap: 14,
  padding: 18,
  borderRadius: radius.card,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadowCard,
};

const inputStyle = {
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
