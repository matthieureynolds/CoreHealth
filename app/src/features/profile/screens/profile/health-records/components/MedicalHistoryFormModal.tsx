import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabConfig {
  id: number;
  title: string;
  icon: string;
  color: string;
}

interface MedicalHistoryFormModalProps {
  visible: boolean;
  activeTab: number;
  tabConfig: TabConfig;
  editingItem: any;
  formData: any;
  setFormData: (data: any) => void;
  onClose: () => void;
  onSave: () => void;
}

const MedicalHistoryFormModal: React.FC<MedicalHistoryFormModalProps> = ({
  visible,
  activeTab,
  tabConfig,
  editingItem,
  formData,
  setFormData,
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
          <Text style={styles.modalTitle}>
            {editingItem ? 'Edit' : 'Add'} {tabConfig.title.slice(0, -1)}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          {activeTab === 0 && (
            <>
              <Text style={styles.inputLabel}>Condition Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter condition name"
                placeholderTextColor="#8E8E93"
                value={formData.condition}
                onChangeText={(text) => setFormData({ ...formData, condition: text })}
              />
              <Text style={styles.inputLabel}>Diagnosed Date (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#8E8E93"
                value={formData.diagnosedDate}
                onChangeText={(text) => setFormData({ ...formData, diagnosedDate: text })}
              />
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Add any notes..."
                placeholderTextColor="#8E8E93"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
              />
            </>
          )}

          {activeTab === 1 && (
            <>
              <Text style={styles.inputLabel}>Medication Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter medication name"
                placeholderTextColor="#8E8E93"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              <Text style={styles.inputLabel}>Dosage (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 10mg daily"
                placeholderTextColor="#8E8E93"
                value={formData.dosage}
                onChangeText={(text) => setFormData({ ...formData, dosage: text })}
              />
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Add any notes..."
                placeholderTextColor="#8E8E93"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
              />
            </>
          )}

          {activeTab === 2 && (
            <>
              <Text style={styles.inputLabel}>Allergy</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter allergy (e.g., Peanuts, Penicillin)"
                placeholderTextColor="#8E8E93"
                value={formData.allergy}
                onChangeText={(text) => setFormData({ ...formData, allergy: text })}
              />
            </>
          )}

          {activeTab === 3 && (
            <>
              <Text style={styles.inputLabel}>Relation</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Father, Mother, Sister"
                placeholderTextColor="#8E8E93"
                value={formData.relation}
                onChangeText={(text) => setFormData({ ...formData, relation: text })}
              />
              <Text style={styles.inputLabel}>Condition</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter condition"
                placeholderTextColor="#8E8E93"
                value={formData.condition}
                onChangeText={(text) => setFormData({ ...formData, condition: text })}
              />
              <Text style={styles.inputLabel}>Age of Onset (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 45"
                placeholderTextColor="#8E8E93"
                value={formData.ageOfOnset}
                onChangeText={(text) => setFormData({ ...formData, ageOfOnset: text })}
                keyboardType="numeric"
              />
            </>
          )}

          {activeTab === 4 && (
            <>
              <Text style={styles.inputLabel}>Vaccination Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., COVID-19, Flu Shot"
                placeholderTextColor="#8E8E93"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              <Text style={styles.inputLabel}>Date Received</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#8E8E93"
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
              />
              <Text style={styles.inputLabel}>Location (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Doctor's Office, Pharmacy"
                placeholderTextColor="#8E8E93"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />
            </>
          )}

          {activeTab === 5 && (
            <>
              <Text style={styles.inputLabel}>Procedure Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Appendectomy, Knee Surgery"
                placeholderTextColor="#8E8E93"
                value={formData.procedure}
                onChangeText={(text) => setFormData({ ...formData, procedure: text })}
              />
              <Text style={styles.inputLabel}>Date of Surgery</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#8E8E93"
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
              />
              <Text style={styles.inputLabel}>Hospital (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Hospital name"
                placeholderTextColor="#8E8E93"
                value={formData.hospital}
                onChangeText={(text) => setFormData({ ...formData, hospital: text })}
              />
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Add any notes..."
                placeholderTextColor="#8E8E93"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
              />
            </>
          )}
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
    backgroundColor: '#3AABF0',
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

export default MedicalHistoryFormModal;
