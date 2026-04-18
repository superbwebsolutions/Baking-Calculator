import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import * as Notifications from "expo-notifications";
import { Alert, AppState, Linking, type AppStateStatus } from "react-native";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { createId } from "@/src/lib/utils";

export interface BakingTimer {
  id: string;
  label: string;
  duration: number;
  remaining: number;
  isRunning: boolean;
  targetTime: number | null;
}

interface TimerContextType {
  timers: BakingTimer[];
  addTimer: (label: string, duration: number) => void;
  removeTimer: (id: string) => Promise<void>;
  toggleTimer: (id: string) => Promise<void>;
  resetTimer: (id: string) => Promise<void>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);
const TIMER_STORAGE_KEY = "baking_timers";
const TIMER_PERMISSION_EXPLANATION_KEY = "baking_timer_notifications_explained_v1";
const TIMER_ALARM_SOUND_FILENAME = "timer_alarm.wav";
const TIMER_REMINDER_COUNT = 8;
const TIMER_REMINDER_INTERVAL_MS = 30 * 1000;

let foregroundAlarmPlayer: ReturnType<typeof createAudioPlayer> | null = null;
let isForegroundAlarmPlaying = false;

function getForegroundAlarmPlayer() {
  if (!foregroundAlarmPlayer) {
    foregroundAlarmPlayer = createAudioPlayer(require("../../assets/sounds/timer_alarm.wav"), {
      keepAudioSessionActive: true,
    });
    foregroundAlarmPlayer.loop = true;
    foregroundAlarmPlayer.volume = 1;
  }

  return foregroundAlarmPlayer;
}

async function playForegroundAlarm() {
  if (isForegroundAlarmPlaying) {
    return;
  }

  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "doNotMix",
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
      allowsRecording: false,
    });

    const player = getForegroundAlarmPlayer();
    player.loop = true;
    player.volume = 1;
    await player.seekTo(0);
    player.play();
    isForegroundAlarmPlaying = true;
  } catch {
    isForegroundAlarmPlaying = false;
  }
}

async function stopForegroundAlarm() {
  isForegroundAlarmPlaying = false;

  if (!foregroundAlarmPlayer) {
    return;
  }

  try {
    foregroundAlarmPlayer.pause();
    await foregroundAlarmPlayer.seekTo(0);
  } catch {
    // Ignore audio cleanup failures.
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function normalizeTimer(timer: Partial<BakingTimer> & Pick<BakingTimer, "id" | "label" | "duration" | "remaining">): BakingTimer {
  return {
    id: timer.id,
    label: timer.label,
    duration: timer.duration,
    remaining: timer.remaining,
    isRunning: timer.isRunning ?? false,
    targetTime: timer.targetTime ?? null,
  };
}

function loadTimers(): BakingTimer[] {
  const saved = localStorage.getItem(TIMER_STORAGE_KEY);
  if (saved) {
    try {
      return (JSON.parse(saved) as BakingTimer[]).map((timer) => normalizeTimer(timer));
    } catch {
      return [];
    }
  }

  return [
    normalizeTimer({
      id: "default1",
      label: "Autolyse",
      duration: 1800,
      remaining: 1800,
    }),
    normalizeTimer({
      id: "default2",
      label: "Bake",
      duration: 2700,
      remaining: 2700,
    }),
  ];
}

function syncTimer(timer: BakingTimer, now: number): BakingTimer {
  if (!timer.isRunning || !timer.targetTime) {
    return timer.remaining <= 0 ? completeTimer(timer) : timer;
  }

  const remaining = Math.max(0, Math.ceil((timer.targetTime - now) / 1000));
  if (remaining === 0) {
    return completeTimer(timer);
  }

  if (remaining === timer.remaining) {
    return timer;
  }

  return { ...timer, remaining };
}

function completeTimer(timer: BakingTimer): BakingTimer {
  if (timer.remaining === timer.duration && !timer.isRunning && timer.targetTime === null) {
    return timer;
  }

  return { ...timer, remaining: timer.duration, isRunning: false, targetTime: null };
}

function getTimerNotificationIds(timerId: string) {
  return Array.from({ length: TIMER_REMINDER_COUNT + 1 }, (_, index) =>
    index === 0 ? timerId : `${timerId}__reminder_${index}`
  );
}

function hasGrantedNotificationPermission(settings: Notifications.NotificationPermissionsStatus) {
  return (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL
  );
}

async function ensureNotificationPermissions() {
  const current = await Notifications.getPermissionsAsync();
  if (hasGrantedNotificationPermission(current)) {
    return true;
  }

  if (current.canAskAgain) {
    const hasShownExplanation = localStorage.getItem(TIMER_PERMISSION_EXPLANATION_KEY) === "true";

    if (!hasShownExplanation) {
      const shouldContinue = await new Promise<boolean>((resolve) => {
        Alert.alert(
          "Enable Timer Alerts",
          "Bake-It needs notification permission so your timers can still alert you when your phone is locked or the app is in the background.",
          [
            { text: "Not Now", style: "cancel", onPress: () => resolve(false) },
            { text: "Continue", onPress: () => resolve(true) },
          ]
        );
      });

      localStorage.setItem(TIMER_PERMISSION_EXPLANATION_KEY, "true");

      if (!shouldContinue) {
        return false;
      }
    }
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowBadge: false,
    },
  });

  if (hasGrantedNotificationPermission(requested)) {
    return true;
  }

  if (!requested.canAskAgain) {
    Alert.alert(
      "Timer Alerts Are Off",
      "To hear timer alerts when Bake-It is in the background, please enable Notifications for Bake-It in Settings.",
      [
        { text: "Not Now", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => {
            void Linking.openSettings();
          },
        },
      ]
    );
  }

  return false;
}

