import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IOSDatePicker from '../../../../../../shared/components/ui/IOSDatePicker';
import { MedicalCondition, AttachedFile } from '../../../../../../shared/types';
import * as DocumentPicker from 'expo-document-picker';

const COMMON_CONDITIONS = [
  'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'Asthma', 'Depression',
  'Anxiety', 'Arthritis', 'Heart Disease', 'Cancer', 'Thyroid Disorder',
  'Epilepsy', 'Multiple Sclerosis', "Parkinson's Disease", "Alzheimer's",
  'Osteoporosis', 'Fibromyalgia', 'Lupus', 'Rheumatoid Arthritis', "Crohn's Disease",
  'Ulcerative Colitis', 'Migraine', 'Sleep Apnea', 'COPD', 'Kidney Disease',
  'Liver Disease', 'Celiac Disease', 'Psoriasis', 'Eczema', 'ADHD', 'Autism',
];

interface ConditionFormModalProps {
  visible: boolean;
  editingCondition: MedicalCondition | null;
  onClose: () => void;
  onSave: (condition: MedicalCondition) => void;
}

const ConditionFormModal: React.FC<ConditionFormModalProps> = ({
  visible, editingCondition, onClose, onSave,
}) => {
  const [conditionName, setConditionName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [diagnosedDate, setDiagnosedDate] = useState<Date | null>(null);
  const [showDiagnosedDatePicker, setShowDiagnosedDatePicker] = useState(false);
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [status, setStatus] = useState<'active' | 'resolved' | 'managed'>('active');
  const [resolvedDate, setResolvedDate] = useState<Date | null>(null);
  const [showResolvedDatePicker, setShowResolvedDatePicker] = useState(false);
  const [dateModeDiagnosed, setDateModeDiagnosed] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [dateModeResolved, setDateModeResolved] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);

  useEffect(() => {
    if (visible) {
      if (editingCondition) {
        setConditionName(editingCondition.condition);
        setDiagnosedDate(editingCondition.diagnosedDate ? new Date(editingCondition.diagnosedDate) : new Date());
        setSeverity(editingCondition.severity);
        setStatus(editingCondition.status);
        setResolvedDate(editingCondition.resolvedDate ? new Date(editingCondition.resolvedDate) : null);
        setNotes(editingCondition.notes || '');
        setAttachments(editingCondition.attachments || []);
      } else {
        setConditionName(''); setShowSuggestions(false); setDiagnosedDate(null);
        setShowDiagnosedDatePicker(false); setSeverity('mild'); setStatus('active');
        setResolvedDate(null); setShowResolvedDatePicker(false);
        setDateModeDiagnosed('full'); setDateModeResolved('full'); setNotes(''); setAttachments([]);
      }
    }
  }, [visible, editingCondition]);

  const handleSave = () => {
    if (!conditionName.trim()) { Alert.alert('Error', 'Please enter a condition name'); return; }
    onSave({
      id: editingCondition?.id ?? Date.now().toString(),
      condition: conditionName.trim(),
      diagnosedDate: (diagnosedDate || new Date()).toISOString().split('T')[0],
      severity, status,
      resolvedDate: status === 'resolved' && resolvedDate ? resolvedDate.toISOString().split('T')[0] : undefined,
      notes: notes.trim() || undefined,
      attachments: attachments.length ? attachments : undefined,
    });
  };

  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        setAttachments(prev => [...prev, { uri: asset.uri, name: asset.name || 'attachment', type: asset.mimeType }]);
      }
    } catch { Alert.alert('Attachment Error', 'Failed to attach file.'); }
  };

  const fmt = (d: Date | null, mode: 'year' | 'yearMonth' | 'full') => {
    if (!d) return 'Select date';
    const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0');
    if (mode === 'year') return `${y}`; if (mode === 'yearMonth') return `${y}-${m}`; return `${y}-${m}-${day}`;
  };

  const filteredSuggestions = showSuggestions && conditionName.length > 0
    ? COMMON_CONDITIONS.filter(c => c.toLowerCase().includes(conditionName.toLowerCase())).slice(0, 5)
    : [];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={s.sheet}>
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={22} color="#FF3B30" />
            </TouchableOpacity>
            <Text style={s.title}>{editingCondition ? 'Edit Condition' : 'Add Condition'}</Text>
            <TouchableOpacity onPress={handleSave} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="checkmark" size={22} color="#34C759" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={s.body}>
            {/* Condition Name */}
            <View style={s.group}>
              <TextInput style={s.gInput} placeholder="Condition Name *" placeholderTextColor="#8E8E93" value={conditionName} onChangeText={(t) => { setConditionName(t); setShowSuggestions(t.length > 0); }} />
              {filteredSuggestions.length > 0 && (
                <View style={s.suggestions}>
                  {filteredSuggestions.map((sug, i) => (
                    <TouchableOpacity key={i} style={s.suggestionItem} onPress={() => { setConditionName(sug); setShowSuggestions(false); }}>
                      <Text style={s.suggestionText}>{sug}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Severity */}
            <Text style={s.sectionLabel}>Severity</Text>
            <View style={s.chipRow}>
              {(['mild', 'moderate', 'severe'] as const).map(opt => (
                <TouchableOpacity key={opt} style={[s.chip, severity === opt && s.chipActive]} onPress={() => setSeverity(opt)}>
                  <Text style={[s.chipText, severity === opt && s.chipTextActive]}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Status */}
            <Text style={s.sectionLabel}>Status</Text>
            <View style={s.chipRow}>
              {(['active', 'resolved', 'managed'] as const).map(opt => (
                <TouchableOpacity key={opt} style={[s.chip, status === opt && s.chipActive]} onPress={() => { setStatus(opt); if (opt === 'resolved' && !resolvedDate) setShowResolvedDatePicker(true); }}>
                  <Text style={[s.chipText, status === opt && s.chipTextActive]}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Diagnosed Date */}
            <Text style={s.sectionLabel}>Diagnosed Date</Text>
            <View style={s.chipRow}>
              {(['year', 'yearMonth', 'full'] as const).map(mode => (
                <TouchableOpacity key={mode} style={[s.chip, dateModeDiagnosed === mode && s.chipActive]} onPress={() => setDateModeDiagnosed(mode)}>
                  <Text style={[s.chipText, dateModeDiagnosed === mode && s.chipTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.dateRow} onPress={() => setShowDiagnosedDatePicker(true)}>
              <Text style={[s.dateText, !diagnosedDate && { color: '#555' }]}>{fmt(diagnosedDate, dateModeDiagnosed)}</Text>
              <Ionicons name="calendar-outline" size={18} color="#8E8E93" />
            </TouchableOpacity>

            {/* Resolved Date */}
            {status === 'resolved' && (
              <>
                <Text style={s.sectionLabel}>Resolved Date</Text>
                <View style={s.chipRow}>
                  {(['year', 'yearMonth', 'full'] as const).map(mode => (
                    <TouchableOpacity key={mode} style={[s.chip, dateModeResolved === mode && s.chipActive]} onPress={() => setDateModeResolved(mode)}>
                      <Text style={[s.chipText, dateModeResolved === mode && s.chipTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={s.dateRow} onPress={() => setShowResolvedDatePicker(true)}>
                  <Text style={[s.dateText, !resolvedDate && { color: '#555' }]}>{fmt(resolvedDate, dateModeResolved)}</Text>
                  <Ionicons name="calendar-outline" size={18} color="#8E8E93" />
                </TouchableOpacity>
              </>
            )}

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

          {showDiagnosedDatePicker && <IOSDatePicker visible title="Diagnosed Date" value={diagnosedDate ?? new Date()} maximumDate={new Date()} onConfirm={(d) => { setDiagnosedDate(d); setShowDiagnosedDatePicker(false); }} onCancel={() => setShowDiagnosedDatePicker(false)} />}
          {showResolvedDatePicker && <IOSDatePicker visible title="Resolved Date" value={resolvedDate ?? new Date()} maximumDate={new Date()} onConfirm={(d) => { setResolvedDate(d); setShowResolvedDatePicker(false); }} onCancel={() => setShowResolvedDatePicker(false)} />}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default ConditionFormModal;

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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2C2C2E', borderWidth: 1, borderColor: '#3A3A3C' },
  chipActive: { backgroundColor: '#3AABF0', borderColor: '#3AABF0' },
  chipText: { fontSize: 14, color: '#fff' },
  chipTextActive: { fontWeight: '600' },
  dateRow: { backgroundColor: '#2C2C2E', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  dateText: { fontSize: 16, color: '#fff' },
  attachRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  attachChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, gap: 6, borderWidth: 1, borderColor: '#3A3A3C' },
  attachText: { color: '#FFFFFF', fontSize: 12, maxWidth: 140 },
  addAttach: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#3AABF0', gap: 6 },
  addAttachText: { color: '#3AABF0', fontSize: 12, fontWeight: '600' },
  attachHelp: { marginTop: 8, color: '#555', fontSize: 12 },
});
