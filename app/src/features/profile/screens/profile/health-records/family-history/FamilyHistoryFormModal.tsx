import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IOSDatePicker from '../../../../../../shared/components/ui/IOSDatePicker';
import { FamilyCondition, AttachedFile } from '../../../../../../shared/types';
import * as DocumentPicker from 'expo-document-picker';

const COMMON_CONDITIONS = [
  'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'Heart Disease',
  'Stroke', 'Cancer', 'Breast Cancer', 'Lung Cancer', 'Colon Cancer',
  'Prostate Cancer', 'Ovarian Cancer', 'Alzheimer\'s Disease', 'Parkinson\'s Disease',
  'Multiple Sclerosis', 'Epilepsy', 'Asthma', 'COPD', 'Kidney Disease',
  'Liver Disease', 'Rheumatoid Arthritis', 'Lupus', 'Depression', 'Anxiety',
  'Bipolar Disorder', 'Schizophrenia', 'ADHD', 'Cystic Fibrosis',
  'Sickle Cell Anemia', 'Huntington\'s Disease',
];

const RELATION_OPTIONS = ['Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Cousin'];

interface FamilyHistoryFormModalProps {
  visible: boolean;
  editingFamily: FamilyCondition | null;
  onClose: () => void;
  onSave: (item: FamilyCondition) => void;
}

