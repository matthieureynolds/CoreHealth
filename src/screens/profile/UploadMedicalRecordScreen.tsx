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
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../context/HealthDataContext';
import { MedicalRecord } from '../../types';

const UploadMedicalRecordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { profile, updateProfile } = useHealthData();
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [selectedType, setSelectedType] = useState<'lab_result' | 'imaging' | 'prescription' | 'consultation' | 'procedure' | 'other'>('lab_result');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const recordTypes = [
    { value: 'lab_result', label: 'Lab Result', icon: 'flask-outline' },
    { value: 'imaging', label: 'Imaging', icon: 'scan-outline' },
    { value: 'prescription', label: 'Prescription', icon: 'medical-outline' },
    { value: 'consultation', label: 'Consultation', icon: 'people-outline' },
    { value: 'procedure', label: 'Procedure', icon: 'bandage-outline' },
    { value: 'other', label: 'Other', icon: 'document-outline' },
  ];

  const takePhoto = () => {
    // Mock implementation - in real app would use expo-camera
    Alert.alert('Camera', 'Camera functionality would be implemented here');
  };

  const pickPhoto = () => {
    // Mock implementation - in real app would use expo-image-picker
    Alert.alert('Photo Picker', 'Photo picker functionality would be implemented here');
  };

  const pickDocument = () => {
    // Mock implementation - in real app would use expo-document-picker
    Alert.alert('Document Picker', 'Document picker functionality would be implemented here');
  };

  const addMedicalRecord = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a record name');
      return;
    }

    if (!selectedImage) {
      Alert.alert('Error', 'Please select a photo or document');
      return;
    }

    const newMedicalRecord: MedicalRecord = {
      id: Date.now().toString(),
      name: name.trim(),
      type: selectedType,
      date: date ? new Date(date) : new Date(),
      fileUrl: selectedImage,
      fileSize: 1024, // Mock file size
      notes: notes.trim() || undefined,
      tags: tags.trim() ? tags.split(',').map(tag => tag.trim()) : undefined,
    };

    const updatedRecords = [...(profile?.medicalRecords || []), newMedicalRecord];
    updateProfile({
      ...profile,
      medicalRecords: updatedRecords,
    });

    Alert.alert('Success', 'Medical record uploaded successfully', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const getTypeIcon = (type: string) => {
    const typeData = recordTypes.find(t => t.value === type);
    return typeData?.icon || 'document-outline';
  };

  const getTypeLabel = (type: string) => {
    const typeData = recordTypes.find(t => t.value === type);
    return typeData?.label || 'Other';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Medical Record</Text>
          <TouchableOpacity onPress={addMedicalRecord} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

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
              <TouchableOpacity style={styles.uploadOption} onPress={pickPhoto}>
                <Ionicons name="images" size={32} color="#4CD964" />
                <Text style={styles.uploadOptionText}>Pick Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadOption} onPress={pickDocument}>
                <Ionicons name="document" size={32} color="#FF9500" />
                <Text style={styles.uploadOptionText}>Pick Document</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected Image Preview */}
          {selectedImage && (
            <View style={styles.previewSection}>
              <Text style={styles.sectionTitle}>Preview</Text>
              <View style={styles.imagePreview}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => setSelectedImage(null)}
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
              <Text style={styles.inputLabel}>Record Type</Text>
              <View style={styles.inputRow}>
                <Ionicons name={getTypeIcon(selectedType) as any} size={20} color="#007AFF" />
                <Text style={styles.inputText}>{getTypeLabel(selectedType)}</Text>
                <Ionicons name="chevron-down" size={20} color="#888" />
              </View>
            </TouchableOpacity>

            {/* Record Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Record Name *</Text>
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
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.textInput}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD (optional)"
                placeholderTextColor="#666"
              />
            </View>

            {/* Tags */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tags (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={tags}
                onChangeText={setTags}
                placeholder="e.g., cardiology, urgent, follow-up"
                placeholderTextColor="#666"
              />
            </View>

            {/* Notes */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
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
                <Ionicons name={type.icon as any} size={24} color="#007AFF" />
                <Text style={styles.typeOptionText}>{type.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#111',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  saveButton: {
    padding: 8,
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
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#111',
    borderRadius: 12,
  },
  detailsSection: {
    marginBottom: 24,
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
    backgroundColor: '#111',
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
});

export default UploadMedicalRecordScreen; 