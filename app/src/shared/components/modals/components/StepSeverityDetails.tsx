import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import Slider from "@react-native-community/slider";
import {
  SymptomCategory,
  DURATION_OPTIONS,
  SEVERITY_LABELS,
} from "@shared/types/symptoms";

interface StepSeverityDetailsProps {
  selectedType: "physical" | "mental" | null;
  selectedCategory: SymptomCategory | null;
  severity: number;
  onSeverityChange: (value: number) => void;
  duration: string;
  onDurationChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  factors: string[];
  onFactorToggle: (factor: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}

const availableFactors = [
  "Work",
  "Health",
  "Family",
  "Relationships",
  "Weather",
  "Sleep",
  "Exercise",
  "Diet",
  "Medication",
  "Stress",
];

const StepSeverityDetails: React.FC<StepSeverityDetailsProps> = ({
  selectedType,
  selectedCategory,
  severity,
  onSeverityChange,
  duration,
  onDurationChange,
  location,
  onLocationChange,
  factors,
  onFactorToggle,
  notes,
  onNotesChange,
}) => {
  if (!selectedCategory) {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        Rate your {selectedCategory.name.toLowerCase()}
      </Text>

      <View style={styles.severityContainer}>
        <Text style={styles.severityLabel}>
          Severity: {SEVERITY_LABELS[Math.round(severity) - 1]}
        </Text>
        {Slider ? (
          <Slider
            style={styles.severitySlider}
            minimumValue={1}
            maximumValue={10}
            value={severity}
            onValueChange={onSeverityChange}
            minimumTrackTintColor="#3AABF0"
            maximumTrackTintColor="#3A3A3C"
          />
        ) : (
          <Text style={styles.severityLabel}>Slider not available</Text>
        )}
        <View style={styles.severityLabels}>
          <Text style={styles.severityLabelText}>Mild</Text>
          <Text style={styles.severityLabelText}>Severe</Text>
        </View>
      </View>

      <View style={styles.durationContainer}>
        <Text style={styles.sectionTitle}>Duration</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.durationOptions}>
            {DURATION_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.durationOption,
                  duration === option.value && styles.durationOptionSelected,
                ]}
                onPress={() => onDurationChange(option.value)}
              >
                <Text
                  style={[
                    styles.durationOptionText,
                    duration === option.value &&
                      styles.durationOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {selectedType === "physical" && (
        <View style={styles.locationContainer}>
          <Text style={styles.sectionTitle}>Location (optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., head, chest, back"
            placeholderTextColor="#8E8E93"
            value={location}
            onChangeText={onLocationChange}
          />
        </View>
      )}

      <View style={styles.factorsContainer}>
        <Text style={styles.sectionTitle}>
          What's affecting you? (optional)
        </Text>
        <View style={styles.factorsGrid}>
          {availableFactors.map((factor) => (
            <TouchableOpacity
              key={factor}
              style={[
                styles.factorChip,
                factors.includes(factor) && styles.factorChipSelected,
              ]}
              onPress={() => onFactorToggle(factor)}
            >
              <Text
                style={[
                  styles.factorChipText,
                  factors.includes(factor) && styles.factorChipTextSelected,
                ]}
              >
                {factor}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.notesContainer}>
        <Text style={styles.sectionTitle}>Notes (optional)</Text>
        <TextInput
          style={[styles.textInput, styles.notesInput]}
          placeholder="Any additional details..."
          placeholderTextColor="#8E8E93"
          value={notes}
          onChangeText={onNotesChange}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 24,
    textAlign: "center",
  },
  severityContainer: {
    marginBottom: 24,
  },
  severityLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  severitySlider: {
    width: "100%",
    height: 40,
  },
  severityLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  severityLabelText: {
    color: "#8E8E93",
    fontSize: 12,
  },
  durationContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  durationOptions: {
    flexDirection: "row",
    gap: 8,
  },
  durationOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#3A3A3C",
  },
  durationOptionSelected: {
    backgroundColor: "#3AABF0",
  },
  durationOptionText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  durationOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  locationContainer: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: "#3A3A3C",
    borderRadius: 12,
    padding: 16,
    color: "#FFFFFF",
    fontSize: 16,
  },
  factorsContainer: {
    marginBottom: 24,
  },
  factorsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  factorChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#3A3A3C",
  },
  factorChipSelected: {
    backgroundColor: "#3AABF0",
  },
  factorChipText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  factorChipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
});

export default StepSeverityDetails;
