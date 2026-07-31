import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "@shared/theme/colors";

interface Props {
  jetLagHours: number;
}

const getJetLagStatus = (
  jetLagHours: number,
): { text: string; color: string; icon: keyof typeof Ionicons.glyphMap } => {
  if (jetLagHours === 0) {
    return {
      text: "No Jet Lag",
      color: palette.success,
      icon: "checkmark-circle",
    };
  } else if (jetLagHours <= 3) {
    return {
      text: `Mild Jet Lag (+${jetLagHours}h)`,
      color: palette.warningAlt,
      icon: "time-outline",
    };
  } else {
    return {
      text: `Moderate Jet Lag (+${jetLagHours}h)`,
      color: palette.alert,
      icon: "warning-outline",
    };
  }
};

const JetLagBanner: React.FC<Props> = ({ jetLagHours }) => {
  if (jetLagHours === 0) return null;

  const info = getJetLagStatus(jetLagHours);

  return (
    <View style={styles.jetLagContainer}>
      <View style={styles.jetLagHeader}>
        <Ionicons name={info.icon} size={16} color={info.color} />
        <Text style={[styles.jetLagText, { color: info.color }]}>
          {" "}
          {info.text}{" "}
        </Text>
      </View>
      <Text style={styles.jetLagAdvice}>
        Consider adjusting sleep schedule gradually
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  jetLagContainer: {
    backgroundColor: palette.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FF9F0A20",
  },
  jetLagHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  jetLagText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  jetLagAdvice: {
    fontSize: 12,
    color: "#EBEBF5",
    lineHeight: 16,
  },
});

export default JetLagBanner;
