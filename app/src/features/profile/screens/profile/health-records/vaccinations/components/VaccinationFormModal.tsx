import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Vaccination, AttachedFile } from '../../../../../../../shared/types';
import { DateMode } from './components/DateModeSelector';
import VaccineNameField from './components/VaccineNameField';
import DateField from './components/DateField';
import AttachmentsSection from './components/AttachmentsSection';

interface VaccinationFormModalProps {
  visible: boolean;
  editingVaccination: Vaccination | null;
  vaccineName: string;
  setVaccineName: (v: string) => void;
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
  dateReceived: Date | null;
  setDateReceived: (d: Date | null) => void;
  showDateReceivedPicker: boolean;
  setShowDateReceivedPicker: (v: boolean) => void;
  nextDueDate: Date | null;
  setNextDueDate: (d: Date | null) => void;
  showNextDuePicker: boolean;
  setShowNextDuePicker: (v: boolean) => void;
  dateModeReceived: DateMode;
  setDateModeReceived: (m: DateMode) => void;
  dateModeNextDue: DateMode;
  setDateModeNextDue: (m: DateMode) => void;
  location: string;
  setLocation: (v: string) => void;
  batchNumber: string;
  setBatchNumber: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  attachments: AttachedFile[];
  onRemoveAttachment: (name: string) => void;
  onAttachFile: () => void;
  onCancel: () => void;
  onSave: () => void;
  commonVaccines: string[];
}

const VaccinationFormModal: React.FC<VaccinationFormModalProps> = ({
  visible,
  editingVaccination,
  vaccineName,
  setVaccineName,
  showSuggestions,
  setShowSuggestions,
  dateReceived,
  setDateReceived,
  showDateReceivedPicker,
  setShowDateReceivedPicker,
  nextDueDate,
  setNextDueDate,
  showNextDuePicker,
  setShowNextDuePicker,
  dateModeReceived,
  setDateModeReceived,
  dateModeNextDue,
  setDateModeNextDue,
  location,
  setLocation,
  batchNumber,
  setBatchNumber,
  notes,
  setNotes,
  attachments,
  onRemoveAttachment,
  onAttachFile,
  onCancel,
  onSave,
  commonVaccines,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    presentationStyle="overFullScreen"
    statusBarTranslucent
    onRequestClose={onCancel}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>
          {editingVaccination ? 'Edit Vaccination' : 'Add Vaccination'}
        </Text>
        <TouchableOpacity onPress={onSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalContent}>
        <VaccineNameField
          vaccineName={vaccineName}
          setVaccineName={setVaccineName}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          commonVaccines={commonVaccines}
        />

        <DateField
          label="Date Received *:"
          date={dateReceived}
          setDate={setDateReceived}
          showPicker={showDateReceivedPicker}
          setShowPicker={setShowDateReceivedPicker}
          dateMode={dateModeReceived}
          setDateMode={setDateModeReceived}
          maximumDate={new Date()}
        />

        <DateField
          label="Next Due Date (Optional):"
          date={nextDueDate}
          setDate={setNextDueDate}
          showPicker={showNextDuePicker}
          setShowPicker={setShowNextDuePicker}
          dateMode={dateModeNextDue}
          setDateMode={setDateModeNextDue}
          minimumDate={new Date()}
        />

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Location (Optional):</Text>
          <TextInput
            style={styles.textInput}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., Doctor's office, Pharmacy"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Batch Number (Optional):</Text>
          <TextInput
            style={styles.textInput}
            value={batchNumber}
            onChangeText={setBatchNumber}
            placeholder="e.g., ABC123456"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Notes (Optional):</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional notes about this vaccination"
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
          />
        </View>

        <AttachmentsSection
          attachments={attachments}
          onRemoveAttachment={onRemoveAttachment}
          onAttachFile={onAttachFile}
        />
      </ScrollView>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});

export default VaccinationFormModal;
