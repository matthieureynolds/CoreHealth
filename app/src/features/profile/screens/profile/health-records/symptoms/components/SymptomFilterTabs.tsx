import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type FilterType = "all" | "physical" | "mental";

interface SymptomFilterTabsProps {
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
}

const TABS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "physical", label: "Physical" },
  { key: "mental", label: "Mental" },
];

const SymptomFilterTabs: React.FC<SymptomFilterTabsProps> = ({
  filter,
  onFilterChange,
}) => (
  <View style={styles.filterSection}>
    <View style={styles.filterTabs}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.filterTab,
            filter === tab.key && styles.filterTabActive,
          ]}
          onPress={() => onFilterChange(tab.key)}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === tab.key && styles.filterTabTextActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTabs: {
    flexDirection: "row",
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  filterTabActive: {
    backgroundColor: "#3AABF0",
  },
  filterTabText: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "600",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
});

export default SymptomFilterTabs;
