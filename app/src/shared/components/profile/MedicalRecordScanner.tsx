import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import FileSelectionSection from './components/FileSelectionSection';
import ProcessingSection from './components/ProcessingSection';
import FilePreviewCard from './components/FilePreviewCard';
import RecordTypeSelector from './components/RecordTypeSelector';
import RecordDetailsForm from './components/RecordDetailsForm';
import ExtractedDataPreview from './components/ExtractedDataPreview';

interface MedicalRecord {
  id: string;
  type: 'lab_result' | 'prescription' | 'medical_report' | 'vaccination_record' | 'other';
  title: string;
  date: string;
  provider: string;
  extractedData: { values?: Array<{ name: string; value: string; unit?: string }>; notes?: string } | null;
  image?: string;
  file?: { uri: string; name?: string; size?: number };
}

interface MedicalRecordScannerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: MedicalRecord) => void;
}

const recordTypes = [
  { id: 'lab_result', title: 'Lab Result', icon: 'flask', color: '#FF6B6B' },
  { id: 'prescription', title: 'Prescription', icon: 'medical', color: '#4ECDC4' },
  { id: 'medical_report', title: 'Medical Report', icon: 'document-text', color: '#45B7D1' },
  { id: 'vaccination_record', title: 'Vaccination Record', icon: 'shield-checkmark', color: '#96CEB4' },
  { id: 'other', title: 'Other', icon: 'folder', color: '#FFB347' },
];

const MedicalRecordScanner: React.FC<MedicalRecordScannerProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name?: string; size?: number } | null>(null);
  const [extractedData, setExtractedData] = useState<{ values?: Array<{ name: string; value: string; unit?: string }>; notes?: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    provider: '',
    type: 'lab_result' as MedicalRecord['type'],
  });

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        processDocument(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        processDocument(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const processDocument = async (_file: any) => {
    setIsProcessing(true);
    setTimeout(() => {
      const mockExtractedData = {
        type: 'lab_result',
        title: 'Blood Test Results',
        date: '2024-01-15',
        provider: 'City Medical Center',
        values: [
          { name: 'Glucose', value: '95 mg/dL', normal: '70-100 mg/dL', status: 'normal' },
          { name: 'Cholesterol', value: '180 mg/dL', normal: '<200 mg/dL', status: 'normal' },
          { name: 'Blood Pressure', value: '120/80 mmHg', normal: '<120/80 mmHg', status: 'normal' },
        ],
        notes: 'All values within normal range. Continue current lifestyle.',
      };
      setExtractedData(mockExtractedData);
      setFormData({
        title: mockExtractedData.title,
        date: mockExtractedData.date,
        provider: mockExtractedData.provider,
        type: mockExtractedData.type as MedicalRecord['type'],
      });
      setIsProcessing(false);
    }, 2000);
  };

  const handleSave = () => {
    if (!selectedFile || !formData.title.trim()) {
      Alert.alert('Error', 'Please select a file and enter a title.');
      return;
    }
    const record: MedicalRecord = {
      id: Date.now().toString(),
      type: formData.type,
      title: formData.title,
      date: formData.date,
      provider: formData.provider,
      extractedData,
      file: selectedFile,
      image: selectedFile.uri,
    };
    onSave(record);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setFormData({ title: '', date: '', provider: '', type: 'lab_result' });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#8E8E93" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Medical Record</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!selectedFile && (
            <FileSelectionSection onTakePhoto={takePhoto} onPickDocument={pickDocument} />
          )}

          {isProcessing && <ProcessingSection />}

          {selectedFile && !isProcessing && (
            <>
              <FilePreviewCard file={selectedFile} />
              <RecordTypeSelector
                recordTypes={recordTypes}
                selectedType={formData.type}
                onSelect={(type) => setFormData({ ...formData, type: type as MedicalRecord['type'] })}
              />
              <RecordDetailsForm
                formData={formData}
                onChange={(data) => setFormData({ ...formData, ...data })}
              />
              {extractedData && <ExtractedDataPreview extractedData={extractedData} />}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3AABF0',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

export default MedicalRecordScanner;
