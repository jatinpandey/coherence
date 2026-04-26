import { useCallback, useEffect, useState } from "react";
import {
  advanceStreak,
  emptyStreak,
  loadStreak,
  saveStreak,
  visibleStreak,
  type StreakState,
} from "./streak";

export const useStreak = () => {
  const [state, setState] = useState<StreakState>(emptyStreak);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    loadStreak().then(setState);
  }, []);

  // Refresh "today" once a minute so the displayed streak resets after midnight.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const recordCompletion = useCallback(() => {
    setState((prev) => {
      const next = advanceStreak(prev, new Date());
      if (next !== prev) saveStreak(next);
      return next;
    });
  }, []);

  return {
    streak: visibleStreak(state, now),
    recordCompletion,
  };
};
