import React from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AddAppointmentModalProps {
  visible: boolean;
  title: string;
  doctor: string;
  appointmentDate: Date | null;
  location: string;
  notes: string;
  attachedFile: { uri: string; name: string; type?: string } | null;
  showDatePicker: boolean;
  onClose: () => void;
  onSave: () => void;
  onChangeTitle: (v: string) => void;
  onChangeDoctor: (v: string) => void;
  onChangeLoc: (v: string) => void;
  onChangeNotes: (v: string) => void;
  onShowDatePicker: () => void;
  onDateChange: (_: any, d?: Date) => void;
  onAttachFile: () => void;
  formatDate: (d: Date | string) => string;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  visible, title, doctor, appointmentDate, location, notes, attachedFile,
  showDatePicker, onClose, onSave, onChangeTitle, onChangeDoctor, onChangeLoc,
  onChangeNotes, onShowDatePicker, onDateChange, onAttachFile, formatDate,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={s.overlay}>
        <TouchableWithoutFeedback>
          <View style={s.sheet}>
            {/* Header */}
            <View style={s.header}>
              <TouchableOpacity onPress={onClose} hitSlop={8}>
                <Ionicons name="close" size={22} color="#FF3B30" />
              </TouchableOpacity>
              <Text style={s.headerTitle}>Add appointment</Text>
              <TouchableOpacity onPress={onSave} hitSlop={8}>
                <Ionicons name="checkmark" size={22} color="#34C759" />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <ScrollView style={s.body} keyboardShouldPersistTaps="handled">
              {/* Group 1: Title + Doctor + Date */}
              <View style={s.group}>
                <TextInput
                  style={s.groupInput}
                  value={title}
                  onChangeText={onChangeTitle}
                  placeholder="Title *"
                  placeholderTextColor="#8E8E93"
                />
                <View style={s.divider} />
                <TextInput
                  style={s.groupInput}
                  value={doctor}
                  onChangeText={onChangeDoctor}
                  placeholder="Doctor"
                  placeholderTextColor="#555"
                />
                <View style={s.divider} />
                <TouchableOpacity style={s.groupInput} onPress={onShowDatePicker}>
                  <View style={s.dateRow}>
                    <Text style={[s.dateText, !appointmentDate && s.placeholder]}>
                      {appointmentDate ? formatDate(appointmentDate) : 'Date'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
                  </View>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={appointmentDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}

              {/* Group 2: Location */}
              <View style={[s.group, { marginTop: 20 }]}>
                <TextInput
                  style={s.groupInput}
                  value={location}
                  onChangeText={onChangeLoc}
                  placeholder="Location"
                  placeholderTextColor="#555"
                />
              </View>

              {/* Group 3: Notes */}
              <View style={[s.group, { marginTop: 20 }]}>
                <TextInput
                  style={[s.groupInput, s.notesInput]}
                  value={notes}
                  onChangeText={onChangeNotes}
                  placeholder="Notes"
                  placeholderTextColor="#555"
                  multiline
                />
              </View>

              {/* Attachment */}
              <TouchableOpacity style={s.attachButton} onPress={onAttachFile}>
                <Ionicons name="document-attach" size={22} color="#3AABF0" />
                <Text style={s.attachButtonText}>
                  {attachedFile ? attachedFile.name : 'Attach PDF or image'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  body: {
    padding: 20,
    paddingBottom: 40,
  },
  group: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    overflow: 'hidden',
  },
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  placeholder: {
    color: '#555',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
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
    marginTop: 20,
  },
  attachButtonText: {
    fontSize: 16,
    color: '#3AABF0',
    marginLeft: 10,
  },
});

export default AddAppointmentModal;
