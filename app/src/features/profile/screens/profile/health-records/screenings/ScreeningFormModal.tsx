import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IOSDatePicker from '../../../../../../shared/components/ui/IOSDatePicker';
import { Screening, AttachedFile } from '../../../../../../shared/types';
import * as DocumentPicker from 'expo-document-picker';

const COMMON_SCREENINGS = [
  'Blood Pressure', 'Cholesterol', 'Blood Sugar', 'Hemoglobin A1C',
  'Complete Blood Count (CBC)', 'Comprehensive Metabolic Panel (CMP)',
  'Thyroid Function Test', 'PSA Test', 'Mammogram', 'Pap Smear',
  'Colonoscopy', 'Bone Density Test (DEXA)', 'Eye Exam', 'Dental Exam',
  'Skin Cancer Screening', 'Lung Cancer Screening', 'ECG/EKG',
  'Chest X-Ray', 'CT Scan', 'MRI', 'Ultrasound',
];

interface ScreeningFormModalProps {
  visible: boolean;
  editingScreening: Screening | null;
  onClose: () => void;
  onSave: (screening: Screening) => void;
}

const ScreeningFormModal: React.FC<ScreeningFormModalProps> = ({
  visible, editingScreening, onClose, onSave,
}) => {
  const [screeningName, setScreeningName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [screeningDate, setScreeningDate] = useState<Date | null>(null);
  const [showScreeningDatePicker, setShowScreeningDatePicker] = useState(false);
  const [result, setResult] = useState<'normal' | 'abnormal' | 'inconclusive'>('normal');
  const [nextDueDate, setNextDueDate] = useState<Date | null>(null);
  const [showNextDuePicker, setShowNextDuePicker] = useState(false);
  const [dateModeScreening, setDateModeScreening] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [dateModeNextDue, setDateModeNextDue] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);

  useEffect(() => {
    if (visible) {
      if (editingScreening) {
        setScreeningName(editingScreening.name);
        setScreeningDate(editingScreening.date ? new Date(editingScreening.date) : new Date());
        setResult(editingScreening.result);
        setNextDueDate(editingScreening.nextDue ? new Date(editingScreening.nextDue as any) : null);
        setLocation(editingScreening.location || '');
        setNotes(editingScreening.notes || '');
        setAttachments(editingScreening.attachments || []);
      } else {
        setScreeningName(''); setShowSuggestions(false); setScreeningDate(null); setShowScreeningDatePicker(false);
        setResult('normal'); setNextDueDate(null); setShowNextDuePicker(false);
        setDateModeScreening('full'); setDateModeNextDue('full');
        setLocation(''); setNotes(''); setAttachments([]);
      }
    }
  }, [visible, editingScreening]);

  const handleSave = () => {
    if (!screeningName.trim()) { Alert.alert('Error', 'Please enter a screening name'); return; }
    onSave({
      id: editingScreening?.id ?? Date.now().toString(),
      name: screeningName.trim(),
      date: screeningDate || new Date(),
      result,
      nextDue: nextDueDate || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      attachments: attachments.length ? attachments : undefined,
    });
  };

  const handleAttachFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.length) {
        const a = res.assets[0];
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
          <Text style={styles.title}>{editingScreening ? 'Edit Screening' : 'Add Screening'}</Text>
          <TouchableOpacity onPress={handleSave}><Text style={styles.saveButton}>Save</Text></TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Screening Name *:</Text>
            <TextInput style={styles.textInput} value={screeningName} onChangeText={(t) => { setScreeningName(t); setShowSuggestions(t.length > 0); }} placeholder="e.g., Blood Pressure, Mammogram" placeholderTextColor="#666" />
            {showSuggestions && screeningName.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {COMMON_SCREENINGS.filter(s => s.toLowerCase().includes(screeningName.toLowerCase())).slice(0, 5).map((s, i) => (
                  <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => { setScreeningName(s); setShowSuggestions(false); }}>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Screening Date *:</Text>
            <View style={styles.dateModeRow}>
              {(['year', 'yearMonth', 'full'] as const).map(mode => (
                <TouchableOpacity key={mode} style={[styles.dateModeChip, dateModeScreening === mode && styles.dateModeChipActive]} onPress={() => setDateModeScreening(mode)}>
                  <Text style={[styles.dateModeText, dateModeScreening === mode && styles.dateModeTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowScreeningDatePicker(true)}>
              <Text style={[styles.dateInputText, !screeningDate && styles.placeholderText]}>{fmt(screeningDate, dateModeScreening)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#888" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Result:</Text>
            <View style={styles.optionsContainer}>
              {(['normal', 'abnormal', 'inconclusive'] as const).map(opt => (
                <TouchableOpacity key={opt} style={[styles.optionButton, result === opt && styles.selectedOption]} onPress={() => setResult(opt)}>
                  <Text style={[styles.optionText, result === opt && styles.selectedOptionText]}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Next Due Date (Optional):</Text>
            <View style={styles.dateModeRow}>
              {(['year', 'yearMonth', 'full'] as const).map(mode => (
                <TouchableOpacity key={mode} style={[styles.dateModeChip, dateModeNextDue === mode && styles.dateModeChipActive]} onPress={() => setDateModeNextDue(mode)}>
                  <Text style={[styles.dateModeText, dateModeNextDue === mode && styles.dateModeTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowNextDuePicker(true)}>
              <Text style={[styles.dateInputText, !nextDueDate && styles.placeholderText]}>{fmt(nextDueDate, dateModeNextDue)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#888" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Location (Optional):</Text>
            <TextInput style={styles.textInput} value={location} onChangeText={setLocation} placeholder="e.g., City Medical Center" placeholderTextColor="#666" />
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
        {showScreeningDatePicker && <IOSDatePicker visible title="Screening Date" value={screeningDate ?? new Date()} maximumDate={new Date()} onConfirm={(d) => { setScreeningDate(d); setShowScreeningDatePicker(false); }} onCancel={() => setShowScreeningDatePicker(false)} />}
        {showNextDuePicker && <IOSDatePicker visible title="Next Due Date" value={nextDueDate ?? new Date()} onConfirm={(d) => { setNextDueDate(d); setShowNextDuePicker(false); }} onCancel={() => setShowNextDuePicker(false)} />}
      </View>
    </Modal>
  );
};

export default ScreeningFormModal;

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
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionButton: { backgroundColor: '#181818', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  selectedOption: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  optionText: { fontSize: 14, color: '#fff' },
  selectedOptionText: { color: '#fff', fontWeight: '600' },
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
