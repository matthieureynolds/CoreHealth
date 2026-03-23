import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'date-fns';
import { useSettings } from '../../../../shared/context/SettingsContext';
import type { MedicalEvent } from '../types';

export const APPOINTMENT_TYPES = [
  'Dentist',
  'GP / Primary Care',
  'Cardiologist',
  'Eye Test / Ophthalmologist',
  'Blood Test',
  'Vaccination',
  'Physiotherapist',
  'Dermatologist',
  'Gynecologist',
  'Urologist',
  'Orthopedic',
  'Neurologist',
  'Psychiatrist',
  'Nutritionist',
  'Chiropractor',
  'Acupuncturist',
  'Massage Therapy',
  'X-Ray / Imaging',
  'Surgery Consultation',
  'Follow-up Appointment',
  'Emergency Room',
  'Urgent Care',
  'Specialist Consultation',
  'Lab Work',
  'Physical Therapy',
  'Mental Health',
  'Dental Cleaning',
  'Root Canal',
  'Crown / Bridge',
  'Wisdom Teeth',
  'Cancer Screening',
  'Mammogram',
  'Colonoscopy',
  'Endoscopy',
  'Biopsy',
  'Allergy Testing',
  'Sleep Study',
  'Cardiac Stress Test',
  'Echocardiogram',
  'MRI Scan',
  'CT Scan',
  'Ultrasound',
  'Bone Density Test',
  'Hormone Testing',
  'Thyroid Function',
  'Diabetes Management',
  'Hypertension Check',
  'Cholesterol Screening',
  'Liver Function Test',
  'Kidney Function Test',
  'Vitamin D Test',
  'Iron Studies',
  'Pregnancy Test',
  'STI Testing',
  'Travel Vaccination',
  'Flu Shot',
  'COVID-19 Vaccine',
  'Other',
];

interface AddAppointmentModalProps {
  visible: boolean;
  editingEvent: MedicalEvent | null;
  onClose: () => void;
  onSave: (event: MedicalEvent) => void;
}

const formatDateBySetting = (date: Date, formatSetting: string): string => {
  if (formatSetting === 'DD/MM/YYYY') return format(date, 'dd/MM/yyyy');
  if (formatSetting === 'MM/DD/YYYY') return format(date, 'MM/dd/yyyy');
  return format(date, 'MMM d, yyyy');
};

