import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, Easing, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Cosmetic "reasoning" steps. They tick over on a timer to convey the system
// working through each check — building trust that real analysis is happening.
const STEPS = [
  "Air quality & pollutants",
  "Water & food safety",
  "UV, pollen & altitude",
  "Outbreak surveillance",
  "Hospitals & vaccinations",
];

const STEP_MS = 620;

interface AnalyzingStateProps {
  location?: string;
}

const AnalyzingState: React.FC<AnalyzingStateProps> = ({ location }) => {
  const [active, setActive] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const spin = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;

  // Advance the active step over time (holds on the last while data resolves).
  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a < STEPS.length - 1 ? a + 1 : a));
    }, STEP_MS);
    return () => clearInterval(id);
  }, []);

  // Spinner for the in-progress step.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  // Progress-bar shimmer sweep.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 1300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [sweep]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const sweepX = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-SWEEP_WIDTH, trackWidth || 1],
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Analysing {location ? location.split(",")[0] : "destination"}
        <Text style={styles.ellipsis}>…</Text>
      </Text>

      <View style={styles.steps}>
        {STEPS.map((label, i) => {
          const done = i < active;
          const isActive = i === active;
          return (
            <View key={label} style={styles.row}>
              <View style={styles.iconWrap}>
                {done ? (
                  <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                ) : isActive ? (
                  <Animated.View style={{ transform: [{ rotate }] }}>
                    <Ionicons name="sync" size={17} color="#3AABF0" />
                  </Animated.View>
                ) : (
                  <Ionicons name="ellipse-outline" size={16} color="#3A3A3C" />
                )}
              </View>
              <Text
                style={[
                  styles.rowText,
                  done && styles.rowTextDone,
                  isActive && styles.rowTextActive,
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      <View
        style={styles.track}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[styles.sweepWrap, { transform: [{ translateX: sweepX }] }]}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[
              "rgba(58,171,240,0)",
              "rgba(58,171,240,0.9)",
              "rgba(58,171,240,0)",
            ]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const SWEEP_WIDTH = 120;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 18,
  },
  ellipsis: {
    color: "#3AABF0",
  },
  steps: {
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
  },
  iconWrap: {
    width: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    color: "#8E8E93",
    fontSize: 15,
    marginLeft: 10,
  },
  rowTextActive: {
    color: "#FFFFFF",
  },
  rowTextDone: {
    color: "#C7C7CC",
  },
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "#2C2C2E",
    overflow: "hidden",
  },
  sweepWrap: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: SWEEP_WIDTH,
  },
});

export default AnalyzingState;
