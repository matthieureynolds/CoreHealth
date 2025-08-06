import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../context/HealthDataContext';
import { MedicalCondition } from '../../types';

const ConditionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { profile, updateProfile } = useHealthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [condition, setCondition] = useState('');
  const [diagnosedDate, setDiagnosedDate] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [status, setStatus] = useState<'active' | 'resolved' | 'managed'>('active');
  const [notes, setNotes] = useState('');

  const severityOptions = [
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'managed', label: 'Managed' },
  ];

  const addCondition = () => {
    if (!condition.trim()) {
      Alert.alert('Error', 'Please enter a condition name');
      return;
    }

    const newCondition: MedicalCondition = {
      id: Date.now().toString(),
      condition: condition.trim(),
      diagnosedDate: diagnosedDate || new Date().toISOString().split('T')[0],
      severity,
      status,
      notes: notes.trim() || undefined,
    };

    const updatedConditions = [...(profile?.medicalHistory || []), newCondition];
    updateProfile({
      ...profile,
      medicalHistory: updatedConditions,
    });

    setShowAddModal(false);
    setCondition('');
    setDiagnosedDate('');
    setSeverity('mild');
    setStatus('active');
    setNotes('');
  };

  const deleteCondition = (id: string) => {
    Alert.alert(
      'Delete Condition',
      'Are you sure you want to delete this condition?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedConditions = profile?.medicalHistory?.filter(c => c.id !== id) || [];
            updateProfile({
              ...profile,
              medicalHistory: updatedConditions,
            });
          },
        },
      ]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return '#4CD964';
      case 'moderate': return '#FF9500';
      case 'severe': return '#FF3B30';
      default: return '#888';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#FF3B30';
      case 'resolved': return '#4CD964';
      case 'managed': return '#007AFF';
      default: return '#888';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medical Conditions</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Conditions List */}
        <View style={styles.content}>
          {profile?.medicalHistory?.length ? (
            profile.medicalHistory.map((condition) => (
              <View key={condition.id} style={styles.conditionCard}>
                <View style={styles.conditionHeader}>
                  <View style={styles.conditionInfo}>
                    <Text style={styles.conditionName}>{condition.condition}</Text>
                    <Text style={styles.conditionDate}>Diagnosed: {condition.diagnosedDate}</Text>
                    <View style={styles.conditionTags}>
                      <View style={[styles.tag, { backgroundColor: getSeverityColor(condition.severity) + '20' }]}>
                        <Text style={[styles.tagText, { color: getSeverityColor(condition.severity) }]}>
                          {condition.severity.charAt(0).toUpperCase() + condition.severity.slice(1)}
                        </Text>
                      </View>
                      <View style={[styles.tag, { backgroundColor: getStatusColor(condition.status) + '20' }]}>
                        <Text style={[styles.tagText, { color: getStatusColor(condition.status) }]}>
                          {condition.status.charAt(0).toUpperCase() + condition.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                    {condition.notes && <Text style={styles.notes}>{condition.notes}</Text>}
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteCondition(condition.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No Conditions</Text>
              <Text style={styles.emptySubtitle}>Add your medical conditions to keep track of your health</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.addFirstButtonText}>Add Condition</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Condition Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Condition</Text>
            <TouchableOpacity onPress={addCondition}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Condition Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Condition Name *</Text>
              <TextInput
                style={styles.textInput}
                value={condition}
                onChangeText={setCondition}
                placeholder="e.g., Diabetes, Hypertension"
                placeholderTextColor="#666"
              />
            </View>

            {/* Diagnosed Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Diagnosed Date</Text>
              <TextInput
                style={styles.textInput}
                value={diagnosedDate}
                onChangeText={setDiagnosedDate}
                placeholder="YYYY-MM-DD (optional)"
                placeholderTextColor="#666"
              />
            </View>

            {/* Severity */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Severity</Text>
              <View style={styles.optionsContainer}>
                {severityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      severity === option.value && styles.selectedOption
                    ]}
                    onPress={() => setSeverity(option.value as any)}
                  >
                    <Text style={[
                      styles.optionText,
                      severity === option.value && styles.selectedOptionText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.optionsContainer}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      status === option.value && styles.selectedOption
                    ]}
                    onPress={() => setStatus(option.value as any)}
                  >
                    <Text style={[
                      styles.optionText,
                      status === option.value && styles.selectedOptionText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes about this condition"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#111',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  addButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  conditionCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  conditionInfo: {
    flex: 1,
  },
  conditionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  conditionDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  conditionTags: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notes: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#111',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#181818',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#fff',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ConditionsScreen; 