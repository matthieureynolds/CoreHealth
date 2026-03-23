import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
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
  visible,
  editingCondition,
  onClose,
  onSave,
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
        setConditionName('');
        setShowSuggestions(false);
        setDiagnosedDate(null);
        setShowDiagnosedDatePicker(false);
        setSeverity('mild');
        setStatus('active');
        setResolvedDate(null);
        setShowResolvedDatePicker(false);
        setDateModeDiagnosed('full');
        setDateModeResolved('full');
        setNotes('');
        setAttachments([]);
      }
    }
  }, [visible, editingCondition]);

  const handleSave = () => {
    if (!conditionName.trim()) {
      Alert.alert('Error', 'Please enter a condition name');
      return;
    }
    onSave({
      id: editingCondition?.id ?? Date.now().toString(),
      condition: conditionName.trim(),
      diagnosedDate: (diagnosedDate || new Date()).toISOString().split('T')[0],
      severity,
      status,
      resolvedDate: status === 'resolved' && resolvedDate ? resolvedDate.toISOString().split('T')[0] : undefined,
      notes: notes.trim() || undefined,
      attachments: attachments.length ? attachments : undefined,
    });
  };

  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        setAttachments(prev => [...prev, { uri: asset.uri, name: asset.name || 'attachment', type: asset.mimeType }]);
      }
    } catch {
      Alert.alert('Attachment Error', 'Failed to attach file.');
    }
  };

  const formatDateForMode = (d: Date | null, mode: 'year' | 'yearMonth' | 'full') => {
    if (!d) return 'Select date';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    if (mode === 'year') return `${year}`;
    if (mode === 'yearMonth') return `${year}-${month}`;
    return `${year}-${month}-${day}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{editingCondition ? 'Edit Condition' : 'Add Condition'}</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Condition Name *:</Text>
            <TextInput
              style={styles.textInput}
              value={conditionName}
              onChangeText={(text) => { setConditionName(text); setShowSuggestions(text.length > 0); }}
              placeholder="e.g., Diabetes, Hypertension"
              placeholderTextColor="#666"
            />
            {showSuggestions && conditionName.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {COMMON_CONDITIONS
                  .filter(c => c.toLowerCase().includes(conditionName.toLowerCase()))
                  .slice(0, 5)
                  .map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => { setConditionName(suggestion); setShowSuggestions(false); }}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Severity:</Text>
            <View style={styles.optionsContainer}>
              {(['mild', 'moderate', 'severe'] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionButton, severity === opt && styles.selectedOption]}
                  onPress={() => setSeverity(opt)}
                >
                  <Text style={[styles.optionText, severity === opt && styles.selectedOptionText]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Status:</Text>
            <View style={styles.optionsContainer}>
              {(['active', 'resolved', 'managed'] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionButton, status === opt && styles.selectedOption]}
                  onPress={() => {
                    setStatus(opt);
                    if (opt === 'resolved' && !resolvedDate) setShowResolvedDatePicker(true);
                  }}
                >
                  <Text style={[styles.optionText, status === opt && styles.selectedOptionText]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Diagnosed Date:</Text>
            <View style={styles.dateModeRow}>
              {(['year', 'yearMonth', 'full'] as const).map(mode => (
                <TouchableOpacity key={mode} style={[styles.dateModeChip, dateModeDiagnosed === mode && styles.dateModeChipActive]} onPress={() => setDateModeDiagnosed(mode)}>
                  <Text style={[styles.dateModeText, dateModeDiagnosed === mode && styles.dateModeTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.dateInput, { borderColor: showDiagnosedDatePicker ? '#007AFF' : '#333' }]} onPress={() => setShowDiagnosedDatePicker(true)} activeOpacity={0.7}>
              <Text style={[styles.dateInputText, !diagnosedDate && styles.placeholderText]}>{formatDateForMode(diagnosedDate, dateModeDiagnosed)}</Text>
              <Ionicons name="calendar-outline" size={20} color={showDiagnosedDatePicker ? '#007AFF' : '#888'} />
            </TouchableOpacity>
          </View>

          {status === 'resolved' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Resolved Date:</Text>
              <View style={styles.dateModeRow}>
                {(['year', 'yearMonth', 'full'] as const).map(mode => (
                  <TouchableOpacity key={mode} style={[styles.dateModeChip, dateModeResolved === mode && styles.dateModeChipActive]} onPress={() => setDateModeResolved(mode)}>
                    <Text style={[styles.dateModeText, dateModeResolved === mode && styles.dateModeTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={[styles.dateInput, { borderColor: showResolvedDatePicker ? '#007AFF' : '#333' }]} onPress={() => setShowResolvedDatePicker(true)} activeOpacity={0.7}>
                <Text style={[styles.dateInputText, !resolvedDate && styles.placeholderText]}>{formatDateForMode(resolvedDate, dateModeResolved)}</Text>
                <Ionicons name="calendar-outline" size={20} color={showResolvedDatePicker ? '#007AFF' : '#888'} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Notes (Optional):</Text>
            <TextInput style={[styles.textInput, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Add any additional notes about this condition" placeholderTextColor="#666" multiline numberOfLines={3} />
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

        {showDiagnosedDatePicker && (
          <IOSDatePicker visible title="Diagnosed Date" value={diagnosedDate ?? new Date()} maximumDate={new Date()} onConfirm={(d) => { setDiagnosedDate(d); setShowDiagnosedDatePicker(false); }} onCancel={() => setShowDiagnosedDatePicker(false)} />
        )}
        {showResolvedDatePicker && (
          <IOSDatePicker visible title="Resolved Date" value={resolvedDate ?? new Date()} maximumDate={new Date()} onConfirm={(d) => { setResolvedDate(d); setShowResolvedDatePicker(false); }} onCancel={() => setShowResolvedDatePicker(false)} />
        )}
      </View>
    </Modal>
  );
};

export default ConditionFormModal;

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
