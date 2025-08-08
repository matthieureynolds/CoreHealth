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
import { Allergy } from '../../types';

const AllergiesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [allergy, setAllergy] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [status, setStatus] = useState<'active' | 'resolved'>('active');
  const [reaction, setReaction] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [notes, setNotes] = useState('');

  const commonAllergies = [
    'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish',
    'Latex', 'Dust Mites', 'Pollen', 'Pet Dander', 'Mold', 'Grass', 'Ragweed',
    'Penicillin', 'Sulfa Drugs', 'Aspirin', 'Ibuprofen', 'Codeine', 'Morphine',
    'Bee Stings', 'Wasp Stings', 'Fire Ants', 'Dairy', 'Gluten', 'Sesame',
    'Mustard', 'Celery', 'Lupin', 'Molluscs', 'Sulfites', 'Nitrates'
  ];

  const severityOptions = [
    { value: 'mild', label: 'Mild', color: '#4CD964' },
    { value: 'moderate', label: 'Moderate', color: '#FF9500' },
    { value: 'severe', label: 'Severe', color: '#FF3B30' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'resolved', label: 'Resolved' },
  ];

  const addAllergy = () => {
    if (!allergy.trim()) {
      Alert.alert('Error', 'Please enter an allergy name');
      return;
    }

    const newAllergy: Allergy = {
      id: Date.now().toString(),
      name: allergy.trim(),
      severity,
      status,
      reaction: reaction.trim() || undefined,
      startDate: startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: status === 'resolved' && endDate ? endDate.toISOString().split('T')[0] : undefined,
      notes: notes.trim() || undefined,
    };

    const updatedAllergies = [...(profile?.allergies || []), newAllergy];
    updateProfile({
      ...profile,
      allergies: updatedAllergies,
    });

    setShowAddModal(false);
    setAllergy('');
    setSeverity('mild');
    setStatus('active');
    setReaction('');
    setStartDate(null);
    setEndDate(null);
    setNotes('');
  };

  const deleteAllergy = (id: string) => {
    Alert.alert(
      'Delete Allergy',
      'Are you sure you want to delete this allergy?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedAllergies = profile?.allergies?.filter(a => a.id !== id) || [];
            updateProfile({
              ...profile,
              allergies: updatedAllergies,
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Allergies</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Allergies List */}
        <View style={styles.content}>
          {profile?.allergies?.length ? (
            profile.allergies.map((allergy) => (
              <View key={allergy.id} style={styles.allergyCard}>
                <View style={styles.allergyHeader}>
                  <View style={styles.allergyInfo}>
                    <Text style={styles.allergyName}>{allergy.name}</Text>
                    <View style={styles.allergyTags}>
                      <View style={[styles.tag, { backgroundColor: getSeverityColor(allergy.severity) + '20' }]}>
                        <Text style={[styles.tagText, { color: getSeverityColor(allergy.severity) }]}>
                          {allergy.severity.charAt(0).toUpperCase() + allergy.severity.slice(1)}
                        </Text>
                      </View>
                    </View>
                    {allergy.reaction && (
                      <Text style={styles.reaction}>Reaction: {allergy.reaction}</Text>
                    )}
                    <Text style={styles.allergyDate}>Started: {formatDate(allergy.startDate)}</Text>
                    {allergy.endDate && (
                      <Text style={styles.allergyDate}>Ended: {formatDate(allergy.endDate)}</Text>
                    )}
                    {allergy.notes && <Text style={styles.notes}>{allergy.notes}</Text>}
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteAllergy(allergy.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="warning-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No Allergies</Text>
              <Text style={styles.emptySubtitle}>Add your allergies to keep track of your sensitivities</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.addFirstButtonText}>Add Allergy</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Allergy Modal */}
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
            <Text style={styles.modalTitle}>Add Allergy</Text>
            <TouchableOpacity onPress={addAllergy}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Allergy Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Allergy Name *</Text>
              <TextInput
                style={styles.textInput}
                value={allergy}
                onChangeText={(text) => {
                  setAllergy(text);
                  setShowSuggestions(text.length > 0);
                }}
                placeholder="e.g., Peanuts, Penicillin"
                placeholderTextColor="#666"
              />
              {showSuggestions && allergy.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {commonAllergies
                    .filter(a => a.toLowerCase().includes(allergy.toLowerCase()))
                    .slice(0, 5)
                    .map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setAllergy(suggestion);
                          setShowSuggestions(false);
                        }}
                      >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
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
                    onPress={() => {
                      setStatus(option.value as any);
                      if (option.value === 'resolved' && !endDate) {
                        setShowEndDatePicker(true);
                      }
                    }}
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

            {/* Reaction */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Reaction (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={reaction}
                onChangeText={setReaction}
                placeholder="e.g., Hives, Swelling, Difficulty Breathing"
                placeholderTextColor="#666"
              />
            </View>

            {/* Start Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Start Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={[styles.dateInputText, !startDate && styles.placeholderText]}>
                  {startDate ? startDate.toLocaleDateString() : 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {/* End Date - Only show when status is resolved */}
            {status === 'resolved' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>End Date *</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={[styles.dateInputText, !endDate && styles.placeholderText]}>
                    {endDate ? endDate.toLocaleDateString() : 'Select date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#888" />
                </TouchableOpacity>
              </View>
            )}

            {/* Notes */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes about this allergy"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Start Date Picker */}
      <IOSDatePicker
        visible={showStartDatePicker}
        title="Start Date"
        value={startDate ?? new Date()}
        maximumDate={new Date()}
        onConfirm={(d) => {
          setStartDate(d);
          setShowStartDatePicker(false);
        }}
        onCancel={() => setShowStartDatePicker(false)}
      />

      {/* End Date Picker */}
      <IOSDatePicker
        visible={showEndDatePicker}
        title="End Date"
        value={endDate ?? new Date()}
        maximumDate={new Date()}
        onConfirm={(d) => {
          setEndDate(d);
          setShowEndDatePicker(false);
        }}
        onCancel={() => setShowEndDatePicker(false)}
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
  allergyCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  allergyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  allergyInfo: {
    flex: 1,
  },
  allergyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  allergyTags: {
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
  reaction: {
    fontSize: 14,
    color: '#FF9500',
    marginBottom: 4,
  },
  allergyDate: {
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 20,
    paddingVertical: 100,
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
});

export default AllergiesScreen; 