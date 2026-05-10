import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IOSDatePicker from '../../../../../../shared/components/ui/IOSDatePicker';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import TypePickerModal from './components/TypePickerModal';
import UploadOptionsSection from './components/UploadOptionsSection';
import FilePreviewSection from './components/FilePreviewSection';
import RecordDetailsSection from './components/RecordDetailsSection';
import { DataService } from '../../../../../../shared/services/data/dataService';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';

const recordTypes = [
  { value: 'lab_result', label: 'Lab Result', icon: 'flask-outline', color: '#34C759' },
  { value: 'imaging', label: 'Imaging', icon: 'scan-outline', color: '#AF52DE' },
  { value: 'prescription', label: 'Prescription', icon: 'medical-outline', color: '#FF3B30' },
  { value: 'consultation', label: 'Consultation', icon: 'people-outline', color: '#3AABF0' },
  { value: 'procedure', label: 'Procedure', icon: 'bandage-outline', color: '#FF9F0A' },
  { value: 'other', label: 'Other', icon: 'document-outline', color: '#8E8E93' },
];

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 20; // 1 minute max

const UploadMedicalRecordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { refreshAllHealthData } = useHealthData();
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const addMedicalRecord = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a record name');
      return;
    }
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a photo or document');
      return;
    }

    setIsUploading(true);
    try {
      const fileName = selectedFile.name || name.trim().replace(/\s+/g, '_') + '.pdf';
      const fileType = selectedFile.type || 'application/pdf';
      const reportDateStr = recordDate ? recordDate.toISOString().split('T')[0] : undefined;

      // Step 1: Get presigned S3 URL from backend
      const { labResultId, uploadUrl } = await DataService.requestLabResultUpload({
        fileName,
        fileType,
        labName: name.trim(),
        reportDate: reportDateStr,
      });

      // Step 2: Upload file directly to S3 using presigned URL
      const fileResponse = await fetch(selectedFile.uri);
      const fileBlob = await fileResponse.blob();
      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': fileType },
        body: fileBlob,
      });

      if (!s3Response.ok) {
        throw new Error(`S3 upload failed: ${s3Response.status}`);
      }

      // Step 3: Poll for processing completion
      let attempts = 0;
      const poll = async (): Promise<void> => {
        attempts += 1;
        try {
          const { processing_status } = await DataService.getLabResultStatus(labResultId);
          if (processing_status === 'complete') {
            refreshAllHealthData().catch(e => console.warn('Health data refresh failed:', e));
            Alert.alert(
              'Processed',
              'Your lab result has been analysed and biomarkers have been added to your profile.',
              [{ text: 'OK', onPress: () => (navigation as any).goBack() }]
            );
            return;
          }
          if (processing_status === 'failed') {
            Alert.alert(
              'Processing failed',
              'We could not extract biomarkers from this document. You can add them manually.',
              [{ text: 'OK', onPress: () => (navigation as any).goBack() }]
            );
            return;
          }
        } catch {
          // swallow polling errors — keep trying
        }
        if (attempts < POLL_MAX_ATTEMPTS) {
          setTimeout(poll, POLL_INTERVAL_MS);
        } else {
          // Timed out — navigate away anyway, processing may still complete in background
          Alert.alert(
            'Uploaded',
            'Your lab result is being processed. Biomarkers will appear in your profile shortly.',
            [{ text: 'OK', onPress: () => (navigation as any).goBack() }]
          );
        }
      };

      setIsUploading(false);
      poll();
      return; // don't hit the finally setIsUploading(false) again
    } catch (e: any) {
      console.error('Upload error:', e);
      Alert.alert('Upload failed', e?.message || 'Could not upload the file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getTypeIcon = (type: string) => recordTypes.find(t => t.value === type)?.icon || 'document-outline';
  const getTypeLabel = (type: string) => recordTypes.find(t => t.value === type)?.label || 'Other';
  const getTypeColor = (type: string) => recordTypes.find(t => t.value === type)?.color || '#3AABF0';

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
          <Ionicons name="close" size={22} color="#FF3B30" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Medical Record</Text>
        <TouchableOpacity onPress={addMedicalRecord} style={styles.saveButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} disabled={isUploading}>
          {isUploading
            ? <ActivityIndicator size="small" color="#34C759" />
            : <Ionicons name="checkmark" size={22} color="#34C759" />}
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
  content: {
    padding: 20,
  },
});

export default UploadMedicalRecordScreen;
