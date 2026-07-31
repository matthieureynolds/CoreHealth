import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SettingsHeader from "@features/profile/screens/settings/components/SettingsHeader";
import { SETTINGS_SCROLL_PT } from "@features/profile/screens/settings/components/settingsLayout";

export interface PickerOption {
  value: string;
  label: string;
  description?: string;
}

interface OptionPickerScreenProps {
  headerTitle: string;
  cardHeader: string;
  sheetTitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  cardLabel: string;
  options: PickerOption[];
  selected: string;
  displayValue: string;
  onSelect: (value: string) => void;
  extraContent?: React.ReactNode;
}

const OptionPickerScreen: React.FC<OptionPickerScreenProps> = ({
  headerTitle,
  cardHeader,
  sheetTitle,
  icon,
  iconColor,
  cardLabel,
  options,
  selected,
  displayValue,
  onSelect,
  extraContent,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const translateY = useRef(new Animated.Value(1000)).current;

  const openPicker = () => {
    setShowPicker(true);
    translateY.setValue(1000);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closePicker = () => {
    Animated.timing(translateY, {
      toValue: 1000,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowPicker(false);
      translateY.setValue(0);
    });
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    closePicker();
  };

  return (
    <View style={styles.container}>
      <SettingsHeader title={headerTitle} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: SETTINGS_SCROLL_PT }}
      >
        <View style={styles.card}>
          <Text style={styles.cardHeader}>{cardHeader}</Text>
          <TouchableOpacity
            style={[styles.cardRow, styles.lastRow]}
            onPress={openPicker}
          >
            <Ionicons
              name={icon}
              size={22}
              color={iconColor}
              style={styles.cardIcon}
            />
            <Text style={styles.cardLabel}>{cardLabel}</Text>
            <Text style={styles.cardValue}>{displayValue}</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        </View>
        {extraContent}
      </ScrollView>

      <Modal
        visible={showPicker}
        transparent
        animationType="none"
        onRequestClose={closePicker}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={closePicker}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.sheetContainer}>
            <Animated.View
              style={[styles.sheet, { transform: [{ translateY }] }]}
            >
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>
              <View style={styles.sheetHeader}>
                <TouchableOpacity onPress={closePicker} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
                <Text style={styles.sheetTitle}>{sheetTitle}</Text>
                <View style={{ width: 32 }} />
              </View>
              <ScrollView
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingBottom: 32,
                }}
              >
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.optionRow}
                    onPress={() => handleSelect(option.value)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      {option.description && (
                        <Text style={styles.optionDesc}>
                          {option.description}
                        </Text>
                      )}
                    </View>
                    {selected === option.value && (
                      <Ionicons name="checkmark" size={20} color="#34C759" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  scrollView: { flex: 1 },
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 16,
    marginHorizontal: 20,
    letterSpacing: 0.5,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  lastRow: { borderBottomWidth: 0 },
  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 16, fontWeight: "500", color: "#FFFFFF", flex: 1 },
  cardValue: { fontSize: 14, color: "#8E8E93", marginRight: 8 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheetContainer: { position: "absolute", bottom: 0, left: 0, right: 0 },
  sheet: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleContainer: { paddingVertical: 8, alignItems: "center" },
  handle: { width: 40, height: 4, backgroundColor: "#3A3A3C", borderRadius: 2 },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    flex: 1,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  optionLabel: { fontSize: 16, color: "#fff", marginBottom: 2 },
  optionDesc: { fontSize: 14, color: "#888" },
});

export default OptionPickerScreen;
