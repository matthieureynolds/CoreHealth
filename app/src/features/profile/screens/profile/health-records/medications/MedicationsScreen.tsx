import React, { useState, useCallback } from 'react';
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
import IOSDatePicker from '../../../../../../shared/components/IOSDatePicker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { Medication, AttachedFile } from '../../../../../../shared/types';
import * as DocumentPicker from 'expo-document-picker';
import FileViewerModal from '../../../../../../shared/components/FileViewerModal';
import { getAdherence, getLastNDays, type AdherenceData } from '../../../../../../shared/utils/medicationAdherence';

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
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [currentFileUri, setCurrentFileUri] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [currentFileType, setCurrentFileType] = useState('');
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [dateModeStart, setDateModeStart] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [dateModeEnd, setDateModeEnd] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [adherenceData, setAdherenceData] = useState<AdherenceData>({});
  const [expandedAdherenceMed, setExpandedAdherenceMed] = useState<string | null>(null);

  const loadAdherence = useCallback(async () => {
    const data = await getAdherence();
    setAdherenceData(data);
  }, []);

  useFocusEffect(useCallback(() => { loadAdherence(); }, [loadAdherence]));

  const TIMELINE_MEDICATION_NAMES = ['Vitamin D Supplement'];
  const adherenceMedicationNames = [...TIMELINE_MEDICATION_NAMES, ...Object.keys(adherenceData)].filter((name, i, arr) => arr.indexOf(name) === i);

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

    if (editingMedication) {
      const updated: Medication = {
        id: editingMedication.id,
        name: medication.trim(),
        dosage: dosage.trim() || undefined,
        frequency: frequency.trim() || undefined,
        startDate: (startDate || new Date()).toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
        duration: duration.trim() || undefined,
        notes: notes.trim() || undefined,
        attachments: attachments.length ? attachments : undefined,
      };
      const updatedMedications = (profile?.medications || []).map(m => m.id === editingMedication.id ? updated : m);
      updateProfile({
        ...profile,
        medications: updatedMedications,
      });
    } else {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: medication.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      startDate: startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
      duration: duration.trim() || undefined,
      notes: notes.trim() || undefined,
        attachments: attachments.length ? attachments : undefined,
    };
    const updatedMedications = [...(profile?.medications || []), newMedication];
    updateProfile({
      ...profile,
      medications: updatedMedications,
    });
    }

    setShowAddModal(false);
    setMedication('');
    setDosage('');
    setFrequency('');
    setStartDate(null);
    setDuration('');
    setEndDate(null);
    setNotes('');
    setEditingMedication(null);
    setAttachments([]);
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

  const handleEditMedication = (m: Medication) => {
    setMedication(m.name);
    setDosage(m.dosage || '');
    setFrequency(m.frequency || '');
    setStartDate(m.startDate ? new Date(m.startDate) : new Date());
    setEndDate(m.endDate ? new Date(m.endDate) : null);
    setDuration(m.duration || '');
    setNotes(m.notes || '');
    setAttachments(m.attachments || []);
    setEditingMedication(m);
    setShowAddModal(true);
  };

  const openMedicationOptions = (m: Medication) => {
    Alert.alert(
      m.name,
      undefined,
      [
        { text: 'Edit', onPress: () => handleEditMedication(m) },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMedication(m.id) },
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  const formatDateForMode = (d: Date | null, mode: 'year' | 'yearMonth' | 'full') => {
    if (!d) return 'Select date';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    if (mode === 'year') return `${y}`;
    if (mode === 'yearMonth') return `${y}-${m}`;
    return `${y}-${day ? m + '-' + day : m}`;
  };

  return (
    <View style={styles.container}>
      {/* Header fixed above scroll content */}
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Medications</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        {/* Adherence – tap a medication to see which days you took vs skipped (no description) */}
        <View style={styles.adherenceSection}>
          <Text style={styles.adherenceSectionTitle}>Adherence</Text>
          {adherenceMedicationNames.map((medName) => {
            const byDate = adherenceData[medName] ?? {};
            const last14 = getLastNDays(14);
            const isExpanded = expandedAdherenceMed === medName;
            return (
              <View key={medName} style={styles.adherenceCard}>
                <TouchableOpacity
                  style={styles.adherenceCardHeader}
                  onPress={() => setExpandedAdherenceMed(isExpanded ? null : medName)}
                  activeOpacity={0.7}
                >
                  <View style={styles.adherenceCardHeaderLeft}>
                    <Text style={styles.adherenceMedName}>{medName}</Text>
                    <Text style={styles.adherenceCardSubtitle}>Tap to see days</Text>
                  </View>
                  <Ionicons name={isExpanded ? 'chevron-down' : 'chevron-forward'} size={20} color="#8E8E93" />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.adherenceExpandedContent}>
                    <View style={styles.adherenceDaysRow}>
                      {last14.map((dateKey) => {
                        const action = byDate[dateKey];
                        const isTook = action === 'took';
                        const isSkipped = action === 'skipped';
                        const label = dateKey.slice(-2);
                        return (
                          <View key={dateKey} style={styles.adherenceDayWrap}>
                            <View style={[styles.adherenceDay, isTook && styles.adherenceDayTook, isSkipped && styles.adherenceDaySkipped]}>
                              {isTook && <Ionicons name="checkmark" size={14} color="#fff" />}
                              {isSkipped && <Ionicons name="close" size={14} color="#fff" />}
                            </View>
                            <Text style={styles.adherenceDayLabel}>{label}</Text>
                          </View>
                        );
                      })}
                    </View>
                    <Text style={styles.adherenceLegend}>Last 14 days • green = took, orange = skipped</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.content}>
          {profile?.medications?.length ? (
            <>
              {(profile?.medications ?? []).map((medication) => (
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
                    {!!medication.attachments?.length && (
                      <View style={{ marginTop: 10 }}>
                        <View style={styles.attachmentsRow}>
                          {medication.attachments.map(file => (
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
                    onPress={() => openMedicationOptions(medication)}
                    style={styles.editPenButton}
                    accessibilityLabel="Edit medication"
                  >
                    <Feather name="edit-2" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            </>
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
            <Text style={styles.modalTitle}>{editingMedication ? 'Edit Medication' : 'Add Medication'}</Text>
            <TouchableOpacity onPress={addMedication}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Medication Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Medication Name *:</Text>
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
              <Text style={styles.inputLabel}>Dosage:</Text>
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
              <Text style={styles.inputLabel}>Frequency:</Text>
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

            {/* End Date (Optional) */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>End Date (Optional):</Text>
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

            {/* Duration */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Duration (Optional):</Text>
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
              <Text style={styles.inputLabel}>Notes (Optional):</Text>
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

          {/* Start Date Picker - Now inside the modal */}
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
  adherenceSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  adherenceSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  adherenceCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  adherenceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adherenceCardHeaderLeft: { flex: 1 },
  adherenceMedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  adherenceCardSubtitle: { fontSize: 12, color: '#8E8E93' },
  adherenceExpandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  adherenceDaysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  adherenceDayWrap: { alignItems: 'center', width: 28 },
  adherenceDay: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3A3A3C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  adherenceDayTook: { backgroundColor: '#34C759' },
  adherenceDaySkipped: { backgroundColor: '#FF9500' },
  adherenceDayLabel: { fontSize: 10, color: '#8E8E93' },
  adherenceLegend: { fontSize: 11, color: '#8E8E93' },
  medicationCard: {
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
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

export default MedicationsScreen; 