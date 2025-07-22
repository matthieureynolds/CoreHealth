import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSettings } from '../../context/SettingsContext';
import { ProfileTabParamList } from '../../types';

type EmergencyContactsScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  notes?: string;
}

interface ContactForm {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isPrimary: boolean;
  notes: string;
}

const EmergencyContactsScreen: React.FC = () => {
  const navigation = useNavigation<EmergencyContactsScreenNavigationProp>();
  const { settings, updateHealthEmergencySettings } = useSettings();
  const [contacts, setContacts] = useState<EmergencyContact[]>(settings.healthEmergency.emergencyContacts || []);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    isPrimary: false,
    notes: '',
  });

  const relationships = [
    'Spouse',
    'Partner',
    'Parent',
    'Child',
    'Sibling',
    'Friend',
    'Doctor',
    'Neighbor',
    'Colleague',
    'Other',
  ];

  const resetForm = () => {
    setContactForm({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      isPrimary: false,
      notes: '',
    });
    setEditingContact(null);
  };

  const handleAddContact = () => {
    setModalVisible(true);
    resetForm();
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email || '',
      isPrimary: contact.isPrimary,
      notes: contact.notes || '',
    });
    setModalVisible(true);
  };

  const handleSaveContact = () => {
    if (!contactForm.name.trim()) {
      Alert.alert('Error', 'Please enter a contact name');
      return;
    }

    if (!contactForm.phone.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    if (!contactForm.relationship.trim()) {
      Alert.alert('Error', 'Please select a relationship');
      return;
    }

    // Phone number validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(contactForm.phone.replace(/[^\d\+]/g, ''))) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    const newContact: EmergencyContact = {
      id: editingContact?.id || Date.now().toString(),
      name: contactForm.name,
      relationship: contactForm.relationship,
      phone: contactForm.phone,
      email: contactForm.email || undefined,
      isPrimary: contactForm.isPrimary,
      notes: contactForm.notes || undefined,
    };

    let updatedContacts: EmergencyContact[];

    if (editingContact) {
      // Update existing contact
      updatedContacts = contacts.map(contact => 
        contact.id === editingContact.id ? newContact : contact
      );
    } else {
      // Add new contact
      updatedContacts = [...contacts, newContact];
    }

    // If setting as primary, remove primary from others
    if (newContact.isPrimary) {
      updatedContacts = updatedContacts.map(contact => 
        contact.id === newContact.id ? contact : { ...contact, isPrimary: false }
      );
    }

    setContacts(updatedContacts);
    updateHealthEmergencySettings({ emergencyContacts: updatedContacts });
    setModalVisible(false);
    resetForm();
  };

  const handleDeleteContact = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedContacts = contacts.filter(c => c.id !== contactId);
            setContacts(updatedContacts);
            updateHealthEmergencySettings({ emergencyContacts: updatedContacts });
          },
        },
      ]
    );
  };

  const handleCallContact = (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    Linking.openURL(phoneUrl);
  };

  const handleEmailContact = (email: string) => {
    const emailUrl = `mailto:${email}`;
    Linking.openURL(emailUrl);
  };

  const RelationshipPicker = () => (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>Relationship *</Text>
      <View style={styles.relationshipGrid}>
        {relationships.map((relationship) => (
          <TouchableOpacity
            key={relationship}
            style={[
              styles.relationshipOption,
              contactForm.relationship === relationship && styles.relationshipOptionSelected,
            ]}
            onPress={() => setContactForm({ ...contactForm, relationship })}
          >
            <Text
              style={[
                styles.relationshipOptionText,
                contactForm.relationship === relationship && styles.relationshipOptionTextSelected,
              ]}
            >
              {relationship}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const ContactItem = ({ contact }: { contact: EmergencyContact }) => (
    <View style={styles.contactItem}>
      <View style={styles.contactHeader}>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactRelationship}>{contact.relationship}</Text>
          {contact.isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryBadgeText}>Primary</Text>
            </View>
          )}
        </View>
        <View style={styles.contactActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCallContact(contact.phone)}
          >
            <Ionicons name="call" size={20} color="#007AFF" />
          </TouchableOpacity>
          {contact.email && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEmailContact(contact.email!)}
            >
              <Ionicons name="mail" size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditContact(contact)}
          >
            <Ionicons name="pencil" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteContact(contact.id)}
          >
            <Ionicons name="trash" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.contactDetails}>
        <View style={styles.contactDetailItem}>
          <Ionicons name="call-outline" size={16} color="#666" />
          <Text style={styles.contactDetailText}>{contact.phone}</Text>
        </View>
        {contact.email && (
          <View style={styles.contactDetailItem}>
            <Ionicons name="mail-outline" size={16} color="#666" />
            <Text style={styles.contactDetailText}>{contact.email}</Text>
          </View>
        )}
        {contact.notes && (
          <View style={styles.contactDetailItem}>
            <Ionicons name="document-text-outline" size={16} color="#666" />
            <Text style={styles.contactDetailText}>{contact.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddContact}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="medical" size={24} color="#FF3B30" />
            <Text style={styles.infoTitle}>Emergency Contacts</Text>
            <Text style={styles.infoText}>
              These contacts can be reached in case of a medical emergency. Make sure to keep this information up to date.
            </Text>
          </View>
        </View>

        <View style={styles.contactsSection}>
          <Text style={styles.sectionTitle}>Contacts ({contacts.length})</Text>
          
          {contacts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#999" />
              <Text style={styles.emptyStateTitle}>No Emergency Contacts</Text>
              <Text style={styles.emptyStateText}>
                Add emergency contacts who can be reached in case of a medical emergency.
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={handleAddContact}
              >
                <Text style={styles.emptyStateButtonText}>Add First Contact</Text>
              </TouchableOpacity>
            </View>
          ) : (
            contacts.map((contact) => (
              <ContactItem key={contact.id} contact={contact} />
            ))
          )}
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <View style={styles.tipItem}>
            <Ionicons name="star" size={16} color="#FF9500" />
            <Text style={styles.tipText}>
              Set one contact as "Primary" for first responders to contact
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="phone-portrait" size={16} color="#FF9500" />
            <Text style={styles.tipText}>
              Include area codes for all phone numbers
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="refresh" size={16} color="#FF9500" />
            <Text style={styles.tipText}>
              Review and update contact information regularly
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveContact}
            >
              <Text style={styles.modalSaveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Name *</Text>
              <TextInput
                style={styles.textInput}
                value={contactForm.name}
                onChangeText={(text) => setContactForm({ ...contactForm, name: text })}
                placeholder="Enter full name"
                placeholderTextColor="#999"
              />
            </View>

            <RelationshipPicker />

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                value={contactForm.phone}
                onChangeText={(text) => setContactForm({ ...contactForm, phone: text })}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Email (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={contactForm.email}
                onChangeText={(text) => setContactForm({ ...contactForm, email: text })}
                placeholder="Enter email address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formField}>
              <TouchableOpacity
                style={styles.primaryToggle}
                onPress={() => setContactForm({ ...contactForm, isPrimary: !contactForm.isPrimary })}
              >
                <View style={styles.primaryToggleLeft}>
                  <Ionicons name="star" size={20} color="#FF9500" />
                  <Text style={styles.primaryToggleText}>Primary Contact</Text>
                </View>
                <View style={[styles.toggle, contactForm.isPrimary && styles.toggleActive]}>
                  <View style={[styles.toggleThumb, contactForm.isPrimary && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>
              <Text style={styles.primaryToggleDescription}>
                Primary contact will be called first in emergencies
              </Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={contactForm.notes}
                onChangeText={(text) => setContactForm({ ...contactForm, notes: text })}
                placeholder="Additional notes about this contact"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  infoSection: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  contactsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  contactRelationship: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  primaryBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  primaryBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  contactDetails: {
    gap: 8,
  },
  contactDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactDetailText: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsSection: {
    padding: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  modalCloseButton: {
    width: 60,
  },
  modalCloseButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  modalSaveButton: {
    width: 60,
    alignItems: 'flex-end',
  },
  modalSaveButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  relationshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relationshipOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  relationshipOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  relationshipOptionText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  relationshipOptionTextSelected: {
    color: '#fff',
  },
  primaryToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  primaryToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryToggleText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  primaryToggleDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});

export default EmergencyContactsScreen; 