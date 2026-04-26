import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import type { Pattern, Preset } from "./presets";
import { PRESETS } from "./presets";

type Props = {
  visible: boolean;
  onClose: () => void;
  pattern: Pattern;
  setPattern: (p: Pattern) => void;
  selectedId: string | null;
  setPreset: (p: Preset) => void;
  haptics: boolean;
  setHaptics: (b: boolean) => void;
  audio: boolean;
  setAudio: (b: boolean) => void;
  durationMin: number;
  setDurationMin: (n: number) => void;
};

const Stepper = ({
  label,
  value,
  onChange,
  min = 0,
  max = 30,
  unit = "s",
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}) => (
  <View style={styles.stepper}>
    <Text style={styles.stepperLabel}>{label}</Text>
    <View style={styles.stepperControls}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        style={styles.stepBtn}
      >
        <Text style={styles.stepBtnText}>−</Text>
      </Pressable>
      <Text style={styles.stepperValue}>
        {value}
        {unit}
      </Text>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        style={styles.stepBtn}
      >
        <Text style={styles.stepBtnText}>+</Text>
      </Pressable>
    </View>
  </View>
);

export function Settings({
  visible,
  onClose,
  pattern,
  setPattern,
  selectedId,
  setPreset,
  haptics,
  setHaptics,
  audio,
  setAudio,
  durationMin,
  setDurationMin,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Session</Text>
          <Pressable onPress={onClose} hitSlop={16}>
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionLabel}>Presets</Text>
          <View style={styles.presetGrid}>
            {PRESETS.map((p) => {
              const active = p.id === selectedId;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setPreset(p)}
                  style={[styles.presetCard, active && styles.presetCardActive]}
                >
                  <Text
                    style={[
                      styles.presetName,
                      active && styles.presetNameActive,
                    ]}
                  >
                    {p.name}
                  </Text>
                  <Text style={styles.presetBlurb}>{p.blurb}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Custom pattern</Text>
          <View style={styles.card}>
            <Stepper
              label="Inhale"
              value={pattern.inhale}
              min={2}
              max={20}
              onChange={(n) => setPattern({ ...pattern, inhale: n })}
            />
            <View style={styles.divider} />
            <Stepper
              label="Hold (full)"
              value={pattern.holdIn}
              max={20}
              onChange={(n) => setPattern({ ...pattern, holdIn: n })}
            />
            <View style={styles.divider} />
            <Stepper
              label="Exhale"
              value={pattern.exhale}
              min={2}
              max={20}
              onChange={(n) => setPattern({ ...pattern, exhale: n })}
            />
            <View style={styles.divider} />
            <Stepper
              label="Hold (empty)"
              value={pattern.holdOut}
              max={20}
              onChange={(n) => setPattern({ ...pattern, holdOut: n })}
            />
          </View>

          <Text style={styles.sectionLabel}>Session length</Text>
          <View style={styles.card}>
            <Stepper
              label="Duration"
              value={durationMin}
              min={1}
              max={60}
              unit=" min"
              onChange={setDurationMin}
            />
          </View>

          <Text style={styles.sectionLabel}>Feedback</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Haptics</Text>
              <Switch value={haptics} onValueChange={setHaptics} />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Sound cues</Text>
              <Switch value={audio} onValueChange={setAudio} />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: "#0a0a0a" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "600" },
  done: { color: "#5b9fd6", fontSize: 17, fontWeight: "500" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionLabel: {
    color: "#7a7a7a",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 10,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  presetCard: {
    width: "48%",
    backgroundColor: "#161616",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#222",
  },
  presetCardActive: {
    borderColor: "#5b9fd6",
    backgroundColor: "#10283f",
  },
  presetName: { color: "#e6e6e6", fontSize: 15, fontWeight: "600" },
  presetNameActive: { color: "#cfe9ff" },
  presetBlurb: { color: "#7a7a7a", fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: "#161616",
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#222",
  },
  stepper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  stepperLabel: { color: "#e6e6e6", fontSize: 16 },
  stepperControls: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#262626",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: { color: "#fff", fontSize: 20, lineHeight: 22 },
  stepperValue: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "500",
    minWidth: 60,
    textAlign: "center",
  },
  divider: { height: 1, backgroundColor: "#222" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowLabel: { color: "#e6e6e6", fontSize: 16 },
});
