import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, Linking,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Contacts from 'expo-contacts';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { ProfileTabParamList } from '../../../../../../shared/types';
import EmergencyContactFormModal, { EmergencyContact } from './EmergencyContactFormModal';

type Nav = StackNavigationProp<ProfileTabParamList>;

interface DeviceContact {
  id: string;
  name: string;
  phoneNumbers: Contacts.PhoneNumber[];
  emails: Contacts.Email[];
}

const EmergencyContactsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { profile, updateProfile } = useHealthData();
  const [contacts, setContacts] = useState<EmergencyContact[]>(profile?.emergencyContacts || []);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [deviceContacts, setDeviceContacts] = useState<DeviceContact[]>([]);
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [importedContactForm, setImportedContactForm] = useState<Partial<EmergencyContact> | null>(null);

  const saveContacts = (updated: EmergencyContact[]) => {
    setContacts(updated);
    updateProfile({ ...profile, emergencyContacts: updated });
  };

  const handleSaveContact = (contact: EmergencyContact) => {
    let updated: EmergencyContact[];
    if (editingContact) {
      updated = contacts.map(c => c.id === editingContact.id ? contact : c);
    } else {
      updated = [...contacts, contact];
    }
    if (contact.isPrimary) {
      updated = updated.map(c => c.id === contact.id ? c : { ...c, isPrimary: false });
    }
    saveContacts(updated);
    setModalVisible(false);
    setEditingContact(null);
    setImportedContactForm(null);
  };

  const handleDelete = (id: string) => {
    const c = contacts.find(c => c.id === id);
    Alert.alert('Delete Contact', `Are you sure you want to delete ${c?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => saveContacts(contacts.filter(c => c.id !== id)) },
    ]);
  };

  const openOptions = (c: EmergencyContact) => {
    Alert.alert(c.name, undefined, [
      { text: 'Edit', onPress: () => { setEditingContact(c); setModalVisible(true); } },
      { text: 'Delete', style: 'destructive', onPress: () => handleDelete(c.id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleCallContact = (phone: string) => {
    Alert.alert('Call Contact', 'Call this emergency contact?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL(`tel:${phone.replace(/\s/g, '')}`) },
    ]);
  };

  const handleEmailContact = (email: string) => {
    Alert.alert('Email Contact', 'Send email to this emergency contact?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Email', onPress: () => Linking.openURL(`mailto:${email}`) },
    ]);
  };

  const loadDeviceContacts = async () => {
    try {
      setLoadingContacts(true);
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant contacts permission to import from your device.', [
            { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]);
        return;
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
        sort: Contacts.SortTypes.FirstName,
      });
      const filtered = data.filter(c => c.phoneNumbers?.length).map(c => ({ id: c.id, name: c.name || 'Unknown', phoneNumbers: c.phoneNumbers || [], emails: c.emails || [] }));
      if (filtered.length) { setDeviceContacts(filtered); setSelectionModalVisible(true); }
      else Alert.alert('No Contacts', 'No contacts with phone numbers found.');
    } catch { Alert.alert('Error', 'Failed to load contacts from your device.'); }
    finally { setLoadingContacts(false); }
  };

  const applyDeviceContact = (c: DeviceContact) => {
    setImportedContactForm({
      name: c.name,
      phone: c.phoneNumbers[0]?.number || '',
      secondaryPhone: c.phoneNumbers[1]?.number || undefined,
      email: c.emails[0]?.email || undefined,
    });
    setEditingContact(null);
    setSelectionModalVisible(false);
    setModalVisible(true);
  };

  const ContactCard = ({ contact }: { contact: EmergencyContact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.contactIcon}><Ionicons name="person-outline" size={24} color="#FFFFFF" /></View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactRelationship}>{contact.relationship}</Text>
            {contact.isPrimary && <View style={styles.primaryBadge}><Text style={styles.primaryBadgeText}>Primary</Text></View>}
          </View>
        </View>
        <TouchableOpacity style={[styles.moreButton, { position: 'absolute', top: 6, right: 6 }]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={() => openOptions(contact)} accessibilityLabel="Edit contact">
          <Feather name="edit-2" size={18} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity style={styles.actionChipPrimary} onPress={() => handleCallContact(contact.phone)}>
          <Ionicons name="call-outline" size={18} color="#007AFF" />
          <Text style={styles.actionChipPrimaryText}>Call {contact.phone}</Text>
        </TouchableOpacity>
        {contact.email && (
          <TouchableOpacity style={styles.actionChip} onPress={() => handleEmailContact(contact.email!)}>
            <Ionicons name="mail-outline" size={18} color="#007AFF" />
            <Text style={styles.actionChipText}>Email</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.detailsContainer}>
        {contact.email && (
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color="#8E8E93" />
            <Text style={styles.detailText}>{contact.email}</Text>
          </View>
        )}
        {contact.notes && (
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={16} color="#8E8E93" />
            <Text style={styles.detailText}>{contact.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.headerText} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 100 }}>
        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="warning-outline" size={64} color="#FF3B30" style={{ opacity: 0.3 }} />
            <Text style={styles.emptyStateTitle}>No Emergency Contacts</Text>
            <Text style={styles.emptyStateText}>Add emergency contacts who can be reached in case of a medical emergency</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => { setEditingContact(null); setModalVisible(true); }}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Emergency Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.importButton} onPress={loadDeviceContacts} disabled={loadingContacts}>
              <Ionicons name="download-outline" size={20} color="#007AFF" />
              <Text style={styles.importButtonText}>{loadingContacts ? 'Loading Contacts...' : 'Import from Contacts'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {contacts.map(c => <ContactCard key={c.id} contact={c} />)}
            <TouchableOpacity style={styles.addMoreButton} onPress={() => { setEditingContact(null); setModalVisible(true); }}>
              <Ionicons name="add" size={20} color="#007AFF" />
              <Text style={styles.addMoreButtonText}>Add Another Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.importButtonSecondary} onPress={loadDeviceContacts} disabled={loadingContacts}>
              <Ionicons name="download-outline" size={20} color="#007AFF" />
              <Text style={styles.importButtonSecondaryText}>{loadingContacts ? 'Loading Contacts...' : 'Import from Contacts'}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <EmergencyContactFormModal
        visible={modalVisible}
        editingContact={editingContact ?? (importedContactForm ? { ...(importedContactForm as EmergencyContact), id: '', relationship: '', isPrimary: false } : null)}
        onClose={() => { setModalVisible(false); setEditingContact(null); setImportedContactForm(null); }}
        onSave={handleSaveContact}
      />

      {/* Device Contact Selection Modal */}
      <Modal visible={selectionModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.selectionContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectionModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Contact</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {deviceContacts.map(c => (
              <TouchableOpacity key={c.id} style={styles.contactSelectRow} onPress={() => applyDeviceContact(c)}>
                <View style={styles.contactSelectInfo}>
                  <Text style={styles.contactSelectName}>{c.name}</Text>
                  <Text style={styles.contactSelectMeta}>{c.phoneNumbers[0]?.number || 'No phone'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { paddingTop: 72, paddingBottom: 5, backgroundColor: '#181818', borderBottomWidth: 1, borderBottomColor: '#222', justifyContent: 'space-between', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  backButton: { padding: 8, position: 'absolute', left: 20, top: -46.2, zIndex: 1 },
  headerText: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyStateTitle: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: 16, color: '#8E8E93', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12 },
  addButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginLeft: 8 },
  importButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderWidth: 1, borderColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 12 },
  importButtonText: { fontSize: 16, fontWeight: '600', color: '#007AFF', marginLeft: 8 },
  contactCard: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#2C2C2E', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  contactHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  contactIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2C2C2E', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  contactRelationship: { fontSize: 14, color: '#8E8E93' },
  moreButton: { backgroundColor: 'transparent' },
  primaryBadge: { backgroundColor: '#FF9500', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  primaryBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  contactActions: { flexDirection: 'row', marginBottom: 16, gap: 12 },
  actionChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2C2C2E', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#007AFF', flex: 1 },
  actionChipText: { color: '#007AFF', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  actionChipPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2C2C2E', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#007AFF', flex: 1 },
  actionChipPrimaryText: { color: '#007AFF', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  detailsContainer: { gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 14, color: '#8E8E93', marginLeft: 8 },
  addMoreButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1C1C1E', paddingVertical: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#007AFF' },
  addMoreButtonText: { fontSize: 16, fontWeight: '600', color: '#007AFF', marginLeft: 8 },
  importButtonSecondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', paddingVertical: 14, borderRadius: 12, marginBottom: 32, borderWidth: 1, borderColor: '#3A3A3C' },
  importButtonSecondaryText: { fontSize: 16, color: '#007AFF', marginLeft: 8 },
  selectionContainer: { flex: 1, backgroundColor: '#1C1C1E' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  modalCloseButton: { padding: 4 },
  modalCloseButtonText: { fontSize: 16, color: '#007AFF' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  contactSelectRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  contactSelectInfo: { flex: 1 },
  contactSelectName: { fontSize: 16, color: '#fff', fontWeight: '500', marginBottom: 2 },
  contactSelectMeta: { fontSize: 14, color: '#8E8E93' },
});

export default EmergencyContactsScreen; 
