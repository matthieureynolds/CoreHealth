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
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IOSDatePicker from '../../../../../../shared/components/ui/IOSDatePicker';
import { Allergy, AttachedFile } from '../../../../../../shared/types';
import * as DocumentPicker from 'expo-document-picker';

const COMMON_ALLERGIES = [
  'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish',
  'Latex', 'Dust Mites', 'Pollen', 'Pet Dander', 'Mold', 'Grass', 'Ragweed',
  'Penicillin', 'Sulfa Drugs', 'Aspirin', 'Ibuprofen', 'Codeine', 'Morphine',
  'Bee Stings', 'Wasp Stings', 'Fire Ants', 'Dairy', 'Gluten', 'Sesame',
  'Mustard', 'Celery', 'Lupin', 'Molluscs', 'Sulfites', 'Nitrates',
];

interface AllergyFormModalProps {
  visible: boolean;
  editingAllergy: Allergy | null;
  onClose: () => void;
  onSave: (allergy: Allergy) => void;
}

const AllergyFormModal: React.FC<AllergyFormModalProps> = ({
  visible, editingAllergy, onClose, onSave,
}) => {
  const [allergyName, setAllergyName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [status, setStatus] = useState<'active' | 'resolved'>('active');
  const [reaction, setReaction] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [dateModeStart, setDateModeStart] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [dateModeEnd, setDateModeEnd] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);

  useEffect(() => {
    if (visible) {
      if (editingAllergy) {
        setAllergyName(editingAllergy.name);
        setSeverity(editingAllergy.severity);
        setStatus(editingAllergy.status);
        setReaction(editingAllergy.reaction || '');
        setStartDate(editingAllergy.startDate ? new Date(editingAllergy.startDate) : null);
        setEndDate(editingAllergy.endDate ? new Date(editingAllergy.endDate) : null);
        setNotes(editingAllergy.notes || '');
        setAttachments(editingAllergy.attachments || []);
      } else {
        setAllergyName(''); setShowSuggestions(false); setSeverity('mild'); setStatus('active');
        setReaction(''); setStartDate(null); setShowStartDatePicker(false);
        setEndDate(null); setShowEndDatePicker(false);
        setDateModeStart('full'); setDateModeEnd('full');
        setNotes(''); setAttachments([]);
      }
    }
  }, [visible, editingAllergy]);

  const handleSave = () => {
    if (!allergyName.trim()) { Alert.alert('Error', 'Please enter an allergy name'); return; }
    onSave({
      id: editingAllergy?.id ?? Date.now().toString(),
      name: allergyName.trim(),
      severity,
      status,
      reaction: reaction.trim() || undefined,
      startDate: (startDate || new Date()).toISOString().split('T')[0],
      endDate: status === 'resolved' && endDate ? endDate.toISOString().split('T')[0] : undefined,
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

  const formatDateForMode = (d: Date | null, mode: 'year' | 'yearMonth' | 'full') => {
    if (!d) return 'Select date';
    const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0');
    if (mode === 'year') return `${year}`; if (mode === 'yearMonth') return `${year}-${month}`; return `${year}-${month}-${day}`;
  };

  const filteredSuggestions = showSuggestions && allergyName.length > 0
    ? COMMON_ALLERGIES.filter(a => a.toLowerCase().includes(allergyName.toLowerCase())).slice(0, 5)
    : [];

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color="#FF3B30" />
            </TouchableOpacity>
            <Text style={s.title}>{editingAllergy ? 'Edit Allergy' : 'Add Allergy'}</Text>
            <TouchableOpacity onPress={handleSave} hitSlop={8}>
              <Ionicons name="checkmark" size={22} color="#34C759" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={s.body} keyboardShouldPersistTaps="handled">
            {/* Group 1: Allergy Name + Reaction */}
            <View style={s.group}>
              <TextInput
                style={s.input}
                value={allergyName}
                onChangeText={(text) => { setAllergyName(text); setShowSuggestions(text.length > 0); }}
                placeholder="Allergy name *"
                placeholderTextColor="#8E8E93"
              />
              {filteredSuggestions.length > 0 && (
                <View>
                  {filteredSuggestions.map((suggestion, i) => (
                    <TouchableOpacity
                      key={i}
                      style={s.suggestion}
                      onPress={() => { setAllergyName(suggestion); setShowSuggestions(false); }}
                    >
                      <Text style={s.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={s.divider} />
              <TextInput
                style={s.input}
                value={reaction}
                onChangeText={setReaction}
                placeholder="Reaction (e.g. Hives, Swelling)"
                placeholderTextColor="#555"
              />
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
              {(['active', 'resolved'] as const).map(opt => (
                <TouchableOpacity key={opt} style={[s.chip, status === opt && s.chipActive]} onPress={() => { setStatus(opt); if (opt === 'resolved' && !endDate) setShowEndDatePicker(true); }}>
                  <Text style={[s.chipText, status === opt && s.chipTextActive]}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</Text>
                </TouchableOpacity>
              ))}
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
              <Text style={[s.dateText, !startDate && { color: '#8E8E93' }]}>{formatDateForMode(startDate, dateModeStart)}</Text>
              <Ionicons name="calendar-outline" size={18} color="#8E8E93" />
            </TouchableOpacity>

            {/* End Date (conditional) */}
            {status === 'resolved' && (
              <>
                <Text style={s.sectionLabel}>End Date</Text>
                <View style={s.chipRow}>
                  {(['year', 'yearMonth', 'full'] as const).map(mode => (
                    <TouchableOpacity key={mode} style={[s.chip, dateModeEnd === mode && s.chipActive]} onPress={() => setDateModeEnd(mode)}>
                      <Text style={[s.chipText, dateModeEnd === mode && s.chipTextActive]}>{mode === 'yearMonth' ? 'Year-Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={s.dateRow} onPress={() => setShowEndDatePicker(true)}>
                  <Text style={[s.dateText, !endDate && { color: '#8E8E93' }]}>{formatDateForMode(endDate, dateModeEnd)}</Text>
                  <Ionicons name="calendar-outline" size={18} color="#8E8E93" />
                </TouchableOpacity>
              </>
            )}

            {/* Notes */}
            <Text style={s.sectionLabel}>Notes</Text>
            <View style={s.group}>
              <TextInput
                style={[s.input, { height: 80, textAlignVertical: 'top' }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional notes"
                placeholderTextColor="#555"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Attachments */}
            <Text style={s.sectionLabel}>Attachments</Text>
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
          </ScrollView>
        </Pressable>
      </Pressable>

      {showStartDatePicker && <IOSDatePicker visible title="Start Date" value={startDate ?? new Date()} maximumDate={new Date()} onConfirm={(d) => { setStartDate(d); setShowStartDatePicker(false); }} onCancel={() => setShowStartDatePicker(false)} />}
      {showEndDatePicker && <IOSDatePicker visible title="End Date" value={endDate ?? new Date()} maximumDate={new Date()} onConfirm={(d) => { setEndDate(d); setShowEndDatePicker(false); }} onCancel={() => setShowEndDatePicker(false)} />}
    </Modal>
  );
};

export default AllergyFormModal;

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  body: {
    padding: 20,
    paddingBottom: 40,
  },
  group: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#3A3A3C',
    marginLeft: 16,
  },
  suggestion: {
    backgroundColor: '#3A3A3C',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  chipActive: {
    backgroundColor: '#3AABF0',
    borderColor: '#3AABF0',
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dateRow: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  attachRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  attachChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  attachText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 6,
    maxWidth: 140,
  },
  addAttach: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3AABF0',
  },
  addAttachText: {
    color: '#3AABF0',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
});
