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
import { Medication } from '../../types';

const MedicationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [medication, setMedication] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const commonMedications = [
    'Aspirin', 'Ibuprofen', 'Acetaminophen', 'Omeprazole', 'Lisinopril',
    'Metformin', 'Atorvastatin', 'Amlodipine', 'Losartan', 'Metoprolol',
    'Hydrochlorothiazide', 'Sertraline', 'Escitalopram', 'Bupropion',
    'Albuterol', 'Fluticasone', 'Montelukast', 'Levothyroxine', 'Warfarin',
    'Insulin', 'Glipizide', 'Gabapentin', 'Pregabalin', 'Tramadol',
    'Codeine', 'Morphine', 'Oxycodone', 'Fentanyl', 'Methadone',
    'Buprenorphine', 'Naloxone', 'Naltrexone', 'Benzodiazepines',
    'Zolpidem', 'Melatonin', 'Vitamin D', 'Vitamin B12', 'Iron',
    'Calcium', 'Magnesium', 'Zinc', 'Folic Acid', 'Omega-3'
  ];

  const addMedication = () => {
    if (!medication.trim()) {
      Alert.alert('Error', 'Please enter a medication name');
      return;
    }

    const newMedication: Medication = {
      id: Date.now().toString(),
      name: medication.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      startDate: startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      duration: duration.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    const updatedMedications = [...(profile?.medications || []), newMedication];
    updateProfile({
      ...profile,
      medications: updatedMedications,
    });

    setShowAddModal(false);
    setMedication('');
    setDosage('');
    setFrequency('');
    setStartDate(null);
    setDuration('');
    setNotes('');
  };

  const deleteMedication = (id: string) => {
    Alert.alert(
      'Delete Medication',
      'Are you sure you want to delete this medication?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedMedications = profile?.medications?.filter(m => m.id !== id) || [];
            updateProfile({
              ...profile,
              medications: updatedMedications,
            });
          },
        },
      ]
    );
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
          <Text style={styles.headerTitle}>Medications</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Medications List */}
        <View style={styles.content}>
          {profile?.medications?.length ? (
            profile.medications.map((medication) => (
              <View key={medication.id} style={styles.medicationCard}>
                <View style={styles.medicationHeader}>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{medication.name}</Text>
                    <Text style={styles.medicationDetails}>
                      {medication.dosage} • {medication.frequency}
                    </Text>
                    <Text style={styles.medicationDate}>Started: {formatDate(medication.startDate)}</Text>
                    {medication.duration && (
                      <Text style={styles.medicationDuration}>Duration: {medication.duration}</Text>
                    )}
                    {medication.notes && <Text style={styles.notes}>{medication.notes}</Text>}
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteMedication(medication.id)}
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
              <Text style={styles.emptyTitle}>No Medications</Text>
              <Text style={styles.emptySubtitle}>Add your medications to keep track of your treatment</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.addFirstButtonText}>Add Medication</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Medication Modal */}
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
            <Text style={styles.modalTitle}>Add Medication</Text>
            <TouchableOpacity onPress={addMedication}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Medication Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Medication Name *</Text>
              <TextInput
                style={styles.textInput}
                value={medication}
                onChangeText={(text) => {
                  setMedication(text);
                  setShowSuggestions(text.length > 0);
                }}
                placeholder="e.g., Aspirin, Metformin"
                placeholderTextColor="#666"
              />
              {showSuggestions && medication.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {commonMedications
                    .filter(m => m.toLowerCase().includes(medication.toLowerCase()))
                    .slice(0, 5)
                    .map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setMedication(suggestion);
                          setShowSuggestions(false);
                        }}
                      >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>

            {/* Dosage */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Dosage</Text>
              <TextInput
                style={styles.textInput}
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g., 500mg, 10mg"
                placeholderTextColor="#666"
              />
            </View>

            {/* Frequency */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Frequency</Text>
              <TextInput
                style={styles.textInput}
                value={frequency}
                onChangeText={setFrequency}
                placeholder="e.g., Twice daily, Once a week"
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

            {/* Duration */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Duration (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={duration}
                onChangeText={setDuration}
                placeholder="e.g., 30 days, 3 months, Ongoing"
                placeholderTextColor="#666"
              />
            </View>

            {/* Notes */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes about this medication"
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
  medicationCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  medicationDetails: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  medicationDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  medicationDuration: {
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
});

export default MedicationsScreen; 