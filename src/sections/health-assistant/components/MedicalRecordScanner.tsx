import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

interface MedicalRecord {
  id: string;
  type: 'lab_result' | 'prescription' | 'medical_report' | 'vaccination_record' | 'other';
  title: string;
  date: string;
  provider: string;
  extractedData: any;
  image?: string;
  file?: any;
}

interface MedicalRecordScannerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: MedicalRecord) => void;
}

const MedicalRecordScanner: React.FC<MedicalRecordScannerProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    provider: '',
    type: 'lab_result' as MedicalRecord['type'],
  });

  const recordTypes = [
    { id: 'lab_result', title: 'Lab Result', icon: 'flask', color: '#FF6B6B' },
    { id: 'prescription', title: 'Prescription', icon: 'medical', color: '#4ECDC4' },
    { id: 'medical_report', title: 'Medical Report', icon: 'document-text', color: '#45B7D1' },
    { id: 'vaccination_record', title: 'Vaccination Record', icon: 'shield-checkmark', color: '#96CEB4' },
    { id: 'other', title: 'Other', icon: 'folder', color: '#FFB347' },
  ];

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

  const processDocument = async (file: any) => {
    setIsProcessing(true);
    
    // Simulate AI processing
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
    setFormData({
      title: '',
      date: '',
      provider: '',
      type: 'lab_result',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
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
          {/* File Selection */}
          {!selectedFile && (
            <View style={styles.fileSelectionSection}>
              <Text style={styles.sectionTitle}>Select Document</Text>
              <Text style={styles.sectionSubtitle}>
                Scan or upload your medical documents for AI-powered data extraction
              </Text>
              
              <View style={styles.selectionButtons}>
                <TouchableOpacity style={styles.selectionButton} onPress={takePhoto}>
                  <View style={[styles.selectionIcon, { backgroundColor: '#007AFF' }]}>
                    <Ionicons name="camera" size={32} color="#FFFFFF" />
                  </View>
                  <Text style={styles.selectionTitle}>Take Photo</Text>
                  <Text style={styles.selectionSubtitle}>Use camera to scan document</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.selectionButton} onPress={pickDocument}>
                  <View style={[styles.selectionIcon, { backgroundColor: '#30D158' }]}>
                    <Ionicons name="folder-open" size={32} color="#FFFFFF" />
                  </View>
                  <Text style={styles.selectionTitle}>Upload File</Text>
                  <Text style={styles.selectionSubtitle}>Select from your device</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Processing State */}
          {isProcessing && (
            <View style={styles.processingSection}>
              <View style={styles.processingIcon}>
                <Ionicons name="scan" size={48} color="#007AFF" />
              </View>
              <Text style={styles.processingTitle}>Processing Document</Text>
              <Text style={styles.processingSubtitle}>
                AI is extracting data from your document...
              </Text>
            </View>
          )}

          {/* Results */}
          {selectedFile && !isProcessing && (
            <>
              {/* File Preview */}
              <View style={styles.filePreviewSection}>
                <Text style={styles.sectionTitle}>Document Preview</Text>
                <View style={styles.filePreview}>
                  {selectedFile.uri && (
                    <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
                  )}
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{selectedFile.name || 'Document'}</Text>
                    <Text style={styles.fileSize}>
                      {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Record Type Selection */}
              <View style={styles.typeSelectionSection}>
                <Text style={styles.sectionTitle}>Record Type</Text>
                <View style={styles.typeGrid}>
                  {recordTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeCard,
                        formData.type === type.id && { borderColor: type.color, borderWidth: 2 }
                      ]}
                      onPress={() => setFormData({ ...formData, type: type.id as MedicalRecord['type'] })}
                    >
                      <View style={[styles.typeIcon, { backgroundColor: type.color }]}>
                        <Ionicons name={type.icon as any} size={20} color="#FFFFFF" />
                      </View>
                      <Text style={styles.typeTitle}>{type.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Form Fields */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Document Details</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Document title"
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Date (YYYY-MM-DD)"
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Healthcare provider"
                  value={formData.provider}
                  onChangeText={(text) => setFormData({ ...formData, provider: text })}
                />
              </View>

              {/* Extracted Data Preview */}
              {extractedData && (
                <View style={styles.extractedDataSection}>
                  <Text style={styles.sectionTitle}>Extracted Data</Text>
                  <View style={styles.extractedDataCard}>
                    {extractedData.values?.map((value: any, index: number) => (
                      <View key={index} style={styles.dataRow}>
                        <Text style={styles.dataLabel}>{value.name}</Text>
                        <View style={styles.dataValue}>
                          <Text style={styles.dataValueText}>{value.value}</Text>
                          <View style={[
                            styles.statusIndicator,
                            { backgroundColor: value.status === 'normal' ? '#30D158' : '#FF9500' }
                          ]} />
                        </View>
                        <Text style={styles.dataNormal}>{value.normal}</Text>
                      </View>
                    ))}
                    {extractedData.notes && (
                      <Text style={styles.dataNotes}>{extractedData.notes}</Text>
                    )}
                  </View>
                </View>
              )}
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
    color: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  fileSelectionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 24,
    lineHeight: 22,
  },
  selectionButtons: {
    gap: 16,
  },
  selectionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  selectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  processingSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  processingIcon: {
    marginBottom: 16,
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  filePreviewSection: {
    marginBottom: 24,
  },
  filePreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  fileInfo: {
    alignItems: 'center',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: '#8E8E93',
  },
  typeSelectionSection: {
    marginBottom: 24,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  extractedDataSection: {
    marginBottom: 24,
  },
  extractedDataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    flex: 1,
  },
  dataValue: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  dataValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginRight: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dataNormal: {
    fontSize: 12,
    color: '#8E8E93',
    width: 80,
    textAlign: 'right',
  },
  dataNotes: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
});

export default MedicalRecordScanner; 