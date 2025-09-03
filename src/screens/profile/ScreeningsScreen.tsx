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
import { Screening } from '../../types';

const ScreeningsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [screeningName, setScreeningName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [screeningDate, setScreeningDate] = useState<Date | null>(null);
  const [showScreeningDatePicker, setShowScreeningDatePicker] = useState(false);
  const [result, setResult] = useState<'normal' | 'abnormal' | 'inconclusive'>('normal');
  const [nextDueDate, setNextDueDate] = useState<Date | null>(null);
  const [showNextDuePicker, setShowNextDuePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const commonScreenings = [
    'Blood Pressure', 'Cholesterol', 'Blood Sugar', 'Hemoglobin A1C',
    'Complete Blood Count (CBC)', 'Comprehensive Metabolic Panel (CMP)',
    'Thyroid Function Test', 'PSA Test', 'Mammogram', 'Pap Smear',
    'Colonoscopy', 'Sigmoidoscopy', 'Fecal Occult Blood Test',
    'Bone Density Test (DEXA)', 'Eye Exam', 'Dental Exam',
    'Skin Cancer Screening', 'Lung Cancer Screening', 'Prostate Exam',
    'Breast Exam', 'Pelvic Exam', 'Testicular Exam', 'STI Testing',
    'HIV Test', 'Hepatitis C Test', 'Tuberculosis Test', 'Allergy Testing',
    'Sleep Study', 'Stress Test', 'Echocardiogram', 'ECG/EKG',
    'Chest X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Endoscopy',
    'Colonoscopy', 'Sigmoidoscopy', 'Cystoscopy', 'Cystoscopy'
  ];

  const addScreening = () => {
    if (!screeningName.trim()) {
      Alert.alert('Error', 'Please enter a screening name');
      return;
    }

    const newScreening: Screening = {
      id: Date.now().toString(),
      name: screeningName.trim(),
      date: screeningDate || new Date(),
      result,
      nextDue: nextDueDate || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    const updatedScreenings = [...(profile?.screenings || []), newScreening];
    updateProfile({
      ...profile,
      screenings: updatedScreenings,
    });

    setShowAddModal(false);
    setScreeningName('');
    setScreeningDate(null);
    setResult('normal');
    setNextDueDate(null);
    setLocation('');
    setNotes('');
  };

  const deleteScreening = (id: string) => {
    Alert.alert(
      'Delete Screening',
      'Are you sure you want to delete this screening?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedScreenings = profile?.screenings?.filter(s => s.id !== id) || [];
            updateProfile({
              ...profile,
              screenings: updatedScreenings,
            });
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'normal': return '#4CD964';
      case 'abnormal': return '#FF3B30';
      case 'inconclusive': return '#FF9500';
      default: return '#888';
    }
  };

  const isOverdue = (nextDue: Date) => {
    return new Date() > nextDue;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Screenings</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Screenings List */}
        <View style={styles.content}>
          {profile?.screenings?.length ? (
            profile.screenings.map((screening) => (
              <View key={screening.id} style={styles.screeningCard}>
                <View style={styles.screeningHeader}>
                  <View style={styles.screeningInfo}>
                    <Text style={styles.screeningName}>{screening.name}</Text>
                    <Text style={styles.screeningDate}>Date: {formatDate(screening.date)}</Text>
                    <View style={styles.resultContainer}>
                      <View style={[styles.resultBadge, { backgroundColor: getResultColor(screening.result) + '20' }]}>
                        <Text style={[styles.resultText, { color: getResultColor(screening.result) }]}>
                          {screening.result.charAt(0).toUpperCase() + screening.result.slice(1)}
                        </Text>
                      </View>
                    </View>
                    {screening.nextDue && (
                      <View style={styles.nextDueContainer}>
                        <Text style={[
                          styles.nextDueText,
                          isOverdue(screening.nextDue) && styles.overdueText
                        ]}>
                          Next due: {formatDate(screening.nextDue)}
                        </Text>
                        {isOverdue(screening.nextDue) && (
                          <View style={styles.overdueBadge}>
                            <Text style={styles.overdueBadgeText}>OVERDUE</Text>
                          </View>
                        )}
                      </View>
                    )}
                    {screening.location && (
                      <Text style={styles.location}>Location: {screening.location}</Text>
                    )}
                    {screening.notes && <Text style={styles.notes}>{screening.notes}</Text>}
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteScreening(screening.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No Screenings</Text>
              <Text style={styles.emptySubtitle}>Add your health screenings to keep track of your preventive care</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.addFirstButtonText}>Add Screening</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Screening Modal */}
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
            <Text style={styles.modalTitle}>Add Screening</Text>
            <TouchableOpacity onPress={addScreening}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Screening Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Screening Name *</Text>
              <TextInput
                style={styles.textInput}
                value={screeningName}
                onChangeText={(text) => {
                  setScreeningName(text);
                  setShowSuggestions(text.length > 0);
                }}
                placeholder="e.g., Blood Pressure, Mammogram"
                placeholderTextColor="#666"
              />
              {showSuggestions && screeningName.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {commonScreenings
                    .filter(s => s.toLowerCase().includes(screeningName.toLowerCase()))
                    .slice(0, 5)
                    .map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setScreeningName(suggestion);
                          setShowSuggestions(false);
                        }}
                      >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>

            {/* Screening Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Screening Date *</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowScreeningDatePicker(true)}
              >
                <Text style={[styles.dateInputText, !screeningDate && styles.placeholderText]}>
                  {screeningDate ? screeningDate.toLocaleDateString() : 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {/* Result */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Result</Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    result === 'normal' && styles.selectedOption
                  ]}
                  onPress={() => setResult('normal')}
                >
                  <Text style={[
                    styles.optionText,
                    result === 'normal' && styles.selectedOptionText
                  ]}>
                    Normal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    result === 'abnormal' && styles.selectedOption
                  ]}
                  onPress={() => setResult('abnormal')}
                >
                  <Text style={[
                    styles.optionText,
                    result === 'abnormal' && styles.selectedOptionText
                  ]}>
                    Abnormal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    result === 'inconclusive' && styles.selectedOption
                  ]}
                  onPress={() => setResult('inconclusive')}
                >
                  <Text style={[
                    styles.optionText,
                    result === 'inconclusive' && styles.selectedOptionText
                  ]}>
                    Inconclusive
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Next Due Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Next Due Date (Optional)</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowNextDuePicker(true)}
              >
                <Text style={[styles.dateInputText, !nextDueDate && styles.placeholderText]}>
                  {nextDueDate ? nextDueDate.toLocaleDateString() : 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {/* Location */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g., Doctor's office, Lab"
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
                placeholder="Add any additional notes about this screening"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          {/* Date Pickers - Now inside the modal */}
          {showScreeningDatePicker && (
            <IOSDatePicker
              visible={true}
              title="Screening Date"
              value={screeningDate ?? new Date()}
              maximumDate={new Date()}
              onConfirm={(d) => {
                setScreeningDate(d);
                setShowScreeningDatePicker(false);
              }}
              onCancel={() => setShowScreeningDatePicker(false)}
            />
          )}

          {showNextDuePicker && (
            <IOSDatePicker
              visible={true}
              title="Next Due Date"
              value={nextDueDate ?? new Date()}
              minimumDate={new Date()}
              onConfirm={(d) => {
                setNextDueDate(d);
                setShowNextDuePicker(false);
              }}
              onCancel={() => setShowNextDuePicker(false)}
            />
          )}
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
  screeningCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  screeningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  screeningInfo: {
    flex: 1,
  },
  screeningName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  screeningDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  resultContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '500',
  },
  nextDueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nextDueText: {
    fontSize: 14,
    color: '#888',
    marginRight: 8,
  },
  overdueText: {
    color: '#FF3B30',
  },
  overdueBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  overdueBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  location: {
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

export default ScreeningsScreen; 