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

interface AppointmentFieldsProps {
  title: string;
  doctor: string;
  location: string;
  date: Date | null;
  notes: string;
  attachedDoc: { uri: string; name: string; type?: string } | null;
  showDatePicker: boolean;
  showSuggestions: boolean;
  filteredSuggestions: string[];
  dateLabel: string;
  onTitleChange: (text: string) => void;
  onDoctorChange: (text: string) => void;
  onLocationChange: (text: string) => void;
  onDatePress: () => void;
  onPickerChange: (event: any, selectedDate?: Date) => void;
  onNotesChange: (text: string) => void;
  onAttach: () => void;
  onRemoveAttachment: () => void;
  onSelectSuggestion: (item: string) => void;
}

export const AppointmentFields: React.FC<AppointmentFieldsProps> = ({
  title, doctor, location, date, notes, attachedDoc,
  showDatePicker, showSuggestions, filteredSuggestions, dateLabel,
  onTitleChange, onDoctorChange, onLocationChange,
  onDatePress, onPickerChange, onNotesChange,
  onAttach, onRemoveAttachment, onSelectSuggestion,
}) => (
  <>
    {/* Group 1: Appointment type + Doctor */}
    <View style={s.group}>
      <TextInput
        style={s.groupInput}
        value={title}
        onChangeText={onTitleChange}
        placeholder="Appointment type *"
        placeholderTextColor="#8E8E93"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={s.suggestions}>
          {filteredSuggestions.slice(0, 8).map(item => (
            <TouchableOpacity key={item} style={s.suggestionItem} onPress={() => onSelectSuggestion(item)}>
              <Text style={s.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={s.divider} />
      <TextInput
        style={s.groupInput}
        value={doctor}
        onChangeText={onDoctorChange}
        placeholder="Doctor name"
        placeholderTextColor="#555"
      />
    </View>

    {/* Group 2: Location */}
    <View style={[s.group, s.groupSpacing]}>
      <TextInput
        style={s.groupInput}
        value={location}
        onChangeText={onLocationChange}
        placeholder="Location"
        placeholderTextColor="#555"
      />
    </View>

    {/* Group 3: Date & Time + Notes */}
    <View style={[s.group, s.groupSpacing]}>
      <TouchableOpacity style={s.groupInput} onPress={onDatePress}>
        <View style={s.dateRow}>
          <Text style={[s.dateText, !date && s.placeholder]}>
            {date ? dateLabel : 'Date & time *'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
        </View>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="datetime"
          display="default"
          onChange={onPickerChange}
        />
      )}
      <View style={s.divider} />
      <TextInput
        style={[s.groupInput, s.notesInput]}
        value={notes}
        onChangeText={onNotesChange}
        placeholder="Notes"
        placeholderTextColor="#555"
        multiline
        textAlignVertical="top"
      />
    </View>

    {/* Attach file */}
    <TouchableOpacity style={[s.attachButton, s.groupSpacing]} onPress={onAttach}>
      <Ionicons name="document-attach" size={22} color="#3AABF0" />
      <Text style={s.attachButtonText}>
        {attachedDoc ? attachedDoc.name : 'Attach file'}
      </Text>
      {attachedDoc && (
        <TouchableOpacity onPress={onRemoveAttachment} style={s.removeFile} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color="#FF3B30" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  </>
);

const s = StyleSheet.create({
  group: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  groupSpacing: { marginTop: 20 },
  groupInput: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#3A3A3C',
    marginLeft: 16,
  },
  suggestions: {
    backgroundColor: '#3A3A3C',
    maxHeight: 200,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  suggestionText: { color: '#FFFFFF', fontSize: 14 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: { fontSize: 16, color: '#FFFFFF' },
  placeholder: { color: '#8E8E93' },
  notesInput: {
    minHeight: 80,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    borderStyle: 'dashed',
  },
  attachButtonText: {
    fontSize: 16,
    color: '#3AABF0',
    marginLeft: 10,
    flex: 1,
  },
  removeFile: { padding: 2 },
});
