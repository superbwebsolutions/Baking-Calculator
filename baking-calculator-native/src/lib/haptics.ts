import * as Haptics from "expo-haptics";

function runHaptic(task: Promise<void>) {
  void task.catch(() => {
    // Ignore unsupported-device and simulator failures.
  });
}

export function triggerLightHaptic() {
  runHaptic(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function triggerMediumHaptic() {
  runHaptic(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export function triggerStrongHaptic() {
  runHaptic(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
}
