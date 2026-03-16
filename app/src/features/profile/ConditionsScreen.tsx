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
import FileViewerModal from '../../components/common/FileViewerModal';
import IOSDatePicker from '../../components/IOSDatePicker';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../context/HealthDataContext';
import { MedicalCondition, AttachedFile } from '../../types';
import * as DocumentPicker from 'expo-document-picker';

const ConditionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [condition, setCondition] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [diagnosedDate, setDiagnosedDate] = useState<Date | null>(null);
  const [showDiagnosedDatePicker, setShowDiagnosedDatePicker] = useState(false);
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [status, setStatus] = useState<'active' | 'resolved' | 'managed'>('active');
  const [resolvedDate, setResolvedDate] = useState<Date | null>(null);
  const [showResolvedDatePicker, setShowResolvedDatePicker] = useState(false);
  const [dateModeDiagnosed, setDateModeDiagnosed] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [dateModeResolved, setDateModeResolved] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [notes, setNotes] = useState('');
  const [editingCondition, setEditingCondition] = useState<MedicalCondition | null>(null);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [currentFileUri, setCurrentFileUri] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [currentFileType, setCurrentFileType] = useState('');

  // Debug logging for date picker state changes
  React.useEffect(() => {
    console.log('Diagnosed date picker state changed:', showDiagnosedDatePicker);
  }, [showDiagnosedDatePicker]);

  React.useEffect(() => {
    console.log('Resolved date picker state changed:', showResolvedDatePicker);
  }, [showResolvedDatePicker]);

  const commonConditions = [
    'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'Asthma', 'Depression',
    'Anxiety', 'Arthritis', 'Heart Disease', 'Cancer', 'Thyroid Disorder',
    'Epilepsy', 'Multiple Sclerosis', 'Parkinson\'s Disease', 'Alzheimer\'s',
    'Osteoporosis', 'Fibromyalgia', 'Lupus', 'Rheumatoid Arthritis', 'Crohn\'s Disease',
    'Ulcerative Colitis', 'Migraine', 'Sleep Apnea', 'COPD', 'Kidney Disease',
    'Liver Disease', 'Celiac Disease', 'Psoriasis', 'Eczema', 'ADHD', 'Autism'
  ];

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

    if (editingCondition) {
      const updated: MedicalCondition = {
        id: editingCondition.id,
        condition: condition.trim(),
        diagnosedDate: (diagnosedDate || new Date()).toISOString().split('T')[0],
        severity,
        status,
        resolvedDate: status === 'resolved' && resolvedDate ? resolvedDate.toISOString().split('T')[0] : undefined,
        notes: notes.trim() || undefined,
        attachments: attachments.length ? attachments : undefined,
      };
      const updatedConditions = (profile?.medicalHistory || []).map(c => c.id === editingCondition.id ? updated : c);
      updateProfile({
        ...profile,
        medicalHistory: updatedConditions,
      });
    } else {
      const newCondition: MedicalCondition = {
        id: Date.now().toString(),
        condition: condition.trim(),
        diagnosedDate: diagnosedDate ? diagnosedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        severity,
        status,
        resolvedDate: status === 'resolved' && resolvedDate ? resolvedDate.toISOString().split('T')[0] : undefined,
        notes: notes.trim() || undefined,
        attachments: attachments.length ? attachments : undefined,
      };
      const updatedConditions = [...(profile?.medicalHistory || []), newCondition];
      updateProfile({
        ...profile,
        medicalHistory: updatedConditions,
      });
    }

    setShowAddModal(false);
    setCondition('');
    setShowSuggestions(false);
    setDiagnosedDate(null);
    setSeverity('mild');
    setStatus('active');
    setResolvedDate(null);
    setNotes('');
    setEditingCondition(null);
    setAttachments([]);
  };
  const handleEditCondition = (c: MedicalCondition) => {
    setCondition(c.condition);
    setDiagnosedDate(c.diagnosedDate ? new Date(c.diagnosedDate) : new Date());
    setSeverity(c.severity);
    setStatus(c.status);
    setResolvedDate(c.resolvedDate ? new Date(c.resolvedDate) : null);
    setNotes(c.notes || '');
    setEditingCondition(c);
    setAttachments(c.attachments || []);
    setShowAddModal(true);
  };

  const openConditionOptions = (c: MedicalCondition) => {
    Alert.alert(
      c.condition,
      undefined,
      [
        { text: 'Edit', onPress: () => handleEditCondition(c) },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCondition(c.id) },
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
      {/* Header fixed above scroll content */}
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Medical Conditions</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Spacer to push content below fixed header */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        {/* Conditions List */}
        <View style={styles.content}>
          {profile?.medicalHistory?.length ? (
            profile.medicalHistory.map((condition) => (
              <View key={condition.id} style={styles.conditionCard}>
                <View style={styles.conditionHeader}>
                  <View style={styles.conditionHeaderLeft}>
                    <View style={styles.conditionIcon}>
                      <Ionicons name="medkit-outline" size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.conditionInfo}>
                      <Text style={styles.conditionName}>{condition.condition}</Text>
                      <View style={styles.conditionTagsRow}>
                        <View style={[styles.pillTag, { backgroundColor: getSeverityColor(condition.severity) + '20', borderColor: getSeverityColor(condition.severity) }]}>
                          <Text style={[styles.pillTagText, { color: getSeverityColor(condition.severity) }]}>
                            {condition.severity.charAt(0).toUpperCase() + condition.severity.slice(1)}
                          </Text>
                        </View>
                        <View style={[styles.pillTag, { backgroundColor: getStatusColor(condition.status) + '20', borderColor: getStatusColor(condition.status) }]}>
                          <Text style={[styles.pillTagText, { color: getStatusColor(condition.status) }]}>
                            {condition.status.charAt(0).toUpperCase() + condition.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => openConditionOptions(condition)}
                    style={styles.editPenButton}
                    accessibilityLabel="Edit condition"
                  >
                    <Feather name="edit-2" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.conditionMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
                    <Text style={styles.metaText}>Diagnosed: {formatDate(condition.diagnosedDate)}</Text>
                  </View>
                  {condition.resolvedDate && (
                    <View style={styles.metaItem}>
                      <Ionicons name="checkmark-done-outline" size={16} color="#8E8E93" />
                      <Text style={styles.metaText}>Resolved: {formatDate(condition.resolvedDate)}</Text>
                    </View>
                  )}
                </View>

                {condition.notes && <Text style={styles.notes}>{condition.notes}</Text>}

                {!!condition.attachments?.length && (
                  <View style={[styles.conditionMeta, { marginTop: 10 }]}> 
                    <View style={styles.attachmentsRow}>
                      {condition.attachments.map((file) => (
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
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingCondition ? 'Edit Condition' : 'Add Condition'}</Text>
            <TouchableOpacity onPress={addCondition}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Condition Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Condition Name *:</Text>
              <TextInput
                style={styles.textInput}
                value={condition}
                onChangeText={(text) => {
                  setCondition(text);
                  setShowSuggestions(text.length > 0);
                }}
                placeholder="e.g., Diabetes, Hypertension"
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
                      if (option.value === 'resolved' && !resolvedDate) {
                        setShowResolvedDatePicker(true);
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

            {/* Diagnosed Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Diagnosed Date:</Text>
              <View style={styles.dateModeRow}>
                <TouchableOpacity style={[styles.dateModeChip, dateModeDiagnosed === 'year' && styles.dateModeChipActive]} onPress={() => setDateModeDiagnosed('year')}>
                  <Text style={[styles.dateModeText, dateModeDiagnosed === 'year' && styles.dateModeTextActive]}>Year</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.dateModeChip, dateModeDiagnosed === 'yearMonth' && styles.dateModeChipActive]} onPress={() => setDateModeDiagnosed('yearMonth')}>
                  <Text style={[styles.dateModeText, dateModeDiagnosed === 'yearMonth' && styles.dateModeTextActive]}>Year-Month</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.dateModeChip, dateModeDiagnosed === 'full' && styles.dateModeChipActive]} onPress={() => setDateModeDiagnosed('full')}>
                  <Text style={[styles.dateModeText, dateModeDiagnosed === 'full' && styles.dateModeTextActive]}>Full</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.dateInput, { borderColor: showDiagnosedDatePicker ? '#007AFF' : '#333' }]}
                onPress={() => {
                  console.log('Diagnosed date pressed, current state:', showDiagnosedDatePicker);
                  setShowDiagnosedDatePicker(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateInputText, !diagnosedDate && styles.placeholderText]}>
                  {formatDateForMode(diagnosedDate, dateModeDiagnosed)}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={showDiagnosedDatePicker ? '#007AFF' : '#888'} />
              </TouchableOpacity>
            </View>

            {/* Resolved Date */}
            {status === 'resolved' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Resolved Date:</Text>
                <View style={styles.dateModeRow}>
                  <TouchableOpacity style={[styles.dateModeChip, dateModeResolved === 'year' && styles.dateModeChipActive]} onPress={() => setDateModeResolved('year')}>
                    <Text style={[styles.dateModeText, dateModeResolved === 'year' && styles.dateModeTextActive]}>Year</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.dateModeChip, dateModeResolved === 'yearMonth' && styles.dateModeChipActive]} onPress={() => setDateModeResolved('yearMonth')}>
                    <Text style={[styles.dateModeText, dateModeResolved === 'yearMonth' && styles.dateModeTextActive]}>Year-Month</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.dateModeChip, dateModeResolved === 'full' && styles.dateModeChipActive]} onPress={() => setDateModeResolved('full')}>
                    <Text style={[styles.dateModeText, dateModeResolved === 'full' && styles.dateModeTextActive]}>Full</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.dateInput, { borderColor: showResolvedDatePicker ? '#007AFF' : '#333' }]}
                  onPress={() => {
                    console.log('Resolved date pressed, current state:', showResolvedDatePicker);
                    setShowResolvedDatePicker(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dateInputText, !resolvedDate && styles.placeholderText]}>
                    {formatDateForMode(resolvedDate, dateModeResolved)}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={showResolvedDatePicker ? '#007AFF' : '#888'} />
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
                placeholder="Add any additional notes about this condition"
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
          {showDiagnosedDatePicker && (
            <IOSDatePicker
              visible={true}
              title="Diagnosed Date"
              value={diagnosedDate ?? new Date()}
              maximumDate={new Date()}
              onConfirm={(d) => {
                console.log('Diagnosed date confirmed:', d);
                setDiagnosedDate(d);
                setShowDiagnosedDatePicker(false);
              }}
              onCancel={() => {
                console.log('Diagnosed date cancelled');
                setShowDiagnosedDatePicker(false);
              }}
            />
          )}

          {showResolvedDatePicker && (
            <IOSDatePicker
              visible={true}
              title="Resolved Date"
              value={resolvedDate ?? new Date()}
              maximumDate={new Date()}
              onConfirm={(d) => {
                console.log('Resolved date confirmed:', d);
                setResolvedDate(d);
                setShowResolvedDatePicker(false);
              }}
              onCancel={() => {
                console.log('Resolved date cancelled');
                setShowResolvedDatePicker(false);
              }}
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
    zIndex: 1000,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    elevation: 10,
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
  conditionCard: {
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
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conditionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  conditionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0A84FF33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionInfo: {
    flex: 1,
  },
  conditionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  conditionTagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillTagText: {
    fontSize: 12,
    fontWeight: '600',
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
  conditionMeta: {
    marginTop: 12,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#A0A0A0',
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
  notes: {
    fontSize: 13,
    color: '#C7C7CC',
    marginTop: 10,
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
  dateInput: {
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 48,
  },
  dateInputText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  placeholderText: {
    color: '#666',
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

export default ConditionsScreen;