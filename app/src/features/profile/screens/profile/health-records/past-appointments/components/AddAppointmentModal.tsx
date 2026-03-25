import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
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
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add appointment</Text>
          <TouchableOpacity onPress={onSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody}>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput style={styles.input} value={title} onChangeText={onChangeTitle} placeholder="e.g. Physical therapy, Dental checkup" placeholderTextColor="#8E8E93" />
          <Text style={styles.inputLabel}>Doctor</Text>
          <TextInput style={styles.input} value={doctor} onChangeText={onChangeDoctor} placeholder="Dr. name" placeholderTextColor="#8E8E93" />
          <Text style={styles.inputLabel}>Date</Text>
          <TouchableOpacity style={styles.input} onPress={onShowDatePicker}>
            <Text style={[styles.inputText, !appointmentDate && styles.placeholder]}>
              {appointmentDate ? formatDate(appointmentDate) : 'Select date'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={appointmentDate || new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
          <Text style={styles.inputLabel}>Location</Text>
          <TextInput style={styles.input} value={location} onChangeText={onChangeLoc} placeholder="Clinic or hospital" placeholderTextColor="#8E8E93" />
          <Text style={styles.inputLabel}>Notes</Text>
          <TextInput style={[styles.input, styles.notesInput]} value={notes} onChangeText={onChangeNotes} placeholder="Notes from the visit" placeholderTextColor="#8E8E93" multiline />
          <Text style={styles.inputLabel}>Attachment from doctor</Text>
          <TouchableOpacity style={styles.attachButton} onPress={onAttachFile}>
            <Ionicons name="document-attach" size={22} color="#007AFF" />
            <Text style={styles.attachButtonText}>
              {attachedFile ? attachedFile.name : 'Attach PDF or image'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  cancelButton: { fontSize: 16, color: '#8E8E93' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  saveButton: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  modalBody: { padding: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#8E8E93', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  inputText: { fontSize: 16, color: '#fff' },
  placeholder: { color: '#8E8E93' },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  attachButtonText: { fontSize: 16, color: '#007AFF', marginLeft: 10 },
});

export default AddAppointmentModal;