const parseEventDate = (timeString: string): Date | null => {
  try {
    const timeParts = timeString.split('•');
    if (timeParts.length !== 2) return null;

    const datePart = timeParts[0].trim();
    const timePart = timeParts[1].trim();

    let dateToUse = new Date();
    if (datePart.toLowerCase().includes('today')) {
      dateToUse = new Date();
    } else if (datePart.toLowerCase().includes('tomorrow')) {
      dateToUse = new Date();
      dateToUse.setDate(dateToUse.getDate() + 1);
    } else {
      const parsed = new Date(datePart);
      if (!isNaN(parsed.getTime())) dateToUse = parsed;
    }

    const timeMatch = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3];
      if (ampm) {
        if (/pm/i.test(ampm) && hours < 12) hours += 12;
        if (/am/i.test(ampm) && hours === 12) hours = 0;
      }
      dateToUse.setHours(hours, minutes, 0, 0);
      return dateToUse;
    }
  } catch {
    // Fall through
  }
  return null;
};

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  visible,
  editingEvent,
  onClose,
  onSave,
}) => {
  const { settings } = useSettings();
  const translateY = useRef(new Animated.Value(1000)).current;

  const [title, setTitle] = useState('');
  const [doctor, setDoctor] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [attachedDoc, setAttachedDoc] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      if (editingEvent) {
        setTitle(editingEvent.title);
        setDoctor(editingEvent.doctor || '');
        setLocation(editingEvent.location || '');
        setNotes(editingEvent.notes || '');
        setAttachedDoc(editingEvent.attachedFile || null);
        setDate(parseEventDate(editingEvent.time));
      } else {
        resetForm();
      }
      translateY.setValue(1000);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [visible, editingEvent]);

  const resetForm = () => {
    setTitle('');
    setDoctor('');
    setLocation('');
    setDate(null);
    setNotes('');
    setAttachedDoc(null);
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    if (!title.trim() || !date) return;

    const dateFormatSetting = settings?.general?.dateFormat || 'DD/MM/YYYY';
    const is12h = settings?.general?.timeFormat === '12h';
    const timeString = `${formatDateBySetting(date, dateFormatSetting)} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: is12h })}`;

    const event: MedicalEvent = {
      id: editingEvent?.id ?? Date.now().toString(),
      title: title.trim(),
      subtitle: doctor || 'Appointment',
      time: timeString,
      status: editingEvent?.status ?? 'UPCOMING',
      icon: 'medical',
      iconColor: '#007AFF',
      doctor: doctor || undefined,
      notes: notes || undefined,
      location: location || undefined,
      attachedFile: attachedDoc || undefined,
    };

    onSave(event);
    resetForm();
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (text.length > 0) {
      const filtered = APPOINTMENT_TYPES.filter(t =>
        t.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  const selectSuggestion = (type: string) => {
    setTitle(type);
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  };

  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled) setAttachedDoc(result.assets[0]);
    } catch {
      // User cancelled or picker failed — no action needed
    }
  };

  const isValid = title.trim().length > 0 && date !== null;
  const dateFormatSetting = settings?.general?.dateFormat || 'DD/MM/YYYY';
  const is12h = settings?.general?.timeFormat === '12h';

  return (
    <Modal visible={visible} transparent animationType="none" presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View style={styles.sheetContainer}>
          <Animated.View style={[styles.sheetContent, { transform: [{ translateY }] }]}>
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <View style={styles.header} pointerEvents="box-none">
              <TouchableOpacity
                onPress={(e) => { e.stopPropagation(); handleClose(); }}
                style={styles.headerButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#FF3B30" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>
                {editingEvent ? 'Edit Appointment' : 'Add Appointment'}
              </Text>

              <TouchableOpacity
                onPress={(e) => { e.stopPropagation(); handleSave(); }}
                style={styles.headerButton}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                activeOpacity={0.6}
              >
                <Ionicons name="checkmark" size={24} color={isValid ? '#34C759' : '#8E8E93'} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.body}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.bodyContent}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Appointment Type *</Text>
                <TextInput
                  placeholder="e.g., Blood Test, Dentist, Physical Therapy"
                  placeholderTextColor="#888"
                  value={title}
                  onChangeText={handleTitleChange}
                  style={styles.input}
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <View style={styles.suggestions}>
                    {filteredSuggestions.slice(0, 8).map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={styles.suggestionItem}
                        onPress={() => selectSuggestion(item)}
                      >
                        <Text style={styles.suggestionText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Doctor Name (optional)</Text>
                <TextInput
                  placeholder="Dr. Smith"
                  placeholderTextColor="#888"
                  value={doctor}
                  onChangeText={setDoctor}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location (optional)</Text>
                <TextInput
                  placeholder="Clinic name or address"
                  placeholderTextColor="#888"
                  value={location}
                  onChangeText={setLocation}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date & Time *</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateButton}
                >
                  <Ionicons name="calendar" size={20} color="#007AFF" />
                  <Text style={[styles.dateText, { color: date ? '#fff' : '#888' }]}>
                    {date
                      ? `${formatDateBySetting(date, dateFormatSetting)} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: is12h })}`
                      : 'Select Date & Time'}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={date || new Date()}
                  mode="datetime"
                  display="default"
                  onChange={(_event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (optional)</Text>
                <TextInput
                  placeholder="Add details"
                  placeholderTextColor="#888"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, { textAlignVertical: 'top' }]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Attach Files (optional)</Text>
                <TouchableOpacity style={styles.attachButton} onPress={handleAttachFile}>
                  <Ionicons name="attach" size={20} color="#007AFF" />
                  <Text style={styles.attachButtonText}>
                    {attachedDoc ? 'File Attached' : 'Attach File'}
                  </Text>
                </TouchableOpacity>
                {attachedDoc && (
                  <View style={styles.attachedFile}>
                    <Ionicons name="document" size={16} color="#30D158" />
                    <Text style={styles.attachedFileName}>{attachedDoc.name}</Text>
                    <TouchableOpacity onPress={() => setAttachedDoc(null)} style={styles.removeFile}>
                      <Ionicons name="close-circle" size={16} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

export default AddAppointmentModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  sheetContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
  handleContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#3A3A3C',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  body: {
    flex: 0,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    marginLeft: 8,
  },
  suggestions: {
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  attachButton: {
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 8,
  },
  attachedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  attachedFileName: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  removeFile: {
    padding: 4,
  },
});
