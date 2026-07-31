import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ReportSection {
  id: string;
  label: string;
  icon: string;
}

interface SectionSelectorProps {
  reportSections: ReportSection[];
  selectedSections: string[];
  onToggle: (sectionId: string) => void;
  getSectionCount: (sectionId: string) => number;
}

const SectionSelector: React.FC<SectionSelectorProps> = ({
  reportSections,
  selectedSections,
  onToggle,
  getSectionCount,
}) => (
  <View style={styles.sectionsSection}>
    <Text style={styles.sectionTitle}>Select Sections to Include</Text>
    <Text style={styles.sectionSubtitle}>
      Choose which information to include in your health report
    </Text>

    {reportSections.map((section) => {
      const isSelected = selectedSections.includes(section.id);
      return (
        <TouchableOpacity
          key={section.id}
          style={[styles.sectionCard, isSelected && styles.selectedSection]}
          onPress={() => onToggle(section.id)}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionInfo}>
              <Ionicons
                name={section.icon as any}
                size={24}
                color={isSelected ? "#3AABF0" : "#888"}
              />
              <View style={styles.sectionText}>
                <Text
                  style={[
                    styles.sectionLabel,
                    isSelected && styles.selectedSectionText,
                  ]}
                >
                  {section.label}
                </Text>
                {section.id !== "personal_info" && (
                  <Text style={styles.sectionCount}>
                    {getSectionCount(section.id)} items
                  </Text>
                )}
              </View>
            </View>
            <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  sectionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
  },
  sectionCard: {
    backgroundColor: "#181818",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedSection: {
    backgroundColor: "#3AABF020",
    borderWidth: 1,
    borderColor: "#3AABF0",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sectionText: {
    marginLeft: 12,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 2,
  },
  selectedSectionText: {
    color: "#3AABF0",
  },
  sectionCount: {
    fontSize: 14,
    color: "#888",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: "#3AABF0",
    borderColor: "#3AABF0",
  },
});

export default SectionSelector;
