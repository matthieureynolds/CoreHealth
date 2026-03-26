import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export const APPOINTMENT_TYPES = [
  'Dentist', 'GP / Primary Care', 'Cardiologist', 'Eye Test / Ophthalmologist',
  'Blood Test', 'Vaccination', 'Physiotherapist', 'Dermatologist', 'Gynecologist',
  'Urologist', 'Orthopedic', 'Neurologist', 'Psychiatrist', 'Nutritionist',
  'Chiropractor', 'Acupuncturist', 'Massage Therapy', 'X-Ray / Imaging',
  'Surgery Consultation', 'Follow-up Appointment', 'Emergency Room', 'Urgent Care',
  'Specialist Consultation', 'Lab Work', 'Physical Therapy', 'Mental Health',
  'Dental Cleaning', 'Root Canal', 'Crown / Bridge', 'Wisdom Teeth',
  'Cancer Screening', 'Mammogram', 'Colonoscopy', 'Endoscopy', 'Biopsy',
  'Allergy Testing', 'Sleep Study', 'Cardiac Stress Test', 'Echocardiogram',
  'MRI Scan', 'CT Scan', 'Ultrasound', 'Bone Density Test', 'Hormone Testing',
  'Thyroid Function', 'Diabetes Management', 'Hypertension Check',
  'Cholesterol Screening', 'Liver Function Test', 'Kidney Function Test',
  'Vitamin D Test', 'Iron Studies', 'Pregnancy Test', 'STI Testing',
  'Travel Vaccination', 'Flu Shot', 'COVID-19 Vaccine', 'Other',
];

// ── Title field with autocomplete suggestions ─────────────────────────────────
interface TitleFieldProps {
  value: string;
  onChange: (text: string) => void;
  showSuggestions: boolean;
  suggestions: string[];
  onSelectSuggestion: (item: string) => void;
}

export const TitleField: React.FC<TitleFieldProps> = ({
  value, onChange, showSuggestions, suggestions, onSelectSuggestion,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>Appointment Type *</Text>
    <TextInput
      placeholder="e.g., Blood Test, Dentist, Physical Therapy"
      placeholderTextColor="#888"
      value={value}
      onChangeText={onChange}
      style={styles.input}
    />
    {showSuggestions && suggestions.length > 0 && (
      <View style={styles.suggestions}>
        {suggestions.slice(0, 8).map(item => (
          <TouchableOpacity key={item} style={styles.suggestionItem} onPress={() => onSelectSuggestion(item)}>
            <Text style={styles.suggestionText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
);

// ── Simple text input field ───────────────────────────────────────────────────
interface TextFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (text: string) => void;
  multiline?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({
  label, placeholder, value, onChange, multiline = false,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#888"
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      style={[styles.input, multiline && { textAlignVertical: 'top' }]}
    />
  </View>
);

// ── Date & time picker field ──────────────────────────────────────────────────
interface DateTimeFieldProps {
  date: Date | null;
  showPicker: boolean;
  dateLabel: string;
  onPress: () => void;
  onPickerChange: (event: any, selectedDate?: Date) => void;
}

export const DateTimeField: React.FC<DateTimeFieldProps> = ({
  date, showPicker, dateLabel, onPress, onPickerChange,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>Date & Time *</Text>
    <TouchableOpacity onPress={onPress} style={styles.dateButton}>
      <Ionicons name="calendar" size={20} color="#3AABF0" />
      <Text style={[styles.dateText, { color: date ? '#fff' : '#888' }]}>
        {date ? dateLabel : 'Select Date & Time'}
      </Text>
    </TouchableOpacity>
    {showPicker && (
      <DateTimePicker
        value={date || new Date()}
        mode="datetime"
        display="default"
        onChange={onPickerChange}
      />
    )}
  </View>
);

// ── File attachment field ─────────────────────────────────────────────────────
interface AttachFileFieldProps {
  attachedDoc: { uri: string; name: string; type?: string } | null;
  onAttach: () => void;
  onRemove: () => void;
}

export const AttachFileField: React.FC<AttachFileFieldProps> = ({
  attachedDoc, onAttach, onRemove,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>Attach Files (optional)</Text>
    <TouchableOpacity style={styles.attachButton} onPress={onAttach}>
      <Ionicons name="attach" size={20} color="#3AABF0" />
      <Text style={styles.attachButtonText}>
        {attachedDoc ? 'File Attached' : 'Attach File'}
      </Text>
    </TouchableOpacity>
    {attachedDoc && (
      <View style={styles.attachedFile}>
        <Ionicons name="document" size={16} color="#30D158" />
        <Text style={styles.attachedFileName}>{attachedDoc.name}</Text>
        <TouchableOpacity onPress={onRemove} style={styles.removeFile}>
          <Ionicons name="close-circle" size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#3A3A3C', borderRadius: 8, padding: 12, color: '#FFFFFF', fontSize: 16 },
  suggestions: { backgroundColor: '#3A3A3C', borderRadius: 8, marginTop: 4, maxHeight: 200 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  suggestionText: { color: '#FFFFFF', fontSize: 14 },
  dateButton: { backgroundColor: '#3A3A3C', borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 16, marginLeft: 8 },
  attachButton: { backgroundColor: '#3A3A3C', borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  attachButtonText: { color: '#3AABF0', fontSize: 16, marginLeft: 8 },
  attachedFile: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', borderRadius: 8, padding: 8, marginTop: 8 },
  attachedFileName: { color: '#FFFFFF', fontSize: 14, marginLeft: 8, flex: 1 },
  removeFile: { padding: 4 },
});
