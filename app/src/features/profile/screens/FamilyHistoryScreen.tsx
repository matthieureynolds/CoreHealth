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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import IOSDatePicker from '../../../shared/components/IOSDatePicker';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../../shared/context/HealthDataContext';
import familyService from '../../../shared/services/familyService';
import { FamilyCondition, AttachedFile } from '../../../shared/types';
import * as DocumentPicker from 'expo-document-picker';
import FileViewerModal from '../../../shared/components/FileViewerModal';

const FamilyHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [linkCount, setLinkCount] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [relation, setRelation] = useState('');
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [side, setSide] = useState<'maternal' | 'paternal' | ''>('');
  const [condition, setCondition] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [ageOfOnset, setAgeOfOnset] = useState<Date | null>(null);
  const [showAgeOfOnsetPicker, setShowAgeOfOnsetPicker] = useState(false);
  const [dateModeAge, setDateModeAge] = useState<'year' | 'yearMonth' | 'full'>('year');
  const [dateModeResolved, setDateModeResolved] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'resolved'>('active');
  const [resolvedDate, setResolvedDate] = useState<Date | null>(null);
  const [showResolvedDatePicker, setShowResolvedDatePicker] = useState(false);
  const [editingFamily, setEditingFamily] = useState<FamilyCondition | null>(null);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [currentFileUri, setCurrentFileUri] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [currentFileType, setCurrentFileType] = useState('');

  const relationOptions = [
    'Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter',
    'Grandfather', 'Grandmother',
    'Uncle', 'Aunt', 'Cousin'
  ];

  React.useEffect(() => {
    const loadLinks = async () => {
      try {
        const links = await familyService.listLinks();
        const active = links.filter(l => l.status === 'active').length;
        setLinkCount(active);
      } catch (e) {
        // silent
      }
    };
    const unsubscribe = (navigation as any).addListener?.('focus', loadLinks);
    loadLinks();
    return unsubscribe;
  }, [navigation]);

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

    if (editingFamily) {
      const updated: FamilyCondition = {
        id: editingFamily.id,
        relation: relation.trim(),
        condition: condition.trim(),
        ageOfOnset: ageOfOnset ? Math.floor((new Date().getTime() - ageOfOnset.getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : undefined,
        notes: notes.trim() || undefined,
        attachments: attachments.length ? attachments : undefined,
        side: side || undefined,
        status,
        resolvedDate: status === 'resolved' && resolvedDate ? resolvedDate.toISOString().split('T')[0] : undefined,
      };
      const updatedFamilyHistory = (profile?.familyHistory || []).map(f => f.id === editingFamily.id ? updated : f);
      updateProfile({
        ...profile,
        familyHistory: updatedFamilyHistory,
      });
    } else {
      const newFamilyCondition: FamilyCondition = {
        id: Date.now().toString(),
        relation: relation.trim(),
        condition: condition.trim(),
        ageOfOnset: ageOfOnset ? Math.floor((new Date().getTime() - ageOfOnset.getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : undefined,
        notes: notes.trim() || undefined,
        attachments: attachments.length ? attachments : undefined,
        side: side || undefined,
        status,
        resolvedDate: status === 'resolved' && resolvedDate ? resolvedDate.toISOString().split('T')[0] : undefined,
      };
      const updatedFamilyHistory = [...(profile?.familyHistory || []), newFamilyCondition];
      updateProfile({
        ...profile,
        familyHistory: updatedFamilyHistory,
      });
    }

    setShowAddModal(false);
    setRelation('');
    setCondition('');
    setAgeOfOnset(null);
    setNotes('');
    setSide('');
    setEditingFamily(null);
    setAttachments([]);
    setStatus('active');
    setResolvedDate(null);
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

  const handleEditFamily = (f: FamilyCondition) => {
    setRelation(f.relation);
    setCondition(f.condition);
    setAgeOfOnset(f.ageOfOnset ? new Date(new Date().getFullYear() - f.ageOfOnset, 0, 1) : null);
    setNotes(f.notes || '');
    setAttachments(f.attachments || []);
    setSide((f as any).side || '');
    setStatus(((f as any).status as any) || 'active');
    setResolvedDate((f as any).resolvedDate ? new Date((f as any).resolvedDate) : null);
    setEditingFamily(f);
    setShowAddModal(true);
  };

  const openFamilyOptions = (f: FamilyCondition) => {
    Alert.alert(
      `${f.relation} • ${f.condition}`,
      undefined,
      [
        { text: 'Edit', onPress: () => handleEditFamily(f) },
        { text: 'Delete', style: 'destructive', onPress: () => deleteFamilyCondition(f.id) },
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

  const formatAge = (age: number) => {
    return `${age} years old`;
  };

  return (
    <View style={styles.container}>
      {/* Header (fixed) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family History</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Family History List */}
        <View style={styles.content}>
          {/* Family Link (Risk-Only) Entry */}
          <TouchableOpacity
            style={[styles.familyCard, { borderColor: '#0A84FF' }]}
            onPress={() => (navigation as any).navigate('FamilyLink')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="link-outline" size={22} color="#0A84FF" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.relation}>Family Link (Risk-Only)</Text>
                <Text style={styles.condition}>Leverage family history without sharing anyone’s data</Text>
                <Text style={styles.ageOfOnset}>Active links: {linkCount}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </View>
          </TouchableOpacity>

          {profile?.familyHistory?.length ? (
            profile.familyHistory.map((familyCondition) => (
              <View key={familyCondition.id} style={styles.familyCard}>
                <View style={styles.familyHeader}>
                  <View style={styles.familyInfo}>
                    <Text style={styles.relation}>{familyCondition.relation}{(familyCondition as any).side ? ` • ${((familyCondition as any).side as string).charAt(0).toUpperCase()}${((familyCondition as any).side as string).slice(1)}` : ''}</Text>
                    <Text style={styles.condition}>{familyCondition.condition}</Text>
                    {familyCondition.ageOfOnset && (
                      <Text style={styles.ageOfOnset}>Age of onset: {formatAge(familyCondition.ageOfOnset)}</Text>
                    )}
                    {familyCondition.notes && <Text style={styles.notes}>{familyCondition.notes}</Text>}
                    {!!familyCondition.attachments?.length && (
                      <View style={{ marginTop: 10 }}>
                        <View style={styles.attachmentsRow}>
                          {familyCondition.attachments.map(file => (
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
                    onPress={() => openFamilyOptions(familyCondition)}
                    style={styles.editPenButton}
                    accessibilityLabel="Edit family history"
                  >
                    <Feather name="edit-2" size={16} color="#FFFFFF" />
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
            <Text style={styles.modalTitle}>{editingFamily ? 'Edit Family History' : 'Add Family History'}</Text>
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

            {/* Side selection shown once a relation is chosen */}
            {relation ? (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Side</Text>
                <View style={styles.sideRow}>
                  <TouchableOpacity
                    style={[styles.sideChip, side === 'maternal' && styles.selectedOption]}
                    onPress={() => setSide('maternal')}
                  >
                    <Text style={[styles.optionText, side === 'maternal' && styles.selectedOptionText]}>Maternal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sideChip, side === 'paternal' && styles.selectedOption]}
                    onPress={() => setSide('paternal')}
                  >
                    <Text style={[styles.optionText, side === 'paternal' && styles.selectedOptionText]}>Paternal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

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
              <View style={styles.dateModeRow}>
                <TouchableOpacity style={[styles.dateModeChip, dateModeAge === 'year' && styles.dateModeChipActive]} onPress={() => setDateModeAge('year')}>
                  <Text style={[styles.dateModeText, dateModeAge === 'year' && styles.dateModeTextActive]}>Year</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.dateModeChip, dateModeAge === 'yearMonth' && styles.dateModeChipActive]} onPress={() => setDateModeAge('yearMonth')}>
                  <Text style={[styles.dateModeText, dateModeAge === 'yearMonth' && styles.dateModeTextActive]}>Year-Month</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.dateModeChip, dateModeAge === 'full' && styles.dateModeChipActive]} onPress={() => setDateModeAge('full')}>
                  <Text style={[styles.dateModeText, dateModeAge === 'full' && styles.dateModeTextActive]}>Full</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowAgeOfOnsetPicker(true)}
              >
                <Text style={[styles.dateInputText, !ageOfOnset && styles.placeholderText]}>
                  {ageOfOnset ? (dateModeAge === 'year' ? `${ageOfOnset.getFullYear()}` : dateModeAge === 'yearMonth' ? `${ageOfOnset.getFullYear()}-${String(ageOfOnset.getMonth()+1).padStart(2,'0')}` : ageOfOnset.toLocaleDateString()) : 'Select age'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {/* Status */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.optionsContainerInline}>
                <TouchableOpacity style={[styles.optionButtonInline, status === 'active' && styles.selectedOption]} onPress={() => setStatus('active')}>
                  <Text style={[styles.optionText, status === 'active' && styles.selectedOptionText]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionButtonInline, status === 'resolved' && styles.selectedOption]} onPress={() => setStatus('resolved')}>
                  <Text style={[styles.optionText, status === 'resolved' && styles.selectedOptionText]}>Resolved</Text>
                </TouchableOpacity>
              </View>
            </View>

            {status === 'resolved' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Resolved Date</Text>
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
                <TouchableOpacity style={styles.dateInput} onPress={() => setShowResolvedDatePicker(true)}>
                  <Text style={[styles.dateInputText, !resolvedDate && styles.placeholderText]}>
                    {resolvedDate ? (dateModeResolved === 'year' ? `${resolvedDate.getFullYear()}` : dateModeResolved === 'yearMonth' ? `${resolvedDate.getFullYear()}-${String(resolvedDate.getMonth()+1).padStart(2,'0')}` : resolvedDate.toLocaleDateString()) : 'Select date'}
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
                placeholder="Add any additional notes about this family condition"
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
          {/* Relation Picker (inline overlay inside modal) */}
          {showRelationPicker && (
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
          )}

          {/* Age of Onset Picker - Now inside the modal */}
          {showAgeOfOnsetPicker && (
            <IOSDatePicker
              visible={true}
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
          )}
          {showResolvedDatePicker && (
            <IOSDatePicker
              visible={true}
              title="Resolved Date"
              value={resolvedDate ?? new Date()}
              maximumDate={new Date()}
              onConfirm={(d) => {
                setResolvedDate(d);
                setShowResolvedDatePicker(false);
              }}
              onCancel={() => setShowResolvedDatePicker(false)}
            />
          )}
        </View>
      </Modal>

      {/* Relation Picker moved inside modal */}
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
  familyCard: {
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
  familyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    top: 12,
    right: 12,
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
    position: 'relative',
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1000,
    elevation: 20,
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
  optionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    justifyContent: 'center',
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
  optionText: {
    color: '#888',
    fontSize: 14,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectedOptionText: {
    color: '#fff',
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
  optionsContainerInline: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButtonInline: {
    backgroundColor: '#181818',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  sideRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sideChip: {
    backgroundColor: '#181818',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
});

export default FamilyHistoryScreen; 