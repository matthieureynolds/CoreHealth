import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, TouchableWithoutFeedback,
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
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={s.sheet}>
              {/* Header */}
              <View style={s.header}>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={22} color="#FF3B30" />
                </TouchableOpacity>
                <Text style={s.title}>{editingScreening ? 'Edit Screening' : 'Add Screening'}</Text>
                <TouchableOpacity onPress={handleSave} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="checkmark" size={22} color="#34C759" />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView style={s.body} keyboardShouldPersistTaps="handled">
                {/* Screening Name */}
                <View style={s.groupedBox}>
                  <TextInput
                    style={s.groupedInput}
                    value={screeningName}
                    onChangeText={(t) => { setScreeningName(t); setShowSuggestions(t.length > 0); }}
                    placeholder="Screening name *"
                    placeholderTextColor="#8E8E93"
                  />
                </View>
                {showSuggestions && screeningName.length > 0 && (
                  <View>
                    {COMMON_SCREENINGS.filter(x => x.toLowerCase().includes(screeningName.toLowerCase())).slice(0, 5).map((x, i) => (
                      <TouchableOpacity key={i} style={s.suggestionItem} onPress={() => { setScreeningName(x); setShowSuggestions(false); }}>
                        <Text style={s.suggestionText}>{x}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Screening Date */}
                <Text style={s.sectionLabel}>SCREENING DATE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {(['year', 'yearMonth', 'full'] as const).map(mode => (
                    <TouchableOpacity key={mode} style={[s.chip, dateModeScreening === mode && s.chipActive]} onPress={() => setDateModeScreening(mode)}>
                      <Text style={[s.chipText, dateModeScreening === mode && s.chipTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={s.dateRow} onPress={() => setShowScreeningDatePicker(true)}>
                  <Text style={[{ fontSize: 16, color: '#FFFFFF' }, !screeningDate && { color: '#8E8E93' }]}>{fmt(screeningDate, dateModeScreening)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
                </TouchableOpacity>

                {/* Result */}
                <Text style={s.sectionLabel}>RESULT</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {(['normal', 'abnormal', 'inconclusive'] as const).map(opt => (
                    <TouchableOpacity key={opt} style={[s.chip, result === opt && s.chipActive]} onPress={() => setResult(opt)}>
                      <Text style={[s.chipText, result === opt && s.chipTextActive]}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Next Due Date */}
                <Text style={s.sectionLabel}>NEXT DUE DATE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {(['year', 'yearMonth', 'full'] as const).map(mode => (
                    <TouchableOpacity key={mode} style={[s.chip, dateModeNextDue === mode && s.chipActive]} onPress={() => setDateModeNextDue(mode)}>
                      <Text style={[s.chipText, dateModeNextDue === mode && s.chipTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={s.dateRow} onPress={() => setShowNextDuePicker(true)}>
                  <Text style={[{ fontSize: 16, color: '#FFFFFF' }, !nextDueDate && { color: '#8E8E93' }]}>{fmt(nextDueDate, dateModeNextDue)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
                </TouchableOpacity>

                {/* Location & Notes */}
                <Text style={s.sectionLabel}>DETAILS</Text>
                <View style={s.groupedBox}>
                  <TextInput
                    style={s.groupedInput}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Location"
                    placeholderTextColor="#555"
                  />
                  <View style={s.divider} />
                  <TextInput
                    style={[s.groupedInput, { height: 80, textAlignVertical: 'top' }]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Notes"
                    placeholderTextColor="#555"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Attachments */}
                <Text style={s.sectionLabel}>ATTACHMENTS</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  {attachments.map(file => (
                    <View key={file.uri} style={s.attachmentChip}>
                      <Ionicons name={file.type?.includes('pdf') ? 'document-outline' : 'image-outline'} size={14} color="#FFFFFF" />
                      <Text style={s.attachmentText} numberOfLines={1}>{file.name}</Text>
                      <TouchableOpacity onPress={() => setAttachments(prev => prev.filter(a => a.name !== file.name))}>
                        <Ionicons name="close" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity style={s.addAttachBtn} onPress={handleAttachFile}>
                    <Ionicons name="attach" size={16} color="#3AABF0" />
                    <Text style={s.addAttachText}>Add file</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ marginTop: 8, color: '#8E8E93', fontSize: 12 }}>PDFs and images are supported.</Text>
              </ScrollView>

              {showScreeningDatePicker && <IOSDatePicker visible title="Screening Date" value={screeningDate ?? new Date()} maximumDate={new Date()} onConfirm={(d) => { setScreeningDate(d); setShowScreeningDatePicker(false); }} onCancel={() => setShowScreeningDatePicker(false)} />}
              {showNextDuePicker && <IOSDatePicker visible title="Next Due Date" value={nextDueDate ?? new Date()} onConfirm={(d) => { setNextDueDate(d); setShowNextDuePicker(false); }} onCancel={() => setShowNextDuePicker(false)} />}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ScreeningFormModal;

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  title: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  body: { padding: 20, paddingBottom: 40 },
  groupedBox: { backgroundColor: '#2C2C2E', borderRadius: 12, overflow: 'hidden' },
  groupedInput: { paddingHorizontal: 16, paddingVertical: 13, fontSize: 16, color: '#FFFFFF' },
  divider: { height: 1, backgroundColor: '#3A3A3C', marginLeft: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginTop: 20, marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2C2C2E', borderWidth: 1, borderColor: '#3A3A3C' },
  chipActive: { backgroundColor: '#3AABF0', borderColor: '#3AABF0' },
  chipText: { fontSize: 14, color: '#FFFFFF' },
  chipTextActive: { fontWeight: '600' },
  dateRow: { backgroundColor: '#2C2C2E', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  suggestionItem: { backgroundColor: '#3A3A3C', marginHorizontal: 16, borderRadius: 8, marginBottom: 4, paddingHorizontal: 16, paddingVertical: 12 },
  suggestionText: { color: '#FFFFFF', fontSize: 16 },
  attachmentChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#3A3A3C', gap: 6 },
  attachmentText: { color: '#FFFFFF', fontSize: 12, maxWidth: 140 },
  addAttachBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#3AABF0', gap: 6 },
  addAttachText: { color: '#3AABF0', fontSize: 12, fontWeight: '600' },
});
