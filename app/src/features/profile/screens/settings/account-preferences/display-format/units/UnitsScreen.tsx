import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "@shared/context/SettingsContext";
import OptionPickerScreen from "../components/OptionPickerScreen";

const options = [
  { value: "metric", label: "Metric", description: "Celsius, kg, cm" },
  { value: "imperial", label: "Imperial", description: "Fahrenheit, lbs, ft" },
];

const UnitsInfoCard = () => (
  <View style={infoStyles.card}>
    <Text style={infoStyles.cardHeader}>ABOUT</Text>
    <View style={infoStyles.infoRow}>
      <Ionicons
        name="information-circle-outline"
        size={18}
        color="#8E8E93"
        style={{ marginRight: 12 }}
      />
      <Text style={infoStyles.infoText}>
        Metric uses Celsius, kilograms, and centimetres. Imperial uses
        Fahrenheit, pounds, and feet.
      </Text>
    </View>
  </View>
);

const infoStyles = StyleSheet.create({
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
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  infoText: { flex: 1, fontSize: 13, color: "#8E8E93", lineHeight: 18 },
});

const UnitsScreen: React.FC = () => {
  const { settings, updateGeneralSettings } = useSettings();
  const selected = settings.general.units;
  const currentOption = options.find((o) => o.value === selected);

  return (
    <OptionPickerScreen
      headerTitle="Units"
      cardHeader="MEASUREMENT UNITS"
      sheetTitle="Units"
      icon="scale-outline"
      iconColor="#FF9500"
      cardLabel="Units"
      options={options}
      selected={selected}
      displayValue={currentOption?.label ?? selected}
      onSelect={(value) => updateGeneralSettings({ units: value as any })}
      extraContent={<UnitsInfoCard />}
    />
  );
};

export default UnitsScreen;
