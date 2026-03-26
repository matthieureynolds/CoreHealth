import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert } from 'react-native';
import { MedicalCondition } from '../../../../../../shared/types';
import FormModalShell from '../shared/FormModalShell';
import SuggestionInput from '../shared/SuggestionInput';
import ChipSelector from '../shared/ChipSelector';
import DateField from '../shared/DateField';
import AttachmentsSection from '../shared/AttachmentsSection';
import { useAttachments } from '../shared/useAttachments';
import { formModalStyles as s } from '../shared/formModalStyles';

const COMMON_CONDITIONS = [
  'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'Asthma', 'Depression',
  'Anxiety', 'Arthritis', 'Heart Disease', 'Cancer', 'Thyroid Disorder',
  'Epilepsy', 'Multiple Sclerosis', "Parkinson's Disease", "Alzheimer's",
  'Osteoporosis', 'Fibromyalgia', 'Lupus', 'Rheumatoid Arthritis', "Crohn's Disease",
  'Ulcerative Colitis', 'Migraine', 'Sleep Apnea', 'COPD', 'Kidney Disease',
  'Liver Disease', 'Celiac Disease', 'Psoriasis', 'Eczema', 'ADHD', 'Autism',
] as const;

interface ConditionFormModalProps {
  visible: boolean;
  editingCondition: MedicalCondition | null;
  onClose: () => void;
  onSave: (condition: MedicalCondition) => void;
}

const ConditionFormModal: React.FC<ConditionFormModalProps> = ({ visible, editingCondition, onClose, onSave }) => {
  const [conditionName, setConditionName] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [status, setStatus] = useState<'active' | 'resolved' | 'managed'>('active');
  const [diagnosedDate, setDiagnosedDate] = useState<Date | null>(null);
  const [resolvedDate, setResolvedDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const { attachments, setAttachments, pickFile, removeFile } = useAttachments();

  useEffect(() => {
    if (visible) {
      if (editingCondition) {
        setConditionName(editingCondition.condition);
        setSeverity(editingCondition.severity);
        setStatus(editingCondition.status);
        setDiagnosedDate(editingCondition.diagnosedDate ? new Date(editingCondition.diagnosedDate) : new Date());
        setResolvedDate(editingCondition.resolvedDate ? new Date(editingCondition.resolvedDate) : null);
        setNotes(editingCondition.notes || '');
        setAttachments(editingCondition.attachments || []);
      } else {
        setConditionName(''); setSeverity('mild'); setStatus('active');
        setDiagnosedDate(null); setResolvedDate(null); setNotes(''); setAttachments([]);
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

  return (
    <FormModalShell visible={visible} title={editingCondition ? 'Edit Condition' : 'Add Condition'} onClose={onClose} onSave={handleSave}>
      <View style={s.group}>
        <SuggestionInput value={conditionName} onChangeText={setConditionName} placeholder="Condition Name *" suggestions={COMMON_CONDITIONS} />
      </View>

      <ChipSelector label="Severity" options={['mild', 'moderate', 'severe'] as const} selected={severity} onSelect={setSeverity} />
      <ChipSelector label="Status" options={['active', 'resolved', 'managed'] as const} selected={status} onSelect={(opt) => { setStatus(opt); if (opt === 'resolved' && !resolvedDate) setResolvedDate(new Date()); }} />

      <DateField label="Diagnosed Date" value={diagnosedDate} onChange={setDiagnosedDate} maximumDate={new Date()} />
      {status === 'resolved' && (
        <DateField label="Resolved Date" value={resolvedDate} onChange={setResolvedDate} maximumDate={new Date()} />
      )}

      <View style={[s.group, { marginTop: 20 }]}>
        <TextInput style={[s.input, { height: 70, textAlignVertical: 'top', paddingTop: 14 }]} placeholder="Notes" placeholderTextColor="#555" value={notes} onChangeText={setNotes} multiline />
      </View>

      <AttachmentsSection attachments={attachments} onAdd={pickFile} onRemove={removeFile} />
    </FormModalShell>
  );
};

export default ConditionFormModal;
