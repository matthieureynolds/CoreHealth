import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BiomarkerInfo } from "../BiomarkerModal";

interface BiomarkerResultCardProps {
  biomarker: BiomarkerInfo;
  backgroundColor: string;
}

const BiomarkerResultCard: React.FC<BiomarkerResultCardProps> = ({
  biomarker,
  backgroundColor,
}) => (
  <View style={[styles.resultCard, { backgroundColor }]}>
    <View style={styles.resultHeader}>
      <Text style={styles.resultValue}>
        {biomarker.value} {biomarker.unit}
      </Text>
      <View style={styles.resultInfo}>
        <Text style={styles.resultRange}>
          Normal: {biomarker.referenceRange}
        </Text>
        {biomarker.lastTested && (
          <Text style={styles.lastTested}>{biomarker.lastTested}</Text>
        )}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  resultInfo: {
    alignItems: "flex-end",
  },
  resultRange: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 2,
  },
  lastTested: {
    fontSize: 11,
    color: "#8E8E93",
    fontStyle: "italic",
  },
});

export default BiomarkerResultCard;
