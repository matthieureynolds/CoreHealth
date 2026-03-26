import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FamilyCondition } from '../../../../../../shared/types';
import FormModalShell from '../shared/FormModalShell';
import SuggestionInput from '../shared/SuggestionInput';
import ChipSelector from '../shared/ChipSelector';
import DateField from '../shared/DateField';
import AttachmentsSection from '../shared/AttachmentsSection';
import { useAttachments } from '../shared/useAttachments';
import { formModalStyles as s } from '../shared/formModalStyles';

const COMMON_CONDITIONS = [
  'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'Heart Disease',
  'Stroke', 'Cancer', 'Breast Cancer', 'Lung Cancer', 'Colon Cancer',
  'Prostate Cancer', 'Ovarian Cancer', 'Alzheimer\'s Disease', 'Parkinson\'s Disease',
  'Multiple Sclerosis', 'Epilepsy', 'Asthma', 'COPD', 'Kidney Disease',
  'Liver Disease', 'Rheumatoid Arthritis', 'Lupus', 'Depression', 'Anxiety',
  'Bipolar Disorder', 'Schizophrenia', 'ADHD', 'Cystic Fibrosis',
  'Sickle Cell Anemia', 'Huntington\'s Disease',
] as const;

const RELATION_OPTIONS = ['Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Cousin'] as const;

interface FamilyHistoryFormModalProps {
  visible: boolean;
  editingFamily: FamilyCondition | null;
  onClose: () => void;
  onSave: (item: FamilyCondition) => void;
}

const FamilyHistoryFormModal: React.FC<FamilyHistoryFormModalProps> = ({ visible, editingFamily, onClose, onSave }) => {
  const [relation, setRelation] = useState('');
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [side, setSide] = useState<'maternal' | 'paternal' | ''>('');
  const [condition, setCondition] = useState('');
  const [status, setStatus] = useState<'active' | 'resolved'>('active');
  const [ageOfOnset, setAgeOfOnset] = useState<Date | null>(null);
  const [resolvedDate, setResolvedDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const { attachments, setAttachments, pickFile, removeFile } = useAttachments();

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
        setAgeOfOnset(null); setStatus('active'); setResolvedDate(null);
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

  return (
    <FormModalShell visible={visible} title={editingFamily ? 'Edit Family History' : 'Add Family History'} onClose={onClose} onSave={handleSave}>
      {/* Relation + Condition */}
      <View style={s.group}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13 }} onPress={() => setShowRelationPicker(!showRelationPicker)}>
          <Text style={[{ fontSize: 16, color: '#FFFFFF', flex: 1 }, !relation && s.placeholder]}>{relation || 'Select relation *'}</Text>
          <Ionicons name="chevron-down" size={18} color="#8E8E93" />
        </TouchableOpacity>
        {showRelationPicker && (
          <View style={s.suggestions}>
            {RELATION_OPTIONS.map((opt, i) => (
              <TouchableOpacity key={i} style={s.suggestionItem} onPress={() => { setRelation(opt); setShowRelationPicker(false); }}>
                <Text style={s.suggestionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={s.divider} />
        <SuggestionInput value={condition} onChangeText={setCondition} placeholder="Condition *" suggestions={COMMON_CONDITIONS} />
      </View>

      <ChipSelector label="Side" options={['maternal', 'paternal', ''] as const} selected={side} onSelect={setSide} labelMap={{ '': 'Unknown' }} />
      <ChipSelector label="Status" options={['active', 'resolved'] as const} selected={status} onSelect={setStatus} />

      <DateField label="Age of Onset" value={ageOfOnset} onChange={setAgeOfOnset} maximumDate={new Date()} defaultMode="year" />
      {status === 'resolved' && (
        <DateField label="Resolved Date" value={resolvedDate} onChange={setResolvedDate} maximumDate={new Date()} />
      )}

      <View style={[s.group, { marginTop: 20 }]}>
        <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={notes} onChangeText={setNotes} placeholder="Additional notes" placeholderTextColor="#555" multiline numberOfLines={3} />
      </View>

      <AttachmentsSection attachments={attachments} onAdd={pickFile} onRemove={removeFile} />
    </FormModalShell>
  );
};

export default FamilyHistoryFormModal;
