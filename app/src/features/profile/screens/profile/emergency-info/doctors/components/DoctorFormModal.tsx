import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DoctorFormData {
  name: string;
  specialty: string;
  phone: string;
  email: string;
  office: string;
  address: string;
  notes: string;
}

interface DoctorFormModalProps {
  visible: boolean;
  isEditing: boolean;
  formData: DoctorFormData;
  onChangeField: (field: keyof DoctorFormData, value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const DoctorFormModal: React.FC<DoctorFormModalProps> = ({
  visible,
  isEditing,
  formData,
  onChangeField,
  onClose,
  onSave,
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={{ padding: 4, opacity: 0 }}>
            <Ionicons name="close" size={24} color="#FF3B30" />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { textAlign: 'center', flex: 1 }]}>
            {isEditing ? 'Edit' : 'Add'} Primary Doctor
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          <Text style={styles.inputLabel}>Doctor Name: *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter doctor's name"
            placeholderTextColor="#8E8E93"
            value={formData.name}
            onChangeText={(text) => onChangeField('name', text)}
          />

          <Text style={styles.inputLabel}>Specialty: *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Family Medicine, Cardiology"
            placeholderTextColor="#8E8E93"
            value={formData.specialty}
            onChangeText={(text) => onChangeField('specialty', text)}
          />

          <Text style={styles.inputLabel}>Phone Number: *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            placeholderTextColor="#8E8E93"
            value={formData.phone}
            onChangeText={(text) => onChangeField('phone', text)}
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>Email: (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            placeholderTextColor="#8E8E93"
            value={formData.email}
            onChangeText={(text) => onChangeField('email', text)}
            keyboardType="email-address"
          />

          <Text style={styles.inputLabel}>Office Name: *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., City Medical Center"
            placeholderTextColor="#8E8E93"
            value={formData.office}
            onChangeText={(text) => onChangeField('office', text)}
          />

          <Text style={styles.inputLabel}>Office Address: (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter office address"
            placeholderTextColor="#8E8E93"
            value={formData.address}
            onChangeText={(text) => onChangeField('address', text)}
          />

          <Text style={styles.inputLabel}>Notes: (Optional)</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Add any additional notes..."
            placeholderTextColor="#8E8E93"
            value={formData.notes}
            onChangeText={(text) => onChangeField('notes', text)}
            multiline
          />
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.saveButton} onPress={onSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default DoctorFormModal;
