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
import { useHealthData } from '../../context/HealthDataContext';
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
  const { profile, updateProfile } = useHealthData();
  const [contacts, setContacts] = useState<EmergencyContact[]>(profile?.emergencyContacts || []);
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

    const newContact: EmergencyContact = {
      id: editingContact?.id || Date.now().toString(),
      name: contactForm.name.trim(),
      relationship: contactForm.relationship,
      phone: contactForm.phone.trim(),
      email: contactForm.email.trim() || undefined,
      isPrimary: contactForm.isPrimary,
      notes: contactForm.notes.trim() || undefined,
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
    updateProfile({
      ...profile,
      emergencyContacts: updatedContacts,
    });
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
            updateProfile({
              ...profile,
              emergencyContacts: updatedContacts,
            });
          },
        },
      ]
    );
  };

  const handleCallContact = (phone: string) => {
    Alert.alert(
      'Call Contact',
      `Call this emergency contact?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            const phoneNumber = phone.replace(/\s/g, '');
            Linking.openURL(`tel:${phoneNumber}`);
          },
        },
      ]
    );
  };

  const handleEmailContact = (email: string) => {
    Alert.alert(
      'Email Contact',
      `Send email to this emergency contact?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => {
            Linking.openURL(`mailto:${email}`);
          },
        },
      ]
    );
  };

  const ContactItem = ({ contact }: { contact: EmergencyContact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={styles.contactIcon}>
          <Ionicons name="person-outline" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactRelationship}>{contact.relationship}</Text>
          {contact.isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryBadgeText}>Primary</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.contactActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleCallContact(contact.phone)}
        >
          <Ionicons name="call-outline" size={20} color="#4CD964" />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        
        {contact.email && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEmailContact(contact.email!)}
          >
            <Ionicons name="mail-outline" size={20} color="#007AFF" />
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{contact.phone}</Text>
        </View>
        
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

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEditContact(contact)}
        >
          <Ionicons name="create-outline" size={20} color="#007AFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteContact(contact.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Emergency Contacts</Text>
            <Text style={styles.headerSubtitle}>Manage your emergency contacts</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name="warning-outline" 
              size={64} 
              color="#FF3B30" 
              style={{ opacity: 0.3 }}
            />
            <Text style={styles.emptyStateTitle}>No Emergency Contacts</Text>
            <Text style={styles.emptyStateText}>
              Add emergency contacts who can be reached in case of a medical emergency
            </Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddContact}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Emergency Contact</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {contacts.map((contact) => (
              <ContactItem key={contact.id} contact={contact} />
            ))}
            
            <TouchableOpacity 
              style={styles.addMoreButton}
              onPress={handleAddContact}
            >
              <Ionicons name="add" size={20} color="#007AFF" />
              <Text style={styles.addMoreButtonText}>Add Another Contact</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Add/Edit Contact Modal */}
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
                placeholderTextColor="#8E8E93"
              />
            </View>

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

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                value={contactForm.phone}
                onChangeText={(text) => setContactForm({ ...contactForm, phone: text })}
                placeholder="Enter phone number"
                placeholderTextColor="#8E8E93"
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
                placeholderTextColor="#8E8E93"
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
                placeholderTextColor="#8E8E93"
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
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#000000',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  contactCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contactRelationship: {
    fontSize: 14,
    color: '#8E8E93',
  },
  primaryBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  primaryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 6,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B30',
    marginLeft: 6,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addMoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#2C2C2E',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#1C1C1E',
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
    borderColor: '#2C2C2E',
    backgroundColor: '#1C1C1E',
  },
  relationshipOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  relationshipOptionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  relationshipOptionTextSelected: {
    color: '#FFFFFF',
  },
  primaryToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  primaryToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryToggleText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  primaryToggleDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
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
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});

export default EmergencyContactsScreen; 