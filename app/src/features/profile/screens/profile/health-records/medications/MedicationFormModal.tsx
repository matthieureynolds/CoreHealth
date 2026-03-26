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

  const filteredSuggestions = showSuggestions && medicationName.length > 0
    ? COMMON_MEDICATIONS.filter(m => m.toLowerCase().includes(medicationName.toLowerCase())).slice(0, 5)
    : [];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={s.sheet}>
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={22} color="#FF3B30" />
            </TouchableOpacity>
            <Text style={s.title}>{editingMedication ? 'Edit Medication' : 'Add Medication'}</Text>
            <TouchableOpacity onPress={handleSave} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="checkmark" size={22} color="#34C759" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={s.body}>
            {/* Medication Info */}
            <View style={s.group}>
              <TextInput style={s.gInput} placeholder="Medication Name *" placeholderTextColor="#8E8E93" value={medicationName} onChangeText={(t) => { setMedicationName(t); setShowSuggestions(t.length > 0); }} />
              {filteredSuggestions.length > 0 && (
                <View style={s.suggestions}>
                  {filteredSuggestions.map((sug, i) => (
                    <TouchableOpacity key={i} style={s.suggestionItem} onPress={() => { setMedicationName(sug); setShowSuggestions(false); }}>
                      <Text style={s.suggestionText}>{sug}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={s.gDivider} />
              <TextInput style={s.gInput} placeholder="Dosage (e.g. 500mg)" placeholderTextColor="#555" value={dosage} onChangeText={setDosage} />
              <View style={s.gDivider} />
              <TextInput style={s.gInput} placeholder="Frequency (e.g. Twice daily)" placeholderTextColor="#555" value={frequency} onChangeText={setFrequency} />
              <View style={s.gDivider} />
              <TextInput style={s.gInput} placeholder="Duration (e.g. 30 days)" placeholderTextColor="#555" value={duration} onChangeText={setDuration} />
            </View>

            {/* Start Date */}
            <Text style={s.sectionLabel}>Start Date</Text>
            <View style={s.chipRow}>
              {(['year', 'yearMonth', 'full'] as const).map(mode => (
                <TouchableOpacity key={mode} style={[s.chip, dateModeStart === mode && s.chipActive]} onPress={() => setDateModeStart(mode)}>
                  <Text style={[s.chipText, dateModeStart === mode && s.chipTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.dateRow} onPress={() => setShowStartDatePicker(true)}>
              <Text style={[s.dateText, !startDate && { color: '#555' }]}>{fmt(startDate, dateModeStart)}</Text>
              <Ionicons name="calendar-outline" size={18} color="#8E8E93" />
            </TouchableOpacity>

            {/* End Date */}
            <Text style={s.sectionLabel}>End Date</Text>
            <View style={s.chipRow}>
              {(['year', 'yearMonth', 'full'] as const).map(mode => (
                <TouchableOpacity key={mode} style={[s.chip, dateModeEnd === mode && s.chipActive]} onPress={() => setDateModeEnd(mode)}>
                  <Text style={[s.chipText, dateModeEnd === mode && s.chipTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.dateRow} onPress={() => setShowEndDatePicker(true)}>
              <Text style={[s.dateText, !endDate && { color: '#555' }]}>{fmt(endDate, dateModeEnd)}</Text>
              <Ionicons name="calendar-outline" size={18} color="#8E8E93" />
            </TouchableOpacity>

            {/* Notes */}
            <View style={[s.group, { marginTop: 20 }]}>
              <TextInput style={[s.gInput, { height: 70, textAlignVertical: 'top', paddingTop: 14 }]} placeholder="Notes" placeholderTextColor="#555" value={notes} onChangeText={setNotes} multiline />
            </View>

            {/* Attachments */}
            <Text style={s.sectionLabel}>Attachments</Text>
            <View style={s.attachRow}>
              {attachments.map(file => (
                <View key={file.uri} style={s.attachChip}>
                  <Ionicons name={file.type?.includes('pdf') ? 'document-outline' : 'image-outline'} size={14} color="#FFFFFF" />
                  <Text style={s.attachText} numberOfLines={1}>{file.name}</Text>
                  <TouchableOpacity onPress={() => setAttachments(prev => prev.filter(a => a.name !== file.name))}>
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={s.addAttach} onPress={handleAttachFile}>
                <Ionicons name="attach" size={16} color="#3AABF0" />
                <Text style={s.addAttachText}>Add file</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.attachHelp}>PDFs and images are supported.</Text>
          </ScrollView>

          {showStartDatePicker && <IOSDatePicker visible title="Start Date" value={startDate ?? new Date()} maximumDate={new Date()} onConfirm={(d) => { setStartDate(d); setShowStartDatePicker(false); }} onCancel={() => setShowStartDatePicker(false)} />}
          {showEndDatePicker && <IOSDatePicker visible title="End Date" value={endDate ?? new Date()} onConfirm={(d) => { setEndDate(d); setShowEndDatePicker(false); }} onCancel={() => setShowEndDatePicker(false)} />}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default MedicationFormModal;

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  title: { fontSize: 18, fontWeight: '700', color: '#fff' },
  body: { padding: 20, paddingBottom: 40 },
  group: { backgroundColor: '#2C2C2E', borderRadius: 12, overflow: 'hidden' },
  gInput: { paddingHorizontal: 16, paddingVertical: 13, fontSize: 16, color: '#FFFFFF' },
  gDivider: { height: 1, backgroundColor: '#3A3A3C', marginLeft: 16 },
  suggestions: { backgroundColor: '#3A3A3C', marginHorizontal: 16, borderRadius: 8, marginBottom: 4 },
  suggestionItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  suggestionText: { color: '#fff', fontSize: 15 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginTop: 20, marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2C2C2E', borderWidth: 1, borderColor: '#3A3A3C' },
  chipActive: { backgroundColor: '#3AABF0', borderColor: '#3AABF0' },
  chipText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  dateRow: { backgroundColor: '#2C2C2E', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText: { fontSize: 16, color: '#fff' },
  attachRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  attachChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, gap: 6, borderWidth: 1, borderColor: '#3A3A3C' },
  attachText: { color: '#FFFFFF', fontSize: 12, maxWidth: 140 },
  addAttach: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#3AABF0', gap: 6 },
  addAttachText: { color: '#3AABF0', fontSize: 12, fontWeight: '600' },
  attachHelp: { marginTop: 8, color: '#555', fontSize: 12 },
});
