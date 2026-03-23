import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RELATIONSHIPS = ['Spouse', 'Partner', 'Parent', 'Child', 'Sibling', 'Friend', 'Doctor', 'Neighbor', 'Colleague', 'Other'];

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  isPrimary: boolean;
  notes?: string;
}

interface Props {
  visible: boolean;
  editingContact: EmergencyContact | null;
  onClose: () => void;
  onSave: (contact: EmergencyContact) => void;
}

const EmergencyContactFormModal: React.FC<Props> = ({ visible, editingContact, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      if (editingContact) {
        setName(editingContact.name);
        setRelationship(editingContact.relationship);
        setPhone(editingContact.phone);
        setSecondaryPhone((editingContact as any).secondaryPhone || '');
        setEmail(editingContact.email || '');
        setIsPrimary(editingContact.isPrimary);
        setNotes(editingContact.notes || '');
      } else {
        setName(''); setRelationship(''); setPhone(''); setSecondaryPhone('');
        setEmail(''); setIsPrimary(false); setNotes('');
      }
    }
  }, [visible, editingContact]);

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Error', 'Please enter a contact name'); return; }
    if (!phone.trim()) { Alert.alert('Error', 'Please enter a phone number'); return; }
    if (!relationship.trim()) { Alert.alert('Error', 'Please select a relationship'); return; }
    onSave({
      id: editingContact?.id ?? Date.now().toString(),
      name: name.trim(),
      relationship,
      phone: phone.trim(),
      secondaryPhone: secondaryPhone.trim() || undefined,
      email: email.trim() || undefined,
      isPrimary,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancelButton}>Cancel</Text></TouchableOpacity>
          <Text style={styles.title}>{editingContact ? 'Edit Contact' : 'Add Contact'}</Text>
          <TouchableOpacity onPress={handleSave}><Text style={styles.saveButton}>Save</Text></TouchableOpacity>
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.field}>
            <Text style={styles.label}>Name: *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter full name" placeholderTextColor="#8E8E93" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Relationship: *</Text>
            <View style={styles.grid}>
              {RELATIONSHIPS.map(r => (
                <TouchableOpacity key={r} style={[styles.chip, relationship === r && styles.chipSelected]} onPress={() => setRelationship(r)}>
                  <Text style={[styles.chipText, relationship === r && styles.chipTextSelected]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Phone Number: *</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Enter phone number" placeholderTextColor="#8E8E93" keyboardType="phone-pad" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Secondary Phone: (Optional)</Text>
            <TextInput style={styles.input} value={secondaryPhone} onChangeText={setSecondaryPhone} placeholder="Enter secondary phone number" placeholderTextColor="#8E8E93" keyboardType="phone-pad" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Email: (Optional)</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter email address" placeholderTextColor="#8E8E93" keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.field}>
            <TouchableOpacity style={styles.primaryToggle} onPress={() => setIsPrimary(!isPrimary)}>
              <View style={styles.primaryToggleLeft}>
                <Ionicons name="star" size={20} color="#FF9500" />
                <Text style={styles.primaryToggleText}>Primary Contact</Text>
              </View>
              <View style={[styles.toggle, isPrimary && styles.toggleActive]}>
                <View style={[styles.toggleThumb, isPrimary && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
            <Text style={styles.primaryDesc}>Primary contact will be called first in emergencies</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Notes: (Optional)</Text>
            <TextInput style={[styles.input, styles.multiline]} value={notes} onChangeText={setNotes} placeholder="Additional notes about this contact" placeholderTextColor="#8E8E93" multiline numberOfLines={3} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EmergencyContactFormModal;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1C1E' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  cancelButton: { fontSize: 16, color: '#007AFF' },
  title: { fontSize: 18, fontWeight: '600', color: '#fff' },
  saveButton: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 20 },
  field: { marginTop: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#8E8E93', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#2C2C2E', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#fff' },
  multiline: { height: 80, textAlignVertical: 'top' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2C2C2E', borderWidth: 1, borderColor: '#3A3A3C' },
  chipSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  chipText: { fontSize: 14, color: '#fff' },
  chipTextSelected: { fontWeight: '600' },
  primaryToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2C2C2E', borderRadius: 10, padding: 16 },
  primaryToggleLeft: { flexDirection: 'row', alignItems: 'center' },
  primaryToggleText: { fontSize: 16, color: '#fff', marginLeft: 12 },
  primaryDesc: { fontSize: 13, color: '#8E8E93', marginTop: 8, paddingHorizontal: 4 },
  toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: '#3A3A3C', justifyContent: 'center', padding: 2 },
  toggleActive: { backgroundColor: '#34C759' },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
  toggleThumbActive: { alignSelf: 'flex-end' },
});