const FamilyHistoryFormModal: React.FC<FamilyHistoryFormModalProps> = ({
  visible, editingFamily, onClose, onSave,
}) => {
  const [relation, setRelation] = useState('');
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [side, setSide] = useState<'maternal' | 'paternal' | ''>('');
  const [condition, setCondition] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [ageOfOnset, setAgeOfOnset] = useState<Date | null>(null);
  const [showAgeOfOnsetPicker, setShowAgeOfOnsetPicker] = useState(false);
  const [dateModeAge, setDateModeAge] = useState<'year' | 'yearMonth' | 'full'>('year');
  const [status, setStatus] = useState<'active' | 'resolved'>('active');
  const [resolvedDate, setResolvedDate] = useState<Date | null>(null);
  const [showResolvedDatePicker, setShowResolvedDatePicker] = useState(false);
  const [dateModeResolved, setDateModeResolved] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);

  useEffect(() => {
    if (visible) {
      if (editingFamily) {
        setRelation(editingFamily.relation);
        setCondition(editingFamily.condition);
        setAgeOfOnset(editingFamily.ageOfOnset ? new Date(new Date().getFullYear() - editingFamily.ageOfOnset, 0, 1) : null);
        setNotes(editingFamily.notes || '');
        setAttachments(editingFamily.attachments || []);
        setSide((editingFamily as any).side || '');
        setStatus(((editingFamily as any).status as any) || 'active');
        setResolvedDate((editingFamily as any).resolvedDate ? new Date((editingFamily as any).resolvedDate) : null);
      } else {
        setRelation(''); setShowRelationPicker(false); setSide(''); setCondition('');
        setShowSuggestions(false); setAgeOfOnset(null); setShowAgeOfOnsetPicker(false);
        setDateModeAge('year'); setStatus('active'); setResolvedDate(null);
        setShowResolvedDatePicker(false); setDateModeResolved('full');
        setNotes(''); setAttachments([]);
      }
    }
  }, [visible, editingFamily]);

  const handleSave = () => {
    if (!relation.trim() || !condition.trim()) { Alert.alert('Error', 'Please enter both relation and condition'); return; }
    onSave({
      id: editingFamily?.id ?? Date.now().toString(),
      relation: relation.trim(),
      condition: condition.trim(),
      ageOfOnset: ageOfOnset ? Math.floor((new Date().getTime() - ageOfOnset.getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : undefined,
      notes: notes.trim() || undefined,
      attachments: attachments.length ? attachments : undefined,
      side: side || undefined,
      status,
      resolvedDate: status === 'resolved' && resolvedDate ? resolvedDate.toISOString().split('T')[0] : undefined,
    } as any);
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

  const filteredConditions = COMMON_CONDITIONS.filter(c => c.toLowerCase().includes(condition.toLowerCase())).slice(0, 5);

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
                <Text style={s.title}>{editingFamily ? 'Edit Family History' : 'Add Family History'}</Text>
                <TouchableOpacity onPress={handleSave} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="checkmark" size={22} color="#34C759" />
                </TouchableOpacity>
              </View>

              <ScrollView style={s.body} keyboardShouldPersistTaps="handled">
                {/* Group 1: Relation + Condition */}
                <View style={s.group}>
                  <TouchableOpacity style={s.inputRow} onPress={() => setShowRelationPicker(!showRelationPicker)}>
                    <Text style={[s.inputText, !relation && s.placeholder]}>{relation || 'Select relation *'}</Text>
                    <Ionicons name="chevron-down" size={18} color="#8E8E93" />
                  </TouchableOpacity>
                  {showRelationPicker && (
                    <View style={s.dropdown}>
                      {RELATION_OPTIONS.map((opt, i) => (
                        <TouchableOpacity key={i} style={s.dropdownItem} onPress={() => { setRelation(opt); setShowRelationPicker(false); }}>
                          <Text style={s.dropdownText}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  <View style={s.divider} />
                  <TextInput
                    style={s.textInput}
                    value={condition}
                    onChangeText={(t) => { setCondition(t); setShowSuggestions(t.length > 0); }}
                    placeholder="Condition *"
                    placeholderTextColor="#8E8E93"
                  />
                  {showSuggestions && condition.length > 0 && filteredConditions.length > 0 && (
                    <View style={s.suggestions}>
                      {filteredConditions.map((c, i) => (
                        <TouchableOpacity key={i} style={s.dropdownItem} onPress={() => { setCondition(c); setShowSuggestions(false); }}>
                          <Text style={s.dropdownText}>{c}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Side chips */}
                <Text style={s.sectionLabel}>SIDE</Text>
                <View style={s.chipRow}>
                  {(['maternal', 'paternal', ''] as const).map(opt => (
                    <TouchableOpacity key={opt || 'unknown'} style={[s.chip, side === opt && s.chipActive]} onPress={() => setSide(opt)}>
                      <Text style={[s.chipText, side === opt && s.chipTextActive]}>{opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : 'Unknown'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Status chips */}
                <Text style={s.sectionLabel}>STATUS</Text>
                <View style={s.chipRow}>
                  {(['active', 'resolved'] as const).map(opt => (
                    <TouchableOpacity key={opt} style={[s.chip, status === opt && s.chipActive]} onPress={() => setStatus(opt)}>
                      <Text style={[s.chipText, status === opt && s.chipTextActive]}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Age of Onset */}
                <Text style={s.sectionLabel}>AGE OF ONSET</Text>
                <View style={s.chipRow}>
                  {(['year', 'yearMonth', 'full'] as const).map(mode => (
                    <TouchableOpacity key={mode} style={[s.chip, dateModeAge === mode && s.chipActive]} onPress={() => setDateModeAge(mode)}>
                      <Text style={[s.chipText, dateModeAge === mode && s.chipTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={s.dateRow} onPress={() => setShowAgeOfOnsetPicker(true)}>
                  <Text style={[s.dateText, !ageOfOnset && s.placeholder]}>{fmt(ageOfOnset, dateModeAge)}</Text>
                  <Ionicons name="calendar-outline" size={18} color="#8E8E93" />
                </TouchableOpacity>

                {/* Resolved Date */}
                {status === 'resolved' && (
                  <>
                    <Text style={s.sectionLabel}>RESOLVED DATE</Text>
                    <View style={s.chipRow}>
                      {(['year', 'yearMonth', 'full'] as const).map(mode => (
                        <TouchableOpacity key={mode} style={[s.chip, dateModeResolved === mode && s.chipActive]} onPress={() => setDateModeResolved(mode)}>
                          <Text style={[s.chipText, dateModeResolved === mode && s.chipTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity style={s.dateRow} onPress={() => setShowResolvedDatePicker(true)}>
                      <Text style={[s.dateText, !resolvedDate && s.placeholder]}>{fmt(resolvedDate, dateModeResolved)}</Text>
                      <Ionicons name="calendar-outline" size={18} color="#8E8E93" />
                    </TouchableOpacity>
                  </>
                )}

                {/* Notes group */}
                <Text style={s.sectionLabel}>NOTES</Text>
                <View style={s.group}>
                  <TextInput
                    style={[s.textInput, { height: 80, textAlignVertical: 'top' }]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Additional notes"
                    placeholderTextColor="#555"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Attachments */}
                <Text style={s.sectionLabel}>ATTACHMENTS</Text>
                <View style={s.attachRow}>
                  {attachments.map(file => (
                    <View key={file.uri} style={s.attachChip}>
                      <Ionicons name={file.type?.includes('pdf') ? 'document-outline' : 'image-outline'} size={14} color="#FFFFFF" />
                      <Text style={s.attachText} numberOfLines={1}>{file.name}</Text>
                      <TouchableOpacity onPress={() => setAttachments(prev => prev.filter(a => a.name !== file.name))}>
                        <Ionicons name="close" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity style={s.addAttach} onPress={handleAttachFile}>
                    <Ionicons name="attach" size={16} color="#3AABF0" />
                    <Text style={s.addAttachText}>Add file</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.helpText}>PDFs and images are supported.</Text>
              </ScrollView>

              {showAgeOfOnsetPicker && <IOSDatePicker visible title="Age of Onset" value={ageOfOnset ?? new Date()} maximumDate={new Date()} onConfirm={(d) => { setAgeOfOnset(d); setShowAgeOfOnsetPicker(false); }} onCancel={() => setShowAgeOfOnsetPicker(false)} />}
              {showResolvedDatePicker && <IOSDatePicker visible title="Resolved Date" value={resolvedDate ?? new Date()} maximumDate={new Date()} onConfirm={(d) => { setResolvedDate(d); setShowResolvedDatePicker(false); }} onCancel={() => setShowResolvedDatePicker(false)} />}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FamilyHistoryFormModal;

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  title: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  body: { padding: 20, paddingBottom: 40 },
  group: { backgroundColor: '#2C2C2E', borderRadius: 12, overflow: 'hidden' },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13 },
  inputText: { fontSize: 16, color: '#FFFFFF', flex: 1 },
  placeholder: { color: '#8E8E93' },
  divider: { height: 1, backgroundColor: '#3A3A3C', marginLeft: 16 },
  textInput: { paddingHorizontal: 16, paddingVertical: 13, fontSize: 16, color: '#FFFFFF' },
  dropdown: { backgroundColor: '#3A3A3C', marginHorizontal: 16, borderRadius: 8, marginBottom: 4 },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownText: { color: '#FFFFFF', fontSize: 16 },
  suggestions: { backgroundColor: '#3A3A3C', marginHorizontal: 16, borderRadius: 8, marginBottom: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginTop: 20, marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2C2C2E', borderWidth: 1, borderColor: '#3A3A3C' },
  chipActive: { backgroundColor: '#3AABF0', borderColor: '#3AABF0' },
  chipText: { color: '#FFFFFF', fontSize: 14 },
  chipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  dateRow: { backgroundColor: '#2C2C2E', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  dateText: { fontSize: 16, color: '#FFFFFF', flex: 1 },
  attachRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  attachChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#3A3A3C' },
  attachText: { color: '#FFFFFF', fontSize: 12, marginLeft: 6, maxWidth: 140 },
  addAttach: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#3AABF0' },
  addAttachText: { color: '#3AABF0', fontSize: 12, marginLeft: 6, fontWeight: '600' },
  helpText: { marginTop: 8, color: '#8E8E93', fontSize: 12 },
});
