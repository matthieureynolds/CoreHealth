import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RecordDetailsSectionProps {
  selectedType: string;
  name: string;
  onNameChange: (value: string) => void;
  recordDate: Date | null;
  dateMode: "year" | "yearMonth" | "full";
  onDateModeChange: (mode: "year" | "yearMonth" | "full") => void;
  onShowDatePicker: () => void;
  onShowTypePicker: () => void;
  tags: string;
  onTagsChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  getTypeIcon: (type: string) => string;
  getTypeLabel: (type: string) => string;
  getTypeColor: (type: string) => string;
  formatDateForMode: (
    d: Date | null,
    mode: "year" | "yearMonth" | "full",
  ) => string;
}

const RecordDetailsSection: React.FC<RecordDetailsSectionProps> = ({
  selectedType,
  name,
  onNameChange,
  recordDate,
  dateMode,
  onDateModeChange,
  onShowDatePicker,
  onShowTypePicker,
  tags,
  onTagsChange,
  notes,
  onNotesChange,
  getTypeIcon,
  getTypeLabel,
  getTypeColor,
  formatDateForMode,
}) => (
  <View>
    {/* Record Type & Name */}
    <View style={s.group}>
      <TouchableOpacity style={s.typeRow} onPress={onShowTypePicker}>
        <Ionicons
          name={getTypeIcon(selectedType) as any}
          size={18}
          color={getTypeColor(selectedType)}
        />
        <Text style={s.typeText}>{getTypeLabel(selectedType)}</Text>
        <Ionicons name="chevron-down" size={18} color="#8E8E93" />
      </TouchableOpacity>
      <View style={s.divider} />
      <TextInput
        style={s.gInput}
        placeholder="Record Name *"
        placeholderTextColor="#8E8E93"
        value={name}
        onChangeText={onNameChange}
      />
      <View style={s.divider} />
      <TextInput
        style={s.gInput}
        placeholder="Tags (e.g. cardiology, urgent)"
        placeholderTextColor="#555"
        value={tags}
        onChangeText={onTagsChange}
      />
    </View>

    {/* Date */}
    <Text style={s.sectionLabel}>Date</Text>
    <View style={s.chipRow}>
      {(["year", "yearMonth", "full"] as const).map((mode) => (
        <TouchableOpacity
          key={mode}
          style={[s.chip, dateMode === mode && s.chipActive]}
          onPress={() => onDateModeChange(mode)}
        >
          <Text style={[s.chipText, dateMode === mode && s.chipTextActive]}>
            {mode === "year"
              ? "Year"
              : mode === "yearMonth"
                ? "Year-Month"
                : "Full"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    <TouchableOpacity style={s.dateRow} onPress={onShowDatePicker}>
      <Text style={[s.dateText, !recordDate && { color: "#555" }]}>
        {recordDate ? formatDateForMode(recordDate, dateMode) : "Select date"}
      </Text>
      <Ionicons name="calendar-outline" size={18} color="#8E8E93" />
    </TouchableOpacity>

    {/* Notes */}
    <View style={[s.group, { marginTop: 20 }]}>
      <TextInput
        style={[
          s.gInput,
          { height: 70, textAlignVertical: "top", paddingTop: 14 },
        ]}
        placeholder="Notes"
        placeholderTextColor="#555"
        value={notes}
        onChangeText={onNotesChange}
        multiline
      />
    </View>
  </View>
);

const s = StyleSheet.create({
  group: { backgroundColor: "#2C2C2E", borderRadius: 12, overflow: "hidden" },
  gInput: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: "#FFFFFF",
  },
  divider: { height: 1, backgroundColor: "#3A3A3C", marginLeft: 16 },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  typeText: { fontSize: 16, color: "#fff", flex: 1, marginLeft: 10 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#2C2C2E",
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },
  chipActive: { backgroundColor: "#3AABF0", borderColor: "#3AABF0" },
  chipText: { color: "#fff", fontSize: 13, fontWeight: "500" },
  chipTextActive: { color: "#fff" },
  dateRow: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: { fontSize: 16, color: "#fff" },
});

export default RecordDetailsSection;
