import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PickerFieldProps {
  label: string;
  value: string;
  onPress: () => void;
  placeholder?: string;
}

const PickerField: React.FC<PickerFieldProps> = ({
  label,
  value,
  onPress,
  placeholder = "Select option",
}) => (
  <View style={styles.formField}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TouchableOpacity style={styles.pickerButton} onPress={onPress}>
      <Text style={[styles.pickerText, !value && styles.pickerPlaceholder]}>
        {value || placeholder}
      </Text>
      <Ionicons name="chevron-down" size={20} color="#3AABF0" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  pickerButton: {
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  pickerText: {
    fontSize: 16,
    color: "#1C1C1E",
  },
  pickerPlaceholder: {
    color: "#8E8E93",
  },
});

export default PickerField;
