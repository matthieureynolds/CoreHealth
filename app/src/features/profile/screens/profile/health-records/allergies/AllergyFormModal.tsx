import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert } from 'react-native';
import { Allergy } from '../../../../../../shared/types';
import FormModalShell from '../shared/FormModalShell';
import SuggestionInput from '../shared/SuggestionInput';
import ChipSelector from '../shared/ChipSelector';
import DateField from '../shared/DateField';
import AttachmentsSection from '../shared/AttachmentsSection';
import { useAttachments } from '../shared/useAttachments';
import { formModalStyles as s } from '../shared/formModalStyles';

const COMMON_ALLERGIES = [
  'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish',
  'Latex', 'Dust Mites', 'Pollen', 'Pet Dander', 'Mold', 'Grass', 'Ragweed',
  'Penicillin', 'Sulfa Drugs', 'Aspirin', 'Ibuprofen', 'Codeine', 'Morphine',
  'Bee Stings', 'Wasp Stings', 'Fire Ants', 'Dairy', 'Gluten', 'Sesame',
  'Mustard', 'Celery', 'Lupin', 'Molluscs', 'Sulfites', 'Nitrates',
] as const;

interface AllergyFormModalProps {
  visible: boolean;
  editingAllergy: Allergy | null;
  onClose: () => void;
  onSave: (allergy: Allergy) => void;
}

const AllergyFormModal: React.FC<AllergyFormModalProps> = ({ visible, editingAllergy, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [status, setStatus] = useState<'active' | 'resolved'>('active');
  const [reaction, setReaction] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const { attachments, setAttachments, pickFile, removeFile } = useAttachments();

  useEffect(() => {
    if (visible) {
      if (editingAllergy) {
        setName(editingAllergy.name);
        setSeverity(editingAllergy.severity);
        setStatus(editingAllergy.status);
        setReaction(editingAllergy.reaction || '');
        setStartDate(editingAllergy.startDate ? new Date(editingAllergy.startDate) : null);
        setEndDate(editingAllergy.endDate ? new Date(editingAllergy.endDate) : null);
        setNotes(editingAllergy.notes || '');
        setAttachments(editingAllergy.attachments || []);
      } else {
        setName(''); setSeverity('mild'); setStatus('active'); setReaction('');
        setStartDate(null); setEndDate(null); setNotes(''); setAttachments([]);
      }
    }
  }, [visible, editingAllergy]);

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Error', 'Please enter an allergy name'); return; }
    onSave({
      id: editingAllergy?.id ?? Date.now().toString(),
      name: name.trim(),
      severity, status,
      reaction: reaction.trim() || undefined,
      startDate: (startDate || new Date()).toISOString().split('T')[0],
      endDate: status === 'resolved' && endDate ? endDate.toISOString().split('T')[0] : undefined,
      notes: notes.trim() || undefined,
      attachments: attachments.length ? attachments : undefined,
    });
  };

  return (
    <FormModalShell visible={visible} title={editingAllergy ? 'Edit Allergy' : 'Add Allergy'} onClose={onClose} onSave={handleSave}>
      <View style={s.group}>
        <SuggestionInput value={name} onChangeText={setName} placeholder="Allergy name *" suggestions={COMMON_ALLERGIES} />
        <View style={s.divider} />
        <TextInput style={s.input} value={reaction} onChangeText={setReaction} placeholder="Reaction (e.g. Hives, Swelling)" placeholderTextColor="#555" />
      </View>

      <ChipSelector label="Severity" options={['mild', 'moderate', 'severe'] as const} selected={severity} onSelect={setSeverity} />
      <ChipSelector label="Status" options={['active', 'resolved'] as const} selected={status} onSelect={(opt) => { setStatus(opt); if (opt === 'resolved' && !endDate) setEndDate(new Date()); }} />

      <DateField label="Start Date" value={startDate} onChange={setStartDate} maximumDate={new Date()} />
      {status === 'resolved' && (
        <DateField label="End Date" value={endDate} onChange={setEndDate} maximumDate={new Date()} />
      )}

      <View style={[s.group, { marginTop: 20 }]}>
        <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={notes} onChangeText={setNotes} placeholder="Additional notes" placeholderTextColor="#555" multiline numberOfLines={3} />
      </View>

      <AttachmentsSection attachments={attachments} onAdd={pickFile} onRemove={removeFile} />
    </FormModalShell>
  );
};

export default AllergyFormModal;
