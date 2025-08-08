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
import IOSDatePicker from '../../components/IOSDatePicker';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../context/HealthDataContext';
import { FamilyCondition } from '../../types';

const FamilyHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [relation, setRelation] = useState('');
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [condition, setCondition] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [ageOfOnset, setAgeOfOnset] = useState<Date | null>(null);
  const [showAgeOfOnsetPicker, setShowAgeOfOnsetPicker] = useState(false);
  const [notes, setNotes] = useState('');

  const relationOptions = [
    'Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter',
    'Paternal Grandfather', 'Paternal Grandmother',
    'Maternal Grandfather', 'Maternal Grandmother',
    'Uncle', 'Aunt', 'Cousin'
  ];

  const commonConditions = [
    'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'Heart Disease',
    'Stroke', 'Cancer', 'Breast Cancer', 'Lung Cancer', 'Colon Cancer',
    'Prostate Cancer', 'Ovarian Cancer', 'Skin Cancer', 'Leukemia',
    'Lymphoma', 'Alzheimer\'s Disease', 'Parkinson\'s Disease',
    'Multiple Sclerosis', 'Epilepsy', 'Asthma', 'COPD', 'Emphysema',
    'Kidney Disease', 'Liver Disease', 'Cirrhosis', 'Hepatitis',
    'Ulcerative Colitis', 'Crohn\'s Disease', 'Celiac Disease',
    'Rheumatoid Arthritis', 'Lupus', 'Psoriasis', 'Eczema',
    'Depression', 'Anxiety', 'Bipolar Disorder', 'Schizophrenia',
    'ADHD', 'Autism', 'Down Syndrome', 'Cystic Fibrosis',
    'Sickle Cell Anemia', 'Hemophilia', 'Muscular Dystrophy',
    'Huntington\'s Disease', 'Tourette Syndrome'
  ];

  const addFamilyCondition = () => {
    if (!relation.trim() || !condition.trim()) {
      Alert.alert('Error', 'Please enter both relation and condition');
      return;
    }

    const newFamilyCondition: FamilyCondition = {
      id: Date.now().toString(),
      relation: relation.trim(),
      condition: condition.trim(),
      ageOfOnset: ageOfOnset ? Math.floor((new Date().getTime() - ageOfOnset.getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : undefined,
      notes: notes.trim() || undefined,
    };

    const updatedFamilyHistory = [...(profile?.familyHistory || []), newFamilyCondition];
    updateProfile({
      ...profile,
      familyHistory: updatedFamilyHistory,
    });

    setShowAddModal(false);
    setRelation('');
    setCondition('');
    setAgeOfOnset(null);
    setNotes('');
  };

  const deleteFamilyCondition = (id: string) => {
    Alert.alert(
      'Delete Family History',
      'Are you sure you want to delete this family condition?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedFamilyHistory = profile?.familyHistory?.filter(f => f.id !== id) || [];
            updateProfile({
              ...profile,
              familyHistory: updatedFamilyHistory,
            });
          },
        },
      ]
    );
  };

  const formatAge = (age: number) => {
    return `${age} years old`;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Family History</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Family History List */}
        <View style={styles.content}>
          {profile?.familyHistory?.length ? (
            profile.familyHistory.map((familyCondition) => (
              <View key={familyCondition.id} style={styles.familyCard}>
                <View style={styles.familyHeader}>
                  <View style={styles.familyInfo}>
                    <Text style={styles.relation}>{familyCondition.relation}</Text>
                    <Text style={styles.condition}>{familyCondition.condition}</Text>
                    {familyCondition.ageOfOnset && (
                      <Text style={styles.ageOfOnset}>Age of onset: {formatAge(familyCondition.ageOfOnset)}</Text>
                    )}
                    {familyCondition.notes && <Text style={styles.notes}>{familyCondition.notes}</Text>}
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteFamilyCondition(familyCondition.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No Family History</Text>
              <Text style={styles.emptySubtitle}>Add family medical conditions to help with risk assessment</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.addFirstButtonText}>Add Family History</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Family History Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Family History</Text>
            <TouchableOpacity onPress={addFamilyCondition}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Relation */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Relation *</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowRelationPicker(true)}
              >
                <Text style={[styles.dateInputText, !relation && styles.placeholderText]}>
                  {relation || 'Select relation'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {/* Condition */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Condition *</Text>
              <TextInput
                style={styles.textInput}
                value={condition}
                onChangeText={(text) => {
                  setCondition(text);
                  setShowSuggestions(text.length > 0);
                }}
                placeholder="e.g., Diabetes, Heart Disease, Cancer"
                placeholderTextColor="#666"
              />
              {showSuggestions && condition.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {commonConditions
                    .filter(c => c.toLowerCase().includes(condition.toLowerCase()))
                    .slice(0, 5)
                    .map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setCondition(suggestion);
                          setShowSuggestions(false);
                        }}
                      >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>

            {/* Age of Onset */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Age of Onset (Optional)</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowAgeOfOnsetPicker(true)}
              >
                <Text style={[styles.dateInputText, !ageOfOnset && styles.placeholderText]}>
                  {ageOfOnset ? formatAge(Math.floor((new Date().getTime() - ageOfOnset.getTime()) / (1000 * 60 * 60 * 24 * 365.25))) : 'Select age'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {/* Notes */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes about this family condition"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Relation Picker */}
      <Modal
        visible={showRelationPicker}
        transparent={true}
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setShowRelationPicker(false)}
      >
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Relation</Text>
              <TouchableOpacity onPress={() => setShowRelationPicker(false)}>
                <Ionicons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.ethnicityPickerOptions} showsVerticalScrollIndicator={false}>
              {relationOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.ethnicityPickerOption}
                  onPress={() => {
                    setRelation(option);
                    setShowRelationPicker(false);
                  }}
                >
                  <Text style={styles.ethnicityPickerOptionText}>{option}</Text>
                  {relation === option && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Age of Onset Picker */}
      <IOSDatePicker
        visible={showAgeOfOnsetPicker}
        title="Age of Onset"
        value={ageOfOnset ?? new Date()}
        minimumDate={new Date(1900, 0, 1)}
        maximumDate={new Date()}
        onConfirm={(d) => {
          setAgeOfOnset(d);
          setShowAgeOfOnsetPicker(false);
        }}
        onCancel={() => setShowAgeOfOnsetPicker(false)}
      />
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
  familyCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  familyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  familyInfo: {
    flex: 1,
  },
  relation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  condition: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  ageOfOnset: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
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
  suggestionsContainer: {
    backgroundColor: '#181818',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  suggestionText: {
    color: '#fff',
    fontSize: 16,
  },
  dateInput: {
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputText: {
    fontSize: 16,
    color: '#fff',
  },
  placeholderText: {
    color: '#666',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  datePickerContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    minWidth: 300,
    maxWidth: 350,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  datePicker: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 12,
    padding: 10,
  },
  datePickerSaveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
    alignItems: 'center',
  },
  datePickerSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ethnicityPickerOptions: {
    maxHeight: 300,
  },
  ethnicityPickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  ethnicityPickerOptionText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
});

export default FamilyHistoryScreen; 