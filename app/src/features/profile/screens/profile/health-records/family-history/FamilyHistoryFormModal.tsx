import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal,
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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="overFullScreen" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancelButton}>Cancel</Text></TouchableOpacity>
          <Text style={styles.title}>{editingFamily ? 'Edit Family History' : 'Add Family History'}</Text>
          <TouchableOpacity onPress={handleSave}><Text style={styles.saveButton}>Save</Text></TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Relation *:</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowRelationPicker(!showRelationPicker)}>
              <Text style={[styles.dateInputText, !relation && styles.placeholderText]}>{relation || 'Select relation'}</Text>
              <Ionicons name="chevron-down" size={20} color="#888" />
            </TouchableOpacity>
            {showRelationPicker && (
              <View style={styles.suggestionsContainer}>
                {RELATION_OPTIONS.map((opt, i) => (
                  <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => { setRelation(opt); setShowRelationPicker(false); }}>
                    <Text style={styles.suggestionText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Side (Optional):</Text>
            <View style={styles.optionsContainer}>
              {(['maternal', 'paternal', ''] as const).map(opt => (
                <TouchableOpacity key={opt || 'none'} style={[styles.optionButton, side === opt && styles.selectedOption]} onPress={() => setSide(opt)}>
                  <Text style={[styles.optionText, side === opt && styles.selectedOptionText]}>{opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : 'Unknown'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Condition *:</Text>
            <TextInput style={styles.textInput} value={condition} onChangeText={(t) => { setCondition(t); setShowSuggestions(t.length > 0); }} placeholder="e.g., Diabetes, Heart Disease" placeholderTextColor="#666" />
            {showSuggestions && condition.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {COMMON_CONDITIONS.filter(c => c.toLowerCase().includes(condition.toLowerCase())).slice(0, 5).map((c, i) => (
                  <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => { setCondition(c); setShowSuggestions(false); }}>
                    <Text style={styles.suggestionText}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Age of Onset (Optional):</Text>
            <View style={styles.dateModeRow}>
              {(['year', 'yearMonth', 'full'] as const).map(mode => (
                <TouchableOpacity key={mode} style={[styles.dateModeChip, dateModeAge === mode && styles.dateModeChipActive]} onPress={() => setDateModeAge(mode)}>
                  <Text style={[styles.dateModeText, dateModeAge === mode && styles.dateModeTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowAgeOfOnsetPicker(true)}>
              <Text style={[styles.dateInputText, !ageOfOnset && styles.placeholderText]}>{fmt(ageOfOnset, dateModeAge)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#888" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Status:</Text>
            <View style={styles.optionsContainer}>
              {(['active', 'resolved'] as const).map(opt => (
                <TouchableOpacity key={opt} style={[styles.optionButton, status === opt && styles.selectedOption]} onPress={() => setStatus(opt)}>
                  <Text style={[styles.optionText, status === opt && styles.selectedOptionText]}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {status === 'resolved' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Resolved Date (Optional):</Text>
              <View style={styles.dateModeRow}>
                {(['year', 'yearMonth', 'full'] as const).map(mode => (
                  <TouchableOpacity key={mode} style={[styles.dateModeChip, dateModeResolved === mode && styles.dateModeChipActive]} onPress={() => setDateModeResolved(mode)}>
                    <Text style={[styles.dateModeText, dateModeResolved === mode && styles.dateModeTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowResolvedDatePicker(true)}>
                <Text style={[styles.dateInputText, !resolvedDate && styles.placeholderText]}>{fmt(resolvedDate, dateModeResolved)}</Text>
                <Ionicons name="calendar-outline" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          )}
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
        {showAgeOfOnsetPicker && <IOSDatePicker visible title="Age of Onset" value={ageOfOnset ?? new Date()} maximumDate={new Date()} onConfirm={(d) => { setAgeOfOnset(d); setShowAgeOfOnsetPicker(false); }} onCancel={() => setShowAgeOfOnsetPicker(false)} />}
        {showResolvedDatePicker && <IOSDatePicker visible title="Resolved Date" value={resolvedDate ?? new Date()} maximumDate={new Date()} onConfirm={(d) => { setResolvedDate(d); setShowResolvedDatePicker(false); }} onCancel={() => setShowResolvedDatePicker(false)} />}
      </View>
    </Modal>
  );
};

export default FamilyHistoryFormModal;

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
  suggestionsContainer: { backgroundColor: '#181818', borderRadius: 8, marginTop: 4, maxHeight: 180 },
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
