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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IOSDatePicker from '../../../shared/components/IOSDatePicker';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../../shared/context/HealthDataContext';
import { MedicalRecord } from '../../../shared/types';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const UploadMedicalRecordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { profile, updateProfile } = useHealthData();
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [selectedType, setSelectedType] = useState<'lab_result' | 'imaging' | 'prescription' | 'consultation' | 'procedure' | 'other'>('lab_result');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [recordDate, setRecordDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateMode, setDateMode] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name?: string; type?: string } | null>(null);

  const recordTypes = [
    { value: 'lab_result', label: 'Lab Result', icon: 'flask-outline', color: '#34C759' },
    { value: 'imaging', label: 'Imaging', icon: 'scan-outline', color: '#AF52DE' },
    { value: 'prescription', label: 'Prescription', icon: 'medical-outline', color: '#FF3B30' },
    { value: 'consultation', label: 'Consultation', icon: 'people-outline', color: '#0A84FF' },
    { value: 'procedure', label: 'Procedure', icon: 'bandage-outline', color: '#FF9F0A' },
    { value: 'other', label: 'Other', icon: 'document-outline', color: '#8E8E93' },
  ];

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take a photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({ uri: asset.uri, name: asset.fileName || 'photo.jpg', type: 'image/jpeg' });
      }
    } catch (e) {
      console.error('Camera error', e);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf', 'application/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset: any = result.assets[0];
        setSelectedFile({ uri: asset.uri, name: asset.name, type: asset.mimeType });
      }
    } catch (e) {
      console.error('Document picker error', e);
      Alert.alert('Error', 'Could not pick document.');
    }
  };

  const addMedicalRecord = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a record name');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Error', 'Please select a photo or document');
      return;
    }

    const newMedicalRecord: MedicalRecord = {
      id: Date.now().toString(),
      name: name.trim(),
      type: selectedType,
      date: recordDate ?? new Date(),
      fileUrl: selectedFile.uri,
      fileSize: 1024, // Mock file size
      notes: notes.trim() || undefined,
      tags: tags.trim() ? tags.split(',').map(tag => tag.trim()) : undefined,
    };

    const updatedRecords = [...(profile?.medicalRecords || []), newMedicalRecord];
    updateProfile({
      ...profile,
      medicalRecords: updatedRecords,
    });

    Alert.alert('Success', 'Medical record uploaded successfully');
  };

  const getTypeIcon = (type: string) => {
    const typeData = recordTypes.find(t => t.value === type);
    return typeData?.icon || 'document-outline';
  };

  const getTypeLabel = (type: string) => {
    const typeData = recordTypes.find(t => t.value === type);
    return typeData?.label || 'Other';
  };

  const getTypeColor = (type: string) => {
    const typeData = recordTypes.find(t => t.value === type);
    return typeData?.color || '#007AFF';
  };

  const formatDateForMode = (d: Date | null, mode: 'year' | 'yearMonth' | 'full') => {
    if (!d) return '';
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
        <TouchableOpacity
          onPress={() => {
            // Safer back: if there's no history, navigate to previous profile screen
            // @ts-ignore
            if ((navigation as any)?.canGoBack?.()) {
              // @ts-ignore
              navigation.goBack();
            } else {
              // @ts-ignore
              navigation.navigate?.('ProfileDetails');
            }
          }}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Medical Record</Text>
          <TouchableOpacity onPress={addMedicalRecord} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Content */}
        <View style={styles.content}>
          {/* Upload Options */}
          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Upload Method</Text>
            <View style={styles.uploadOptions}>
              <TouchableOpacity style={styles.uploadOption} onPress={takePhoto}>
                <Ionicons name="camera" size={32} color="#007AFF" />
                <Text style={styles.uploadOptionText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadOption} onPress={pickDocument}>
                <Ionicons name="document" size={32} color="#FF9500" />
                <Text style={styles.uploadOptionText}>Pick Document</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected File Preview */}
          {selectedFile && (
            <View style={styles.previewSection}>
              <Text style={styles.sectionTitle}>Preview</Text>
              <View style={styles.imagePreview}>
                {selectedFile.type?.startsWith('image/') ? (
                  <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.docPreview}>
                    <Ionicons name="document-outline" size={28} color="#FFFFFF" />
                    <Text style={styles.docPreviewText} numberOfLines={1}>{selectedFile.name || 'Document'}</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => setSelectedFile(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Record Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Record Details</Text>
            
            {/* Record Type */}
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowTypePicker(true)}
            >
              <Text style={styles.inputLabel}>Record Type:</Text>
              <View style={styles.inputRow}>
                <Ionicons name={getTypeIcon(selectedType) as any} size={20} color={getTypeColor(selectedType)} />
                <Text style={styles.inputText}>{getTypeLabel(selectedType)}</Text>
                <Ionicons name="chevron-down" size={20} color="#888" />
              </View>
            </TouchableOpacity>

            {/* Record Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Record Name: *</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Blood Test Results, X-Ray Report"
                placeholderTextColor="#666"
              />
            </View>

            {/* Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date:</Text>
              <View style={styles.dateModeRow}>
                <TouchableOpacity
                  style={[styles.dateModeChip, dateMode === 'year' && styles.dateModeChipActive]}
                  onPress={() => setDateMode('year')}
                >
                  <Text style={[styles.dateModeText, dateMode === 'year' && styles.dateModeTextActive]}>Year</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateModeChip, dateMode === 'yearMonth' && styles.dateModeChipActive]}
                  onPress={() => setDateMode('yearMonth')}
                >
                  <Text style={[styles.dateModeText, dateMode === 'yearMonth' && styles.dateModeTextActive]}>Year-Month</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateModeChip, dateMode === 'full' && styles.dateModeChipActive]}
                  onPress={() => setDateMode('full')}
                >
                  <Text style={[styles.dateModeText, dateMode === 'full' && styles.dateModeTextActive]}>Full</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.inputRow}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                <Text style={styles.inputText}>
                  {recordDate ? formatDateForMode(recordDate, dateMode) : 'Select date'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {/* Tags */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tags: (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={tags}
                onChangeText={setTags}
                placeholder="e.g., cardiology, urgent, follow-up"
                placeholderTextColor="#666"
              />
            </View>

            {/* Notes */}
            <View style={[styles.inputContainer, { marginBottom: 0 }]}>
              <Text style={styles.inputLabel}>Notes: (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes about this record"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Record Type Picker Modal */}
      <Modal
        visible={showTypePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTypePicker(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Record Type</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {recordTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={styles.typeOption}
                onPress={() => {
                  setSelectedType(type.value as any);
                  setShowTypePicker(false);
                }}
              >
                <Ionicons name={type.icon as any} size={24} color={type.color as any} />
                <Text style={styles.typeOptionText}>{type.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* iOS Date Picker */}
      {showDatePicker && (
        <IOSDatePicker
          visible={true}
          title="Select Date"
          value={recordDate ?? new Date()}
          maximumDate={new Date()}
          onConfirm={(d) => {
            setRecordDate(d);
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
        />
      )}
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
    paddingTop: 70,
    paddingBottom: 5,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    left: 20,
    top: 24.4,
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
  saveButton: {
    padding: 8,
    position: 'absolute',
    right: 20,
    top: 24.4,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  uploadSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  uploadOption: {
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 20,
    minWidth: 100,
  },
  uploadOptionText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  previewSection: {
    marginBottom: 24,
  },
  imagePreview: {
    position: 'relative',
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#181818',
  },
  docPreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#181818',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  docPreviewText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
    maxWidth: 180,
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#000000',
    borderRadius: 12,
  },
  detailsSection: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    marginLeft: 8,
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  typeOptionText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    marginLeft: 12,
  },
  dateModeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dateModeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333',
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

export default UploadMedicalRecordScreen; 