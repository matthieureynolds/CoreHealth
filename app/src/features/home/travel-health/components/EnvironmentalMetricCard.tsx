import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../../shared/types";

export interface EnvironmentalMetric {
  id: string;
  label: string;
  value: string;
  status: "excellent" | "good" | "moderate" | "poor" | "hazardous";
  icon: keyof typeof Ionicons.glyphMap;
  score?: number;
}

interface Props {
  metric: EnvironmentalMetric;
  getStatusColor: (status: string) => string;
  onPress: (metric: EnvironmentalMetric) => void;
}

const EnvironmentalMetricCard: React.FC<Props> = ({
  metric,
  getStatusColor,
  onPress,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const statusColor = getStatusColor(metric.status);

  const handlePress = () => {
    if (
      metric.id === "air_quality" ||
      metric.id === "pollen" ||
      metric.id === "water_quality"
    ) {
      navigation.navigate("EnvironmentalMetric", {
        metricId: metric.id as "air_quality" | "pollen" | "water_quality",
        label: metric.label,
        value: String(metric.value),
        status: metric.status,
        score: metric.score || 0,
        icon: metric.icon,
      });
    } else {
      onPress(metric);
    }
  };

  return (
    <TouchableOpacity style={styles.metricCard} onPress={handlePress}>
      <View style={styles.metricCardContent}>
        <View style={styles.metricCardLeft}>
          <View
            style={[
              styles.metricIconContainer,
              { backgroundColor: `${statusColor}20` },
            ]}
          >
            <Ionicons name={metric.icon} size={20} color={statusColor} />
          </View>
          <View style={styles.metricInfo}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={[styles.metricValue, { color: statusColor }]}>
              {metric.value}
            </Text>
          </View>
        </View>
        <View style={styles.metricCardRight}>
          <Text style={[styles.metricScore, { color: statusColor }]}>
            {metric.score}
          </Text>
          <Text style={styles.metricScoreLabel}>Score</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  metricCard: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
  },
  metricCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  metricCardRight: {
    alignItems: "flex-end",
  },
  metricScore: {
    fontSize: 20,
    fontWeight: "bold",
  },
  metricScoreLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 2,
  },
});

export default EnvironmentalMetricCard;
