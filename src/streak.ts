import AsyncStorage from "@react-native-async-storage/async-storage";

export const STREAK_KEY = "coherence:streak:v1";
export const MIN_SESSION_SECONDS = 30;

export type StreakState = {
  lastSessionDate: string | null;
  streak: number;
};

export const emptyStreak: StreakState = { lastSessionDate: null, streak: 0 };

export const dateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const dayDiff = (a: string, b: string): number => {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = new Date(ay, am - 1, ad).getTime();
  const db = new Date(by, bm - 1, bd).getTime();
  return Math.round((da - db) / 86_400_000);
};

export const visibleStreak = (state: StreakState, now: Date): number => {
  if (!state.lastSessionDate) return 0;
  const diff = dayDiff(dateKey(now), state.lastSessionDate);
  return diff <= 1 ? state.streak : 0;
};

export const advanceStreak = (
  state: StreakState,
  now: Date
): StreakState => {
  const today = dateKey(now);
  if (state.lastSessionDate === today) return state;
  if (state.lastSessionDate && dayDiff(today, state.lastSessionDate) === 1) {
    return { lastSessionDate: today, streak: state.streak + 1 };
  }
  return { lastSessionDate: today, streak: 1 };
};

export const loadStreak = async (): Promise<StreakState> => {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (!raw) return emptyStreak;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      (parsed.lastSessionDate === null ||
        typeof parsed.lastSessionDate === "string") &&
      typeof parsed.streak === "number"
    ) {
      return parsed as StreakState;
    }
    return emptyStreak;
  } catch {
    return emptyStreak;
  }
};

export const saveStreak = async (state: StreakState): Promise<void> => {
  try {
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(state));
  } catch {}
};