async function cancelTimerNotification(timerId: string) {
  await Promise.all(
    getTimerNotificationIds(timerId).map(async (notificationId) => {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      } catch {
        // Ignore missing or already-fired notifications.
      }
    })
  );
}

async function scheduleTimerNotification(timer: BakingTimer) {
  if (!timer.targetTime) {
    return false;
  }

  const targetTime = timer.targetTime;

  const hasPermission = await ensureNotificationPermissions();
  if (!hasPermission) {
    return false;
  }

  await cancelTimerNotification(timer.id);

  try {
    const notificationIds = getTimerNotificationIds(timer.id);

    await Promise.all(
      notificationIds.map((identifier, index) =>
        Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title: index === 0 ? `${timer.label} timer finished` : `${timer.label} still needs attention`,
            body: index === 0 ? `${timer.label} is done.` : `Open Bake-It to clear the ${timer.label} timer.`,
            sound: TIMER_ALARM_SOUND_FILENAME,
            interruptionLevel: "timeSensitive",
            data: { timerId: timer.id },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(targetTime + index * TIMER_REMINDER_INTERVAL_MS),
          },
        })
      )
    );

    return true;
  } catch {
    return false;
  }
}

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timers, setTimers] = useState<BakingTimer[]>(() => {
    const now = Date.now();
    return loadTimers().map((timer) => syncTimer(timer, now));
  });
  const timersRef = useRef(timers);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    timersRef.current = timers;
  }, [timers]);

  useEffect(() => {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timers));
  }, [timers]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTimers((current) => current.map((timer) => syncTimer(timer, now)));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const syncAllTimers = () => {
      const now = Date.now();
      const finishedTimerIds = timersRef.current
        .filter(
          (timer): timer is BakingTimer & { targetTime: number } =>
            timer.isRunning && timer.targetTime !== null && timer.targetTime <= now
        )
        .map((timer) => timer.id);

      setTimers((current) => current.map((timer) => syncTimer(timer, now)));

      finishedTimerIds.forEach((timerId) => {
        void cancelTimerNotification(timerId);
      });

       if (finishedTimerIds.length > 0 && appStateRef.current === "active") {
        void playForegroundAlarm();
      }
    };

    const handleAppStateChange = (state: AppStateStatus) => {
      appStateRef.current = state;

      if (state === "active") {
        syncAllTimers();
        return;
      }

      void stopForegroundAlarm();
    };

    const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);
    const receivedSubscription = Notifications.addNotificationReceivedListener((event) => {
      const timerId = event.request.content.data?.timerId;
      if (typeof timerId !== "string") {
        return;
      }

      void cancelTimerNotification(timerId);
      void playForegroundAlarm();
      setTimers((current) =>
        current.map((timer) => (timer.id === timerId ? completeTimer(timer) : timer))
      );
    });
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const timerId = response.notification.request.content.data?.timerId;
      if (typeof timerId !== "string") {
        return;
      }

      void cancelTimerNotification(timerId);
      void stopForegroundAlarm();
      setTimers((current) =>
        current.map((timer) => (timer.id === timerId ? completeTimer(timer) : timer))
      );
    });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      const timerId = response?.notification.request.content.data?.timerId;
      if (typeof timerId !== "string") {
        return;
      }

      void cancelTimerNotification(timerId);
      void stopForegroundAlarm();
      setTimers((current) =>
        current.map((timer) => (timer.id === timerId ? completeTimer(timer) : timer))
      );
    });

    return () => {
      appStateSubscription.remove();
      receivedSubscription.remove();
      responseSubscription.remove();
      void stopForegroundAlarm();
    };
  }, []);

  const value = useMemo<TimerContextType>(
    () => ({
      timers,
      addTimer: (label, duration) => {
        setTimers((current) => [
          ...current,
          {
            id: createId("timer"),
            label,
            duration,
            remaining: duration,
            isRunning: false,
            targetTime: null,
          },
        ]);
      },
      removeTimer: async (id) => {
        setTimers((current) => current.filter((timer) => timer.id !== id));
        await stopForegroundAlarm();
        await cancelTimerNotification(id);
      },
      toggleTimer: async (id) => {
        const now = Date.now();
        const timer = timersRef.current.find((item) => item.id === id);
        if (!timer) {
          return;
        }

        if (timer.isRunning) {
          setTimers((current) =>
            current.map((item) =>
              item.id === id ? syncTimer({ ...item, isRunning: false, targetTime: null }, now) : item
            )
          );
          await stopForegroundAlarm();
          await cancelTimerNotification(id);
          return;
        }

        if (timer.remaining <= 0) {
          return;
        }

        const nextTimer: BakingTimer = {
          ...timer,
          isRunning: true,
          targetTime: now + timer.remaining * 1000,
        };

        setTimers((current) => current.map((item) => (item.id === id ? nextTimer : item)));
        await stopForegroundAlarm();

        const didSchedule = await scheduleTimerNotification(nextTimer);
        if (!didSchedule) {
          return;
        }

        const latest = timersRef.current.find((item) => item.id === id);
        if (!latest || !latest.isRunning || latest.targetTime !== nextTimer.targetTime) {
          await cancelTimerNotification(id);
        }
      },
      resetTimer: async (id) => {
        setTimers((current) =>
          current.map((timer) =>
            timer.id === id
              ? { ...timer, remaining: timer.duration, isRunning: false, targetTime: null }
              : timer
          )
        );
        await stopForegroundAlarm();
        await cancelTimerNotification(id);
      },
    }),
    [timers]
  );

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimers() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimers must be used within TimerProvider");
  }
  return context;
}
