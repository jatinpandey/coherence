import { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import * as Haptics from "expo-haptics";
import type { Pattern, Phase } from "./presets";

type Options = {
  pattern: Pattern;
  haptics: boolean;
  onPhaseEnter?: (phase: Phase) => void;
};

const orderedPhases = (p: Pattern): Phase[] => {
  const seq: Phase[] = ["inhale"];
  if (p.holdIn > 0) seq.push("holdIn");
  seq.push("exhale");
  if (p.holdOut > 0) seq.push("holdOut");
  return seq;
};

const phaseDuration = (phase: Phase, p: Pattern) => {
  switch (phase) {
    case "inhale": return p.inhale;
    case "holdIn": return p.holdIn;
    case "exhale": return p.exhale;
    case "holdOut": return p.holdOut;
  }
};

const targetScale = (phase: Phase) => {
  if (phase === "inhale" || phase === "holdIn") return 1;
  return 0;
};

export function useBreathCycle({ pattern, haptics, onPhaseEnter }: Options) {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [phaseStart, setPhaseStart] = useState<number>(Date.now());
  const [cycleCount, setCycleCount] = useState(0);
  const [elapsed, setElapsed] = useState(0); // total seconds running

  const progress = useRef(new Animated.Value(0)).current; // 0 = empty, 1 = full lungs
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);

  const clearAll = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    timerRef.current = null;
    tickRef.current = null;
    progress.stopAnimation();
  };

  const startPhase = (next: Phase) => {
    setPhase(next);
    setPhaseStart(Date.now());
    if (next === "inhale") setCycleCount((c) => c + 1);
    onPhaseEnter?.(next);

    if (haptics) {
      const style =
        next === "inhale"
          ? Haptics.ImpactFeedbackStyle.Medium
          : next === "exhale"
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Soft;
      Haptics.impactAsync(style).catch(() => {});
    }

    const dur = phaseDuration(next, pattern) * 1000;

    if (next === "inhale" || next === "exhale") {
      Animated.timing(progress, {
        toValue: targetScale(next),
        duration: dur,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }

    const seq = orderedPhases(pattern);
    const idx = seq.indexOf(next);
    const upcoming = seq[(idx + 1) % seq.length];
    timerRef.current = setTimeout(() => startPhase(upcoming), dur);
  };

  const start = () => {
    if (running) return;
    clearAll();
    setRunning(true);
    setCycleCount(0);
    startedAtRef.current = Date.now();
    setElapsed(0);
    progress.setValue(0);
    tickRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 250);
    startPhase("inhale");
  };

  const stop = () => {
    clearAll();
    setRunning(false);
    Animated.timing(progress, {
      toValue: 0,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => () => clearAll(), []);

  // Restart current phase on pattern change while running
  useEffect(() => {
    if (running) {
      clearAll();
      startedAtRef.current = Date.now();
      setElapsed(0);
      tickRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 250);
      startPhase("inhale");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern.inhale, pattern.holdIn, pattern.exhale, pattern.holdOut]);

  const phaseDur = phaseDuration(phase, pattern);
  const phaseRemaining = Math.max(0, phaseDur - (Date.now() - phaseStart) / 1000);

  return {
    running,
    phase,
    phaseRemaining,
    cycleCount,
    elapsed,
    progress,
    start,
    stop,
  };
}
