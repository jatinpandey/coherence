import React from "react";
import { Animated, StyleSheet, View } from "react-native";

type Props = {
  progress: Animated.Value; // 0 (empty) -> 1 (full)
  size: number;
};

const ACCENT = "#d4a574";

export function BreathOrb({ progress, size }: Props) {
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const glowOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.22],
  });

  const ringSize = size * 0.86;
  const strokeWidth = Math.max(1.5, size * 0.006);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.glow,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: glowOpacity,
            transform: [{ scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: strokeWidth,
            transform: [{ scale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 60,
  },
  ring: {
    position: "absolute",
    borderColor: ACCENT,
    backgroundColor: "transparent",
  },
});
