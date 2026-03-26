import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const MedicalDocumentsScreen: React.FC<Props> = ({ onNext, onBack }) => {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  const documentTypes = [
    { id: 'lab_results', name: 'Lab Results', icon: 'flask-outline' },
    { id: 'prescriptions', name: 'Prescriptions', icon: 'medical-outline' },
    { id: 'medical_records', name: 'Medical Records', icon: 'document-text-outline' },
    { id: 'insurance', name: 'Insurance Cards', icon: 'card-outline' },
    { id: 'vaccination', name: 'Vaccination Records', icon: 'shield-outline' },
    { id: 'imaging', name: 'Imaging Reports', icon: 'scan-outline' },
  ];

  const handleDocumentToggle = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleScanDocument = () => {
    Alert.alert('Scan Document', 'Camera functionality would be implemented here');
  };

  const handleUploadDocument = () => {
    Alert.alert('Upload Document', 'File picker functionality would be implemented here');
  };

  const handleNext = () => {
    onNext();
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={24} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={styles.title}>Medical Documents</Text>
        <Text style={styles.subtitle}>
          Upload or scan your medical documents for better health tracking
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.scanButton} onPress={handleScanDocument}>
            <Ionicons name="camera" size={24} color="#3AABF0" />
            <Text style={styles.scanButtonText}>Scan Document</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDocument}>
            <Ionicons name="cloud-upload-outline" size={24} color="#3AABF0" />
            <Text style={styles.uploadButtonText}>Upload File</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.documentTypes}>
          <Text style={styles.sectionTitle}>Document Types</Text>
          <Text style={styles.sectionSubtitle}>
            Select the types of documents you'd like to track
          </Text>
          
          <View style={styles.documentGrid}>
            {documentTypes.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={[
                  styles.documentCard,
                  selectedDocuments.includes(doc.id) && styles.documentCardSelected
                ]}
                onPress={() => handleDocumentToggle(doc.id)}
              >
                <Ionicons 
                  name={doc.icon as any} 
                  size={32} 
                  color={selectedDocuments.includes(doc.id) ? '#3AABF0' : '#666'} 
                />
                <Text style={[
                  styles.documentName,
                  selectedDocuments.includes(doc.id) && styles.documentNameSelected
                ]}>
                  {doc.name}
                </Text>
                {selectedDocuments.includes(doc.id) && (
                  <Ionicons name="checkmark-circle" size={20} color="#3AABF0" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedDocuments.length > 0 && (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedTitle}>Selected Documents:</Text>
            {selectedDocuments.map((docId) => {
              const doc = documentTypes.find(d => d.id === docId);
              return (
                <View key={docId} style={styles.selectedItem}>
                  <Ionicons name={doc?.icon as any} size={16} color="#3AABF0" />
                  <Text style={styles.selectedText}>{doc?.name}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 20,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  scanButton: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: '#3AABF0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginRight: 8,
  },
  scanButtonText: {
    color: '#3AABF0',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginLeft: 8,
  },
  uploadButtonText: {
    color: '#3AABF0',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  documentTypes: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  documentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  documentCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  documentCardSelected: {
    borderColor: '#3AABF0',
    backgroundColor: '#F0F8FF',
  },
  documentName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  documentNameSelected: {
    color: '#3AABF0',
    fontWeight: '600',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  selectedContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3AABF0',
    marginBottom: 8,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedText: {
    fontSize: 14,
    color: '#3AABF0',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#3AABF0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default MedicalDocumentsScreen;
