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
import { Ionicons } from '@expo/vector-icons';
import { Vaccination, AttachedFile } from '../../../../../../../shared/types';
import { DateMode } from './DateModeSelector';
import VaccineNameField from './VaccineNameField';
import DateField from './DateField';
import AttachmentsSection from './AttachmentsSection';

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
    transparent
    animationType="fade"
    statusBarTranslucent
    onRequestClose={onCancel}
  >
    <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onCancel}>
      <TouchableOpacity style={s.sheet} activeOpacity={1} onPress={() => {}}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={onCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={22} color="#FF3B30" />
          </TouchableOpacity>
          <Text style={s.title}>
            {editingVaccination ? 'Edit Vaccination' : 'Add Vaccination'}
          </Text>
          <TouchableOpacity onPress={onSave} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="checkmark" size={22} color="#34C759" />
          </TouchableOpacity>
        </View>

        {/* Body */}
        <ScrollView style={s.body} keyboardShouldPersistTaps="handled">
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
            label="Next Due Date:"
            date={nextDueDate}
            setDate={setNextDueDate}
            showPicker={showNextDuePicker}
            setShowPicker={setShowNextDuePicker}
            dateMode={dateModeNextDue}
            setDateMode={setDateModeNextDue}
            minimumDate={new Date()}
          />

          {/* Location + Batch Number grouped */}
          <Text style={s.sectionLabel}>Details</Text>
          <View style={s.group}>
            <TextInput
              style={s.groupInput}
              value={location}
              onChangeText={setLocation}
              placeholder="Location (e.g., Doctor's office, Pharmacy)"
              placeholderTextColor="#555"
            />
            <View style={s.divider} />
            <TextInput
              style={s.groupInput}
              value={batchNumber}
              onChangeText={setBatchNumber}
              placeholder="Batch number (e.g., ABC123456)"
              placeholderTextColor="#555"
            />
          </View>

          {/* Notes grouped */}
          <Text style={s.sectionLabel}>Notes</Text>
          <View style={s.group}>
            <TextInput
              style={[s.groupInput, s.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes about this vaccination"
              placeholderTextColor="#555"
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
      </TouchableOpacity>
    </TouchableOpacity>
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
    maxHeight: '90%',
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  body: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});

export default VaccinationFormModal;
