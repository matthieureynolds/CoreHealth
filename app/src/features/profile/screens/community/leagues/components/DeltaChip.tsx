import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DeltaChipProps {
  delta: number;
}

const DeltaChip: React.FC<DeltaChipProps> = ({ delta }) => {
  if (delta === 0) return <View style={{ width: 18 }} />;
  return (
    <View
      style={[styles.deltaChip, delta > 0 ? styles.deltaUp : styles.deltaDown]}
    >
      <Ionicons
        name={delta > 0 ? "arrow-up" : "arrow-down"}
        size={9}
        color={delta > 0 ? "#34C759" : "#FF453A"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  deltaChip: {
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  deltaUp: { backgroundColor: "rgba(52,199,89,0.15)" },
  deltaDown: { backgroundColor: "rgba(255,69,58,0.15)" },
});

export default DeltaChip;
