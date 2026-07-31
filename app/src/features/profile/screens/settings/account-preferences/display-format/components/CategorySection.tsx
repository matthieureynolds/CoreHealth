import React from "react";
import { View, Text, TouchableOpacity, Switch, StyleSheet } from "react-native";
import BiomarkerItem, { BiomarkerInfo } from "./BiomarkerItem";

interface CategorySectionProps {
  category: string;
  biomarkers: BiomarkerInfo[];
  visibleCount: number;
  showOnlyVisible: boolean;
  visibility: Record<string, boolean>;
  onToggleBiomarker: (id: string, value: boolean) => void;
  onToggleCategory: (category: string, value: boolean) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  biomarkers,
  visibleCount,
  showOnlyVisible,
  visibility,
  onToggleBiomarker,
  onToggleCategory,
}) => {
  const allVisible = visibleCount === biomarkers.length;

  return (
    <View style={styles.categorySection}>
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={() => onToggleCategory(category, !allVisible)}
      >
        <View style={styles.categoryLeft}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <Text style={styles.categoryCount}>
            {visibleCount} of {biomarkers.length} visible
          </Text>
        </View>
        <Switch
          value={allVisible}
          onValueChange={(value) => onToggleCategory(category, value)}
          trackColor={{ false: "#E5E5EA", true: "#30D158" }}
          thumbColor="#fff"
        />
      </TouchableOpacity>

      {biomarkers.map((biomarker) => (
        <BiomarkerItem
          key={biomarker.id}
          biomarker={biomarker}
          isVisible={visibility[biomarker.id] !== false}
          showOnlyVisible={showOnlyVisible}
          onToggle={onToggleBiomarker}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  categorySection: {
    marginTop: 35,
  },
  categoryHeader: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C6C6C8",
  },
  categoryLeft: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  },
  categoryCount: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
  },
});

export default CategorySection;
