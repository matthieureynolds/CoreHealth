import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecordDetailsSectionProps {
  selectedType: string;
  name: string;
  onNameChange: (value: string) => void;
  recordDate: Date | null;
  dateMode: 'year' | 'yearMonth' | 'full';
  onDateModeChange: (mode: 'year' | 'yearMonth' | 'full') => void;
  onShowDatePicker: () => void;
  onShowTypePicker: () => void;
  tags: string;
  onTagsChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  getTypeIcon: (type: string) => string;
  getTypeLabel: (type: string) => string;
  getTypeColor: (type: string) => string;
  formatDateForMode: (d: Date | null, mode: 'year' | 'yearMonth' | 'full') => string;
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
  <View style={styles.detailsSection}>
    <Text style={styles.sectionTitle}>Record Details</Text>

    {/* Record Type */}
    <TouchableOpacity style={styles.inputContainer} onPress={onShowTypePicker}>
      <Text style={styles.inputLabel}>Record Type:</Text>
      <View style={styles.inputRow}>
        <Ionicons name={getTypeIcon(selectedType) as any} size={20} color={getTypeColor(selectedType)} />
        <Text style={styles.inputText}>{getTypeLabel(selectedType)}</Text>
        <Ionicons name="chevron-down" size={20} color="#888" />
      </View>
    </TouchableOpacity>

    {/* Record Name */}
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Record Name: *</Text>
      <TextInput
        style={styles.textInput}
        value={name}
        onChangeText={onNameChange}
        placeholder="e.g., Blood Test Results, X-Ray Report"
        placeholderTextColor="#666"
      />
    </View>

    {/* Date */}
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Date:</Text>
      <View style={styles.dateModeRow}>
        {(['year', 'yearMonth', 'full'] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.dateModeChip, dateMode === mode && styles.dateModeChipActive]}
            onPress={() => onDateModeChange(mode)}
          >
            <Text style={[styles.dateModeText, dateMode === mode && styles.dateModeTextActive]}>
              {mode === 'year' ? 'Year' : mode === 'yearMonth' ? 'Year-Month' : 'Full'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.inputRow} onPress={onShowDatePicker}>
        <Ionicons name="calendar-outline" size={20} color="#007AFF" />
        <Text style={styles.inputText}>
          {recordDate ? formatDateForMode(recordDate, dateMode) : 'Select date'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#888" />
      </TouchableOpacity>
    </View>

    {/* Tags */}
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Tags: (Optional)</Text>
      <TextInput
        style={styles.textInput}
        value={tags}
        onChangeText={onTagsChange}
        placeholder="e.g., cardiology, urgent, follow-up"
        placeholderTextColor="#666"
      />
    </View>

    {/* Notes */}
    <View style={[styles.inputContainer, { marginBottom: 0 }]}>
      <Text style={styles.inputLabel}>Notes: (Optional)</Text>
      <TextInput
        style={[styles.textInput, styles.textArea]}
        value={notes}
        onChangeText={onNotesChange}
        placeholder="Add any additional notes about this record"
        placeholderTextColor="#666"
        multiline
        numberOfLines={3}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  detailsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    marginLeft: 8,
  },
  textInput: {
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateModeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dateModeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333',
  },
  dateModeChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dateModeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  dateModeTextActive: {
    color: '#fff',
  },
});

export default RecordDetailsSection;
