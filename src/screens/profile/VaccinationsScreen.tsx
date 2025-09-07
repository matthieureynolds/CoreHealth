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
import { Vaccination, AttachedFile } from '../../types';
import * as DocumentPicker from 'expo-document-picker';
import FileViewerModal from '../../components/common/FileViewerModal';

const VaccinationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [vaccineName, setVaccineName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dateReceived, setDateReceived] = useState<Date | null>(null);
  const [showDateReceivedPicker, setShowDateReceivedPicker] = useState(false);
  const [nextDueDate, setNextDueDate] = useState<Date | null>(null);
  const [showNextDuePicker, setShowNextDuePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [currentFileUri, setCurrentFileUri] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [currentFileType, setCurrentFileType] = useState('');

  const commonVaccines = [
    'COVID-19', 'Influenza (Flu)', 'Tetanus', 'Diphtheria', 'Pertussis (Whooping Cough)',
    'Measles', 'Mumps', 'Rubella', 'Varicella (Chickenpox)', 'Hepatitis A',
    'Hepatitis B', 'HPV (Human Papillomavirus)', 'Meningococcal', 'Pneumococcal',
    'Rotavirus', 'Haemophilus influenzae type b (Hib)', 'Polio', 'Yellow Fever',
    'Typhoid', 'Rabies', 'Japanese Encephalitis', 'Cholera', 'Tuberculosis (BCG)',
    'Shingles (Zoster)', 'Pneumonia', 'Meningitis B', 'Meningitis ACWY'
  ];

  const addVaccination = () => {
    if (!vaccineName.trim()) {
      Alert.alert('Error', 'Please enter a vaccine name');
      return;
    }

    if (editingVaccination) {
      const updated: Vaccination = {
        id: editingVaccination.id,
        name: vaccineName.trim(),
        date: dateReceived || new Date(),
        nextDue: nextDueDate || undefined,
        location: location.trim() || undefined,
        batchNumber: batchNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        attachments: attachments.length ? attachments : undefined,
      };
      const updatedVaccinations = (profile?.vaccinations || []).map(v => v.id === editingVaccination.id ? updated : v);
      updateProfile({
        ...profile,
        vaccinations: updatedVaccinations,
      });
    } else {
      const newVaccination: Vaccination = {
        id: Date.now().toString(),
        name: vaccineName.trim(),
        date: dateReceived || new Date(),
        nextDue: nextDueDate || undefined,
        location: location.trim() || undefined,
        batchNumber: batchNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        attachments: attachments.length ? attachments : undefined,
      };
      const updatedVaccinations = [...(profile?.vaccinations || []), newVaccination];
      updateProfile({
        ...profile,
        vaccinations: updatedVaccinations,
      });
    }

    setShowAddModal(false);
    setVaccineName('');
    setDateReceived(null);
    setNextDueDate(null);
    setLocation('');
    setBatchNumber('');
    setNotes('');
    setEditingVaccination(null);
    setAttachments([]);
  };

  const deleteVaccination = (id: string) => {
    Alert.alert(
      'Delete Vaccination',
      'Are you sure you want to delete this vaccination?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedVaccinations = profile?.vaccinations?.filter(v => v.id !== id) || [];
            updateProfile({
              ...profile,
              vaccinations: updatedVaccinations,
            });
          },
        },
      ]
    );
  };

  const handleEditVaccination = (v: Vaccination) => {
    setVaccineName(v.name);
    setDateReceived(v.date ? new Date(v.date) : new Date());
    setNextDueDate(v.nextDue ? new Date(v.nextDue) : null);
    setLocation(v.location || '');
    setBatchNumber(v.batchNumber || '');
    setNotes(v.notes || '');
    setAttachments(v.attachments || []);
    setEditingVaccination(v);
    setShowAddModal(true);
  };

  const openVaccinationOptions = (v: Vaccination) => {
    Alert.alert(
      v.name,
      undefined,
      [
        { text: 'Edit', onPress: () => handleEditVaccination(v) },
        { text: 'Delete', style: 'destructive', onPress: () => deleteVaccination(v.id) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newFile: AttachedFile = {
          uri: asset.uri,
          name: asset.name || 'attachment',
          type: asset.mimeType,
        };
        setAttachments(prev => [...prev, newFile]);
      }
    } catch (e) {
      console.error('Attachment error', e);
      Alert.alert('Attachment Error', 'Failed to attach file.');
    }
  };

  const removeAttachment = (name: string) => {
    setAttachments(prev => prev.filter(a => a.name !== name));
  };

  const handleViewFile = (fileUri: string, fileName: string, fileType?: string) => {
    setCurrentFileUri(fileUri);
    setCurrentFileName(fileName);
    setCurrentFileType(fileType || '');
    setFileViewerVisible(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const isOverdue = (nextDue: Date) => {
    return new Date() > nextDue;
  };

  return (
    <View style={styles.container}>
      {/* Header (fixed) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vaccinations</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Vaccinations List */}
        <View style={styles.content}>
          {profile?.vaccinations?.length ? (
            profile.vaccinations.map((vaccination) => (
              <View key={vaccination.id} style={styles.vaccinationCard}>
                <View style={styles.vaccinationHeader}>
                  <View style={styles.vaccinationInfo}>
                    <Text style={styles.vaccineName}>{vaccination.name}</Text>
                    <Text style={styles.vaccinationDate}>Received: {formatDate(vaccination.date)}</Text>
                    {vaccination.nextDue && (
                      <View style={styles.nextDueContainer}>
                        <Text style={[
                          styles.nextDueText,
                          isOverdue(vaccination.nextDue) && styles.overdueText
                        ]}>
                          Next due: {formatDate(vaccination.nextDue)}
                        </Text>
                        {isOverdue(vaccination.nextDue) && (
                          <View style={styles.overdueBadge}>
                            <Text style={styles.overdueBadgeText}>OVERDUE</Text>
                          </View>
                        )}
                      </View>
                    )}
                    {vaccination.location && (
                      <Text style={styles.location}>Location: {vaccination.location}</Text>
                    )}
                    {vaccination.batchNumber && (
                      <Text style={styles.batchNumber}>Batch: {vaccination.batchNumber}</Text>
                    )}
                    {vaccination.notes && <Text style={styles.notes}>{vaccination.notes}</Text>}
                    {!!vaccination.attachments?.length && (
                      <View style={{ marginTop: 10 }}>
                        <View style={styles.attachmentsRow}>
                          {vaccination.attachments.map(file => (
                            <TouchableOpacity
                              key={file.uri}
                              style={styles.attachmentChip}
                              onPress={() => handleViewFile(file.uri, file.name, file.type)}
                            >
                              <Ionicons name={file.type?.includes('pdf') ? 'document-outline' : 'image-outline'} size={14} color="#FFFFFF" />
                              <Text style={styles.attachmentText} numberOfLines={1}>{file.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => openVaccinationOptions(vaccination)}
                    style={styles.moreButton}
                    accessibilityLabel="Edit vaccination"
                  >
                    <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="shield-checkmark-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No Vaccinations</Text>
              <Text style={styles.emptySubtitle}>Add your vaccinations to keep track of your immunization history</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.addFirstButtonText}>Add Vaccination</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Vaccination Modal */}
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
            <Text style={styles.modalTitle}>{editingVaccination ? 'Edit Vaccination' : 'Add Vaccination'}</Text>
            <TouchableOpacity onPress={addVaccination}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Vaccine Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Vaccine Name *</Text>
              <TextInput
                style={styles.textInput}
                value={vaccineName}
                onChangeText={(text) => {
                  setVaccineName(text);
                  setShowSuggestions(text.length > 0);
                }}
                placeholder="e.g., COVID-19, Influenza"
                placeholderTextColor="#666"
              />
              {showSuggestions && vaccineName.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {commonVaccines
                    .filter(v => v.toLowerCase().includes(vaccineName.toLowerCase()))
                    .slice(0, 5)
                    .map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setVaccineName(suggestion);
                          setShowSuggestions(false);
                        }}
                      >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>

            {/* Date Received */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date Received *</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDateReceivedPicker(true)}
              >
                <Text style={[styles.dateInputText, !dateReceived && styles.placeholderText]}>
                  {dateReceived ? dateReceived.toLocaleDateString() : 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#888" />
              </TouchableOpacity>
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
                placeholder="e.g., Doctor's office, Pharmacy"
                placeholderTextColor="#666"
              />
            </View>

            {/* Batch Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Batch Number (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={batchNumber}
                onChangeText={setBatchNumber}
                placeholder="e.g., ABC123456"
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
                placeholder="Add any additional notes about this vaccination"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Attachments */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Attachments</Text>
              <View style={styles.attachmentsRow}>
                {attachments.map(file => (
                  <View key={file.uri} style={styles.attachmentChip}>
                    <Ionicons name={file.type?.includes('pdf') ? 'document-outline' : 'image-outline'} size={14} color="#FFFFFF" />
                    <Text style={styles.attachmentText} numberOfLines={1}>{file.name}</Text>
                    <TouchableOpacity onPress={() => removeAttachment(file.name)} style={styles.attachmentRemove}>
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addAttachmentButton} onPress={handleAttachFile}>
                  <Ionicons name="attach" size={16} color="#007AFF" />
                  <Text style={styles.addAttachmentText}>Add file</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.attachmentsHelp}>PDFs and images are supported.</Text>
            </View>
          </ScrollView>

          {/* Date Pickers - Now inside the modal */}
          {showDateReceivedPicker && (
            <IOSDatePicker
              visible={true}
              title="Date Received"
              value={dateReceived ?? new Date()}
              maximumDate={new Date()}
              onConfirm={(d) => {
                setDateReceived(d);
                setShowDateReceivedPicker(false);
              }}
              onCancel={() => setShowDateReceivedPicker(false)}
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
      <FileViewerModal
        visible={fileViewerVisible}
        onClose={() => setFileViewerVisible(false)}
        fileUri={currentFileUri}
        fileName={currentFileName}
        fileType={currentFileType}
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
    paddingTop: 80,
    paddingBottom: 3,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    left: 20,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingBottom: 8,
  },
  addButton: {
    padding: 8,
    position: 'absolute',
    right: 20,
    zIndex: 1,
  },
  content: {
    padding: 20,
  },
  vaccinationCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  vaccinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vaccinationInfo: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  vaccinationDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
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
  batchNumber: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  notes: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  moreButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  attachmentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  attachmentText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 6,
    maxWidth: 140,
  },
  attachmentRemove: {
    marginLeft: 6,
  },
  addAttachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addAttachmentText: {
    color: '#007AFF',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  attachmentsHelp: {
    marginTop: 8,
    color: '#8E8E93',
    fontSize: 12,
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

export default VaccinationsScreen; 