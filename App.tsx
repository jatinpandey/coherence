import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { BreathOrb } from "./src/BreathOrb";
import { Settings } from "./src/Settings";
import { PRESETS, phaseLabel, type Pattern, type Preset } from "./src/presets";
import { useBreathCycle } from "./src/useBreathCycle";
import { playPhaseTone } from "./src/audio";

const STORE_KEY = "coherence:state:v1";

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
};

export default function App() {
  const [pattern, setPattern] = useState<Pattern>(PRESETS[0].pattern);
  const [selectedId, setSelectedId] = useState<string | null>(PRESETS[0].id);
  const [haptics, setHaptics] = useState(true);
  const [audio, setAudio] = useState(false);
  const [durationMin, setDurationMin] = useState(5);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (!raw) return;
        const s = JSON.parse(raw);
        if (s.pattern) setPattern(s.pattern);
        if (typeof s.selectedId === "string" || s.selectedId === null)
          setSelectedId(s.selectedId);
        if (typeof s.haptics === "boolean") setHaptics(s.haptics);
        if (typeof s.audio === "boolean") setAudio(s.audio);
        if (typeof s.durationMin === "number") setDurationMin(s.durationMin);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(
      STORE_KEY,
      JSON.stringify({ pattern, selectedId, haptics, audio, durationMin })
    ).catch(() => {});
  }, [pattern, selectedId, haptics, audio, durationMin]);

  const { running, phase, phaseRemaining, cycleCount, elapsed, progress, start, stop } =
    useBreathCycle({
      pattern,
      haptics,
      onPhaseEnter: (p) => {
        if (audio) playPhaseTone(p);
      },
    });

  useEffect(() => {
    if (running) {
      activateKeepAwakeAsync().catch(() => {});
    } else {
      deactivateKeepAwake().catch(() => {});
    }
  }, [running]);

  useEffect(() => {
    if (running && elapsed >= durationMin * 60) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, running, durationMin]);

  const onSelectPreset = (p: Preset) => {
    setPattern(p.pattern);
    setSelectedId(p.id);
  };

  const onCustomPattern = (p: Pattern) => {
    setPattern(p);
    setSelectedId(null);
  };

  const totalSec = useMemo(
    () => pattern.inhale + pattern.holdIn + pattern.exhale + pattern.holdOut,
    [pattern]
  );

  const orbSize = Math.min(Dimensions.get("window").width * 0.78, 360);
  const remainingSession = Math.max(0, durationMin * 60 - elapsed);
  const presetName =
    PRESETS.find((p) => p.id === selectedId)?.name ?? "Custom";

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topBar}>
        <Pressable
          onPress={() => setSettingsOpen(true)}
          hitSlop={16}
          style={styles.topBtn}
        >
          <Text style={styles.topBtnText}>{presetName}</Text>
          <Text style={styles.topBtnSub}>
            {pattern.inhale}·{pattern.holdIn}·{pattern.exhale}
            {pattern.holdOut > 0 ? `·${pattern.holdOut}` : ""}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSettingsOpen(true)}
          hitSlop={16}
          style={styles.gear}
        >
          <Text style={styles.gearText}>⚙︎</Text>
        </Pressable>
      </View>

      <View style={styles.center}>
        <BreathOrb progress={progress} size={orbSize} />
        <View style={styles.label} pointerEvents="none">
          <Text style={styles.phaseText}>
            {running ? phaseLabel(phase) : null}
          </Text>
          <Text style={styles.countText}>
            {running ? Math.ceil(phaseRemaining) : null}
          </Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.statsRow}>
          <Stat
            label="Time"
            value={running ? fmt(remainingSession) : `${durationMin}:00`}
          />
          <Stat label="Cycles" value={String(cycleCount)} />
          <Stat
            label="Br/min"
            value={(60 / Math.max(1, totalSec)).toFixed(1)}
          />
        </View>

        <Pressable
          onPress={running ? stop : start}
          style={[styles.runBtn, running && styles.runBtnStop]}
        >
          <Text style={styles.runBtnText}>{running ? "Stop" : "Begin"}</Text>
        </Pressable>
      </View>

      <Settings
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        pattern={pattern}
        setPattern={onCustomPattern}
        selectedId={selectedId}
        setPreset={onSelectPreset}
        haptics={haptics}
        setHaptics={setHaptics}
        audio={audio}
        setAudio={setAudio}
        durationMin={durationMin}
        setDurationMin={setDurationMin}
      />
    </SafeAreaView>
  );
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0a0a" },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topBtn: { paddingVertical: 8 },
  topBtnText: { color: "#e6e6e6", fontSize: 16, fontWeight: "600" },
  topBtnSub: { color: "#7a7a7a", fontSize: 12, marginTop: 2 },
  gear: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#161616",
    alignItems: "center",
    justifyContent: "center",
  },
  gearText: { color: "#d4a574", fontSize: 18 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  label: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  phaseText: {
    color: "#d4a574",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 6,
    textTransform: "uppercase",
    marginBottom: 14,
    opacity: 0.9,
  },
  countText: {
    color: "#f5efe4",
    fontSize: 64,
    fontWeight: "100",
    fontVariant: ["tabular-nums"],
    letterSpacing: 1,
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 28, gap: 20 },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  stat: { alignItems: "center" },
  statValue: {
    color: "#e6e6e6",
    fontSize: 18,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    color: "#6a6a6a",
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  runBtn: {
    height: 64,
    borderRadius: 32,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#d4a574",
    alignItems: "center",
    justifyContent: "center",
  },
  runBtnStop: {
    borderColor: "#3a3a3a",
  },
  runBtnText: {
    color: "#d4a574",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
});
