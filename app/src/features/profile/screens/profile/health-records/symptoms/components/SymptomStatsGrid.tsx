import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SymptomStats } from "@shared/types/symptoms";

interface SymptomStatsGridProps {
  stats: SymptomStats;
}

const StatCard: React.FC<{ number: string; label: string }> = ({
  number,
  label,
}) => (
  <View style={styles.statCard}>
    <Text style={styles.statNumber}>{number}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const SymptomStatsGrid: React.FC<SymptomStatsGridProps> = ({ stats }) => (
  <View style={styles.statsSection}>
    <Text style={styles.sectionTitle}>Summary</Text>
    <View style={styles.statsGrid}>
      <StatCard number={String(stats.totalEntries)} label="Total Entries" />
      <StatCard number={String(stats.physicalEntries)} label="Physical" />
      <StatCard number={String(stats.mentalEntries)} label="Mental" />
      <StatCard
        number={stats.averageSeverity.toFixed(1)}
        label="Avg Severity"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  statsSection: {
    backgroundColor: "#1C1C1E",
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#8E8E93",
  },
});

export default SymptomStatsGrid;
