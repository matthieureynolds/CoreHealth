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
import { Feather } from '@expo/vector-icons';
import IOSDatePicker from '../../components/IOSDatePicker';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../context/HealthDataContext';
import { Allergy, AttachedFile } from '../../types';
import * as DocumentPicker from 'expo-document-picker';
import FileViewerModal from '../../components/common/FileViewerModal';

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
  const [dateModeStart, setDateModeStart] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [dateModeEnd, setDateModeEnd] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [notes, setNotes] = useState('');
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [currentFileUri, setCurrentFileUri] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [currentFileType, setCurrentFileType] = useState('');

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

    if (editingAllergy) {
      const updated: Allergy = {
        id: editingAllergy.id,
        name: allergy.trim(),
        severity,
        status,
        reaction: reaction.trim() || undefined,
        startDate: (startDate || new Date()).toISOString().split('T')[0],
        endDate: status === 'resolved' && endDate ? endDate.toISOString().split('T')[0] : undefined,
        notes: notes.trim() || undefined,
        attachments: attachments.length ? attachments : undefined,
      };
      const updatedAllergies = (profile?.allergies || []).map(a => a.id === editingAllergy.id ? updated : a);
      updateProfile({
        ...profile,
        allergies: updatedAllergies,
      });
    } else {
    const newAllergy: Allergy = {
      id: Date.now().toString(),
      name: allergy.trim(),
      severity,
      status,
      reaction: reaction.trim() || undefined,
      startDate: startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: status === 'resolved' && endDate ? endDate.toISOString().split('T')[0] : undefined,
      notes: notes.trim() || undefined,
        attachments: attachments.length ? attachments : undefined,
    };
    const updatedAllergies = [...(profile?.allergies || []), newAllergy];
    updateProfile({
      ...profile,
      allergies: updatedAllergies,
    });
    }

    setShowAddModal(false);
    setAllergy('');
    setSeverity('mild');
    setStatus('active');
    setReaction('');
    setStartDate(null);
    setEndDate(null);
    setNotes('');
    setEditingAllergy(null);
    setAttachments([]);
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

  const handleEditAllergy = (a: Allergy) => {
    setAllergy(a.name);
    setSeverity(a.severity);
    setStatus(a.status);
    setReaction(a.reaction || '');
    setStartDate(a.startDate ? new Date(a.startDate) : new Date());
    setEndDate(a.endDate ? new Date(a.endDate) : null);
    setNotes(a.notes || '');
    setAttachments(a.attachments || []);
    setEditingAllergy(a);
    setShowAddModal(true);
  };

  const openAllergyOptions = (a: Allergy) => {
    Alert.alert(
      a.name,
      undefined,
      [
        { text: 'Edit', onPress: () => handleEditAllergy(a) },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAllergy(a.id) },
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

  const formatDateForMode = (d: Date | null, mode: 'year' | 'yearMonth' | 'full') => {
    if (!d) return 'Select date';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    if (mode === 'year') return `${year}`;
    if (mode === 'yearMonth') return `${year}-${month}`;
    return `${year}-${month}-${day}`;
  };

  return (
    <View style={styles.container}>
      {/* Header (fixed) */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Allergies</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

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
                    {!!allergy.attachments?.length && (
                      <View style={{ marginTop: 10 }}>
                        <View style={styles.attachmentsRow}>
                          {allergy.attachments.map(file => (
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
                    onPress={() => openAllergyOptions(allergy)}
                    style={styles.editPenButton}
                    accessibilityLabel="Edit allergy"
                  >
                    <Feather name="edit-2" size={16} color="#FFFFFF" />
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
            <Text style={styles.modalTitle}>{editingAllergy ? 'Edit Allergy' : 'Add Allergy'}</Text>
            <TouchableOpacity onPress={addAllergy}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Allergy Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Allergy Name *:</Text>
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
              <Text style={styles.inputLabel}>Severity:</Text>
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
              <Text style={styles.inputLabel}>Status:</Text>
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
              <Text style={styles.inputLabel}>Reaction (Optional):</Text>
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
              <Text style={styles.inputLabel}>Start Date:</Text>
              <View style={styles.dateModeRow}>
                <TouchableOpacity style={[styles.dateModeChip, dateModeStart === 'year' && styles.dateModeChipActive]} onPress={() => setDateModeStart('year')}>
                  <Text style={[styles.dateModeText, dateModeStart === 'year' && styles.dateModeTextActive]}>Year</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.dateModeChip, dateModeStart === 'yearMonth' && styles.dateModeChipActive]} onPress={() => setDateModeStart('yearMonth')}>
                  <Text style={[styles.dateModeText, dateModeStart === 'yearMonth' && styles.dateModeTextActive]}>Year-Month</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.dateModeChip, dateModeStart === 'full' && styles.dateModeChipActive]} onPress={() => setDateModeStart('full')}>
                  <Text style={[styles.dateModeText, dateModeStart === 'full' && styles.dateModeTextActive]}>Full</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={[styles.dateInputText, !startDate && styles.placeholderText]}>{formatDateForMode(startDate, dateModeStart)}</Text>
                <Ionicons name="calendar-outline" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {/* End Date - Only show when status is resolved */}
            {status === 'resolved' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>End Date *:</Text>
                <View style={styles.dateModeRow}>
                  <TouchableOpacity style={[styles.dateModeChip, dateModeEnd === 'year' && styles.dateModeChipActive]} onPress={() => setDateModeEnd('year')}>
                    <Text style={[styles.dateModeText, dateModeEnd === 'year' && styles.dateModeTextActive]}>Year</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.dateModeChip, dateModeEnd === 'yearMonth' && styles.dateModeChipActive]} onPress={() => setDateModeEnd('yearMonth')}>
                    <Text style={[styles.dateModeText, dateModeEnd === 'yearMonth' && styles.dateModeTextActive]}>Year-Month</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.dateModeChip, dateModeEnd === 'full' && styles.dateModeChipActive]} onPress={() => setDateModeEnd('full')}>
                    <Text style={[styles.dateModeText, dateModeEnd === 'full' && styles.dateModeTextActive]}>Full</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={[styles.dateInputText, !endDate && styles.placeholderText]}>{formatDateForMode(endDate, dateModeEnd)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#888" />
                </TouchableOpacity>
              </View>
            )}

            {/* Notes */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional):</Text>
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

            {/* Attachments */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Attachments:</Text>
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
          {showStartDatePicker && (
            <IOSDatePicker
              visible={true}
              title="Start Date"
              value={startDate ?? new Date()}
              maximumDate={new Date()}
              onConfirm={(d) => {
                setStartDate(d);
                setShowStartDatePicker(false);
              }}
              onCancel={() => setShowStartDatePicker(false)}
            />
          )}

          {showEndDatePicker && (
            <IOSDatePicker
              visible={true}
              title="End Date"
              value={endDate ?? new Date()}
              maximumDate={new Date()}
              onConfirm={(d) => {
                setEndDate(d);
                setShowEndDatePicker(false);
              }}
              onCancel={() => setShowEndDatePicker(false)}
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
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 5,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    left: 20,
    top: 24.7,
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
    paddingTop: 16.5,
    paddingBottom: 8,
  },
  addButton: {
    padding: 8,
    position: 'absolute',
    right: 20,
    top: 24.7,
    zIndex: 1,
  },
  content: {
    padding: 20,
  },
  allergyCard: {
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
  allergyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  moreButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  editPenButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 6,
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
    backgroundColor: '#000000',
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
    justifyContent: 'flex-start',
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
  dateModeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  dateModeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
    marginBottom: 6,
  },
  dateModeChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dateModeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  dateModeTextActive: {
    color: '#fff',
  },
});

export default AllergiesScreen; 