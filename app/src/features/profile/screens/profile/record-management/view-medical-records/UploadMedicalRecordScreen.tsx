import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IOSDatePicker from '../../../../../../shared/components/ui/IOSDatePicker';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { MedicalRecord } from '../../../../../../shared/types';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import TypePickerModal from './components/TypePickerModal';
import UploadOptionsSection from './components/UploadOptionsSection';
import FilePreviewSection from './components/FilePreviewSection';
import RecordDetailsSection from './components/RecordDetailsSection';

const recordTypes = [
  { value: 'lab_result', label: 'Lab Result', icon: 'flask-outline', color: '#34C759' },
  { value: 'imaging', label: 'Imaging', icon: 'scan-outline', color: '#AF52DE' },
  { value: 'prescription', label: 'Prescription', icon: 'medical-outline', color: '#FF3B30' },
  { value: 'consultation', label: 'Consultation', icon: 'people-outline', color: '#0A84FF' },
  { value: 'procedure', label: 'Procedure', icon: 'bandage-outline', color: '#FF9F0A' },
  { value: 'other', label: 'Other', icon: 'document-outline', color: '#8E8E93' },
];

const UploadMedicalRecordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { profile, updateProfile } = useHealthData();
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [selectedType, setSelectedType] = useState<'lab_result' | 'imaging' | 'prescription' | 'consultation' | 'procedure' | 'other'>('lab_result');
  const [name, setName] = useState('');
  const [recordDate, setRecordDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateMode, setDateMode] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name?: string; type?: string } | null>(null);

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
      fileSize: 1024,
      notes: notes.trim() || undefined,
      tags: tags.trim() ? tags.split(',').map(tag => tag.trim()) : undefined,
    };
    const updatedRecords = [...(profile?.medicalRecords || []), newMedicalRecord];
    updateProfile({ ...profile, medicalRecords: updatedRecords });
    Alert.alert('Success', 'Medical record uploaded successfully');
  };

  const getTypeIcon = (type: string) => recordTypes.find(t => t.value === type)?.icon || 'document-outline';
  const getTypeLabel = (type: string) => recordTypes.find(t => t.value === type)?.label || 'Other';
  const getTypeColor = (type: string) => recordTypes.find(t => t.value === type)?.color || '#007AFF';

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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            const nav = navigation as any;
            if (nav?.canGoBack?.()) {
              nav.goBack();
            } else {
              nav.navigate?.('ProfileDetails');
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <UploadOptionsSection onTakePhoto={takePhoto} onPickDocument={pickDocument} />

          {selectedFile && (
            <FilePreviewSection
              selectedFile={selectedFile}
              onRemove={() => setSelectedFile(null)}
            />
          )}

          <RecordDetailsSection
            selectedType={selectedType}
            name={name}
            onNameChange={setName}
            recordDate={recordDate}
            dateMode={dateMode}
            onDateModeChange={setDateMode}
            onShowDatePicker={() => setShowDatePicker(true)}
            onShowTypePicker={() => setShowTypePicker(true)}
            tags={tags}
            onTagsChange={setTags}
            notes={notes}
            onNotesChange={setNotes}
            getTypeIcon={getTypeIcon}
            getTypeLabel={getTypeLabel}
            getTypeColor={getTypeColor}
            formatDateForMode={formatDateForMode}
          />
        </View>
      </ScrollView>

      <TypePickerModal
        visible={showTypePicker}
        recordTypes={recordTypes}
        onSelect={(type) => {
          setSelectedType(type as any);
          setShowTypePicker(false);
        }}
        onClose={() => setShowTypePicker(false)}
      />

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
});

export default UploadMedicalRecordScreen;
