import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Tab = "gallery" | "file";

interface PickerBottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const PickerBottomNav: React.FC<PickerBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => (
  <View style={styles.bottomNavigation}>
    <TouchableOpacity
      style={[styles.navItem, activeTab === "gallery" && styles.navItemActive]}
      onPress={() => onTabChange("gallery")}
    >
      <Ionicons
        name="images"
        size={24}
        color={activeTab === "gallery" ? "#3AABF0" : "#8E8E93"}
      />
      <Text
        style={[
          styles.navItemText,
          activeTab === "gallery" && styles.navItemTextActive,
        ]}
      >
        Gallery
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.navItem, activeTab === "file" && styles.navItemActive]}
      onPress={() => onTabChange("file")}
    >
      <Ionicons
        name="document-text"
        size={24}
        color={activeTab === "file" ? "#3AABF0" : "#8E8E93"}
      />
      <Text
        style={[
          styles.navItemText,
          activeTab === "file" && styles.navItemTextActive,
        ]}
      >
        File
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  bottomNavigation: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#1C1C1E",
    backgroundColor: "#000000",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  navItemActive: {},
  navItemText: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  navItemTextActive: {
    color: "#3AABF0",
  },
});

export default PickerBottomNav;
