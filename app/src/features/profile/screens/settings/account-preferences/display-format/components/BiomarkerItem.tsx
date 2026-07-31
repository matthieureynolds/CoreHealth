import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface BiomarkerInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  isCore?: boolean;
}

interface BiomarkerItemProps {
  biomarker: BiomarkerInfo;
  isVisible: boolean;
  showOnlyVisible: boolean;
  onToggle: (id: string, value: boolean) => void;
}

const BiomarkerItem: React.FC<BiomarkerItemProps> = ({
  biomarker,
  isVisible,
  showOnlyVisible,
  onToggle,
}) => {
  if (showOnlyVisible && !isVisible) return null;

  return (
    <View style={styles.biomarkerItem}>
      <View style={styles.biomarkerLeft}>
        <Ionicons
          name={biomarker.icon as any}
          size={24}
          color={isVisible ? "#3AABF0" : "#C7C7CC"}
        />
        <View style={styles.biomarkerInfo}>
          <View style={styles.biomarkerTitleRow}>
            <Text
              style={[styles.biomarkerName, !isVisible && styles.disabledText]}
            >
              {biomarker.name}
            </Text>
            {biomarker.isCore && (
              <View style={styles.coreIndicator}>
                <Text style={styles.coreText}>CORE</Text>
              </View>
            )}
          </View>
          <Text style={styles.biomarkerDescription}>
            {biomarker.description}
          </Text>
        </View>
      </View>
      <Switch
        value={isVisible}
        onValueChange={(value) => onToggle(biomarker.id, value)}
        trackColor={{ false: "#E5E5EA", true: "#30D158" }}
        thumbColor="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  biomarkerItem: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C6C6C8",
    paddingLeft: 32,
  },
  biomarkerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  biomarkerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  biomarkerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  biomarkerName: {
    fontSize: 16,
    color: "#000000",
  },
  disabledText: {
    color: "#8E8E93",
  },
  biomarkerDescription: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
  },
  coreIndicator: {
    backgroundColor: "#3AABF0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coreText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default BiomarkerItem;
