import React from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface InsightsLoadingIndicatorProps {
  pulseAnim: Animated.Value;
  rotateAnim: Animated.Value;
  scaleAnim: Animated.Value;
}

const InsightsLoadingIndicator: React.FC<InsightsLoadingIndicatorProps> = ({
  pulseAnim,
  rotateAnim,
  scaleAnim,
}) => {
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.modernLoadingContainer}>
      <Animated.View
        style={[
          styles.loadingIconContainer,
          {
            transform: [
              { scale: pulseAnim },
              { rotate: spin },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={["#3AABF0", "#3AABF0", "#3AABF0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loadingGradient}
        >
          <Ionicons name="sparkles" size={32} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>
      <Text style={styles.modernLoadingText}>
        Analyzing your health data...
      </Text>
      <View style={styles.loadingDots}>
        <Animated.View style={[styles.loadingDot, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.loadingDot, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.loadingDot, { opacity: pulseAnim }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modernLoadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#3AABF0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  modernLoadingText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  loadingDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3AABF0",
    marginHorizontal: 4,
  },
});

export default InsightsLoadingIndicator;
