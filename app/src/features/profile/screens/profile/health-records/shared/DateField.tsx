import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import IOSDatePicker from "@shared/components/ui/IOSDatePicker";
import { formModalStyles as s } from "./formModalStyles";
import { formatDateForMode, DateMode } from "./formatDateForMode";
import ChipSelector from "./ChipSelector";

const DATE_MODE_LABELS: Record<string, string> = { yearMonth: "Year-Month" };

interface DateFieldProps {
  label: string;
  value: Date | null;
  onChange: (d: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
  defaultMode?: DateMode;
}

const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  maximumDate,
  minimumDate,
  defaultMode = "full",
}) => {
  const [mode, setMode] = useState<DateMode>(defaultMode);
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <Text style={s.sectionLabel}>{label}</Text>
      <ChipSelector
        options={["year", "yearMonth", "full"] as const}
        selected={mode}
        onSelect={setMode}
        labelMap={DATE_MODE_LABELS}
      />
      <TouchableOpacity style={s.dateRow} onPress={() => setShowPicker(true)}>
        <Text style={[s.dateText, !value && s.placeholder]}>
          {formatDateForMode(value, mode)}
        </Text>
        <Ionicons name="calendar-outline" size={18} color="#8E8E93" />
      </TouchableOpacity>
      {showPicker && (
        <IOSDatePicker
          visible
          title={label}
          value={value ?? new Date()}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onConfirm={(d) => {
            onChange(d);
            setShowPicker(false);
          }}
          onCancel={() => setShowPicker(false)}
        />
      )}
    </>
  );
};

export default DateField;
