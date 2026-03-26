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
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={22} color="#FF3B30" />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { textAlign: 'center', flex: 1 }]}>
            {isEditing ? 'Edit' : 'Add'} Primary Doctor
          </Text>
          <TouchableOpacity
            onPress={onSave}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="checkmark" size={22} color="#34C759" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.inputGroup}>
            <TextInput style={styles.groupInput} placeholder="Doctor Name *" placeholderTextColor="#8E8E93" value={formData.name} onChangeText={(t) => onChangeField('name', t)} />
            <View style={styles.groupDivider} />
            <TextInput style={styles.groupInput} placeholder="Specialty *" placeholderTextColor="#8E8E93" value={formData.specialty} onChangeText={(t) => onChangeField('specialty', t)} />
            <View style={styles.groupDivider} />
            <TextInput style={styles.groupInput} placeholder="Phone Number *" placeholderTextColor="#8E8E93" value={formData.phone} onChangeText={(t) => onChangeField('phone', t)} keyboardType="phone-pad" />
            <View style={styles.groupDivider} />
            <TextInput style={styles.groupInput} placeholder="Email" placeholderTextColor="#555" value={formData.email} onChangeText={(t) => onChangeField('email', t)} keyboardType="email-address" />
          </View>

          <View style={[styles.inputGroup, { marginTop: 20 }]}>
            <TextInput style={styles.groupInput} placeholder="Office Name *" placeholderTextColor="#8E8E93" value={formData.office} onChangeText={(t) => onChangeField('office', t)} />
            <View style={styles.groupDivider} />
            <TextInput style={styles.groupInput} placeholder="Office Address" placeholderTextColor="#555" value={formData.address} onChangeText={(t) => onChangeField('address', t)} />
          </View>

          <View style={[styles.inputGroup, { marginTop: 20 }]}>
            <TextInput style={[styles.groupInput, { height: 70, textAlignVertical: 'top', paddingTop: 14 }]} placeholder="Notes" placeholderTextColor="#555" value={formData.notes} onChangeText={(t) => onChangeField('notes', t)} multiline />
          </View>
        </ScrollView>

      </TouchableOpacity>
    </TouchableOpacity>
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
    paddingBottom: 40,
  },
  inputGroup: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  groupInput: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: '#FFFFFF',
  },
  groupDivider: {
    height: 1,
    backgroundColor: '#3A3A3C',
    marginLeft: 16,
  },
});

export default DoctorFormModal;
