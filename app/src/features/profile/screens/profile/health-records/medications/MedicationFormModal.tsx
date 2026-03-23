import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IOSDatePicker from '../../../../../../shared/components/ui/IOSDatePicker';
import { Medication, AttachedFile } from '../../../../../../shared/types';
import * as DocumentPicker from 'expo-document-picker';

const COMMON_MEDICATIONS = [
  'Aspirin', 'Ibuprofen', 'Acetaminophen', 'Omeprazole', 'Lisinopril',
  'Metformin', 'Atorvastatin', 'Amlodipine', 'Losartan', 'Metoprolol',
  'Hydrochlorothiazide', 'Sertraline', 'Escitalopram', 'Bupropion',
  'Albuterol', 'Fluticasone', 'Montelukast', 'Levothyroxine', 'Warfarin',
  'Insulin', 'Glipizide', 'Gabapentin', 'Pregabalin', 'Tramadol',
  'Vitamin D', 'Vitamin B12', 'Iron', 'Calcium', 'Magnesium', 'Zinc', 'Omega-3',
];

interface MedicationFormModalProps {
  visible: boolean;
  editingMedication: Medication | null;
  onClose: () => void;
  onSave: (medication: Medication) => void;
}

const MedicationFormModal: React.FC<MedicationFormModalProps> = ({
  visible, editingMedication, onClose, onSave,
}) => {
  const [medicationName, setMedicationName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [dateModeStart, setDateModeStart] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [dateModeEnd, setDateModeEnd] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);

  useEffect(() => {
    if (visible) {
      if (editingMedication) {
        setMedicationName(editingMedication.name);
        setDosage(editingMedication.dosage || '');
        setFrequency(editingMedication.frequency || '');
        setStartDate(editingMedication.startDate ? new Date(editingMedication.startDate) : null);
        setEndDate(editingMedication.endDate ? new Date(editingMedication.endDate) : null);
        setDuration(editingMedication.duration || '');
        setNotes(editingMedication.notes || '');
        setAttachments(editingMedication.attachments || []);
      } else {
        setMedicationName(''); setShowSuggestions(false); setDosage(''); setFrequency('');
        setStartDate(null); setShowStartDatePicker(false); setEndDate(null); setShowEndDatePicker(false);
        setDateModeStart('full'); setDateModeEnd('full'); setDuration(''); setNotes(''); setAttachments([]);
      }
    }
  }, [visible, editingMedication]);

  const handleSave = () => {
    if (!medicationName.trim()) { Alert.alert('Error', 'Please enter a medication name'); return; }
    onSave({
      id: editingMedication?.id ?? Date.now().toString(),
      name: medicationName.trim(),
      dosage: dosage.trim() || undefined,
      frequency: frequency.trim() || undefined,
      startDate: (startDate || new Date()).toISOString().split('T')[0],
      endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
      duration: duration.trim() || undefined,
      notes: notes.trim() || undefined,
      attachments: attachments.length ? attachments : undefined,
    });
  };

  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.length) {
        const a = result.assets[0];
        setAttachments(prev => [...prev, { uri: a.uri, name: a.name || 'attachment', type: a.mimeType }]);
      }
    } catch { Alert.alert('Attachment Error', 'Failed to attach file.'); }
  };

  const fmt = (d: Date | null, mode: 'year' | 'yearMonth' | 'full') => {
    if (!d) return 'Select date';
    const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0');
    if (mode === 'year') return `${y}`; if (mode === 'yearMonth') return `${y}-${m}`; return `${y}-${m}-${day}`;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="overFullScreen" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancelButton}>Cancel</Text></TouchableOpacity>
          <Text style={styles.title}>{editingMedication ? 'Edit Medication' : 'Add Medication'}</Text>
          <TouchableOpacity onPress={handleSave}><Text style={styles.saveButton}>Save</Text></TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Medication Name *:</Text>
            <TextInput style={styles.textInput} value={medicationName} onChangeText={(t) => { setMedicationName(t); setShowSuggestions(t.length > 0); }} placeholder="e.g., Aspirin, Metformin" placeholderTextColor="#666" />
            {showSuggestions && medicationName.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {COMMON_MEDICATIONS.filter(m => m.toLowerCase().includes(medicationName.toLowerCase())).slice(0, 5).map((s, i) => (
                  <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => { setMedicationName(s); setShowSuggestions(false); }}>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Dosage:</Text>
            <TextInput style={styles.textInput} value={dosage} onChangeText={setDosage} placeholder="e.g., 500mg, 10mg" placeholderTextColor="#666" />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Frequency:</Text>
            <TextInput style={styles.textInput} value={frequency} onChangeText={setFrequency} placeholder="e.g., Twice daily, Once a week" placeholderTextColor="#666" />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Start Date:</Text>
            <View style={styles.dateModeRow}>
              {(['year', 'yearMonth', 'full'] as const).map(mode => (
                <TouchableOpacity key={mode} style={[styles.dateModeChip, dateModeStart === mode && styles.dateModeChipActive]} onPress={() => setDateModeStart(mode)}>
                  <Text style={[styles.dateModeText, dateModeStart === mode && styles.dateModeTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartDatePicker(true)}>
              <Text style={[styles.dateInputText, !startDate && styles.placeholderText]}>{fmt(startDate, dateModeStart)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#888" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>End Date (Optional):</Text>
            <View style={styles.dateModeRow}>
              {(['year', 'yearMonth', 'full'] as const).map(mode => (
                <TouchableOpacity key={mode} style={[styles.dateModeChip, dateModeEnd === mode && styles.dateModeChipActive]} onPress={() => setDateModeEnd(mode)}>
                  <Text style={[styles.dateModeText, dateModeEnd === mode && styles.dateModeTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndDatePicker(true)}>
              <Text style={[styles.dateInputText, !endDate && styles.placeholderText]}>{fmt(endDate, dateModeEnd)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#888" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Duration (Optional):</Text>
            <TextInput style={styles.textInput} value={duration} onChangeText={setDuration} placeholder="e.g., 30 days, 3 months" placeholderTextColor="#666" />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Notes (Optional):</Text>
            <TextInput style={[styles.textInput, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Add any additional notes" placeholderTextColor="#666" multiline numberOfLines={3} />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Attachments:</Text>
            <View style={styles.attachmentsRow}>
              {attachments.map(file => (
                <View key={file.uri} style={styles.attachmentChip}>
                  <Ionicons name={file.type?.includes('pdf') ? 'document-outline' : 'image-outline'} size={14} color="#FFFFFF" />
                  <Text style={styles.attachmentText} numberOfLines={1}>{file.name}</Text>
                  <TouchableOpacity onPress={() => setAttachments(prev => prev.filter(a => a.name !== file.name))} style={styles.attachmentRemove}>
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addAttachmentButton} onPress={handleAttachFile}>
                <Ionicons name="attach" size={16} color="#007AFF" />
                <Text style={styles.addAttachmentText}>Add file</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.attachmentsHelp}>PDFs and images are supported.</Text>
          </View>
        </ScrollView>
        {showStartDatePicker && <IOSDatePicker visible title="Start Date" value={startDate ?? new Date()} maximumDate={new Date()} onConfirm={(d) => { setStartDate(d); setShowStartDatePicker(false); }} onCancel={() => setShowStartDatePicker(false)} />}
        {showEndDatePicker && <IOSDatePicker visible title="End Date" value={endDate ?? new Date()} onConfirm={(d) => { setEndDate(d); setShowEndDatePicker(false); }} onCancel={() => setShowEndDatePicker(false)} />}
      </View>
    </Modal>
  );
};

export default MedicationFormModal;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  cancelButton: { fontSize: 16, color: '#007AFF' },
  title: { fontSize: 18, fontWeight: '600', color: '#fff' },
  saveButton: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  content: { flex: 1, padding: 20 },
  inputContainer: { marginBottom: 24 },
  inputLabel: { fontSize: 16, fontWeight: '500', color: '#fff', marginBottom: 8 },
  textInput: { backgroundColor: '#181818', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#fff' },
  textArea: { height: 80, textAlignVertical: 'top' },
  suggestionsContainer: { backgroundColor: '#181818', borderRadius: 8, marginTop: 4, maxHeight: 150 },
  suggestionItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  suggestionText: { color: '#fff', fontSize: 16 },
  dateInput: { backgroundColor: '#181818', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#333', minHeight: 48 },
  dateInputText: { fontSize: 16, color: '#fff', flex: 1 },
  placeholderText: { color: '#666' },
  dateModeRow: { flexDirection: 'row', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
  dateModeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#181818', borderWidth: 1, borderColor: '#333' },
  dateModeChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  dateModeText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  dateModeTextActive: { color: '#fff' },
  attachmentsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  attachmentChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#3A3A3C' },
  attachmentText: { color: '#FFFFFF', fontSize: 12, marginLeft: 6, maxWidth: 140 },
  attachmentRemove: { marginLeft: 6 },
  addAttachmentButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#007AFF' },
  addAttachmentText: { color: '#007AFF', fontSize: 12, marginLeft: 6, fontWeight: '600' },
  attachmentsHelp: { marginTop: 8, color: '#8E8E93', fontSize: 12 },
});
