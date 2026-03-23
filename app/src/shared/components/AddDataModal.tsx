import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

interface AddDataModalProps {
  visible: boolean;
  onClose: () => void;
  onDataAdded?: (data: any) => void;
}

const { width } = Dimensions.get('window');

const AddDataModal: React.FC<AddDataModalProps> = ({
  visible,
  onClose,
  onDataAdded,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCameraScan = async () => {
    try {
      setIsProcessing(true);
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Process the captured image
        await processDocument(result.assets[0].uri, 'camera');
      }
    } catch (error) {
      console.error('Camera scan error:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDocumentPicker = async () => {
    try {
      setIsProcessing(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        await processDocument(result.assets[0].uri, 'document');
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to select document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Media library permission is required to select images.');
        return;
      }

      setIsProcessing(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processDocument(result.assets[0].uri, 'gallery');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualEntry = () => {
    Alert.alert(
      'Manual Entry',
      'Manual data entry feature will be implemented soon. You can add lab results, biometric data, and other health metrics manually.',
      [{ text: 'OK' }]
    );
  };

  const processDocument = async (uri: string, source: string) => {
    try {
      // Simulate document processing
      setIsProcessing(true);
      
      // Here you would typically send the image/document to your AI processing service
      // For now, we'll simulate the processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate extracted data
      const mockData = {
        id: Date.now().toString(),
        source,
        uri,
        extractedAt: new Date().toISOString(),
        biomarkers: [
          {
            name: 'Total Cholesterol',
            value: 185,
            unit: 'mg/dL',
            status: 'normal',
            confidence: 0.95,
          },
          {
            name: 'HDL Cholesterol',
            value: 52,
            unit: 'mg/dL',
            status: 'normal',
            confidence: 0.92,
          },
          {
            name: 'LDL Cholesterol',
            value: 118,
            unit: 'mg/dL',
            status: 'normal',
            confidence: 0.88,
          },
        ],
        metadata: {
          documentType: 'Lab Results',
          institution: 'CoreHealth Medical Center',
          date: new Date().toISOString(),
        },
      };

      Alert.alert(
        'Document Processed',
        `Successfully extracted ${mockData.biomarkers.length} biomarkers from your ${source} scan.`,
        [
          {
            text: 'View Results',
            onPress: () => {
              onDataAdded?.(mockData);
              onClose();
            },
          },
          {
            text: 'Add More',
            onPress: () => {
              onDataAdded?.(mockData);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Document processing error:', error);
      Alert.alert('Processing Error', 'Failed to process document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const options = [
    {
      id: 'camera',
      title: 'Scan with Camera',
      subtitle: 'Take a photo of lab results or documents',
      icon: 'camera' as const,
      color: '#007AFF',
      onPress: handleCameraScan,
    },
    {
      id: 'gallery',
      title: 'Choose from Gallery',
      subtitle: 'Select existing photos from your device',
      icon: 'images' as const,
      color: '#34C759',
      onPress: handleImagePicker,
    },
    {
      id: 'document',
      title: 'Upload Document',
      subtitle: 'Select PDF or image files',
      icon: 'document-text' as const,
      color: '#FF9500',
      onPress: handleDocumentPicker,
    },
    {
      id: 'manual',
      title: 'Manual Entry',
      subtitle: 'Enter data manually',
      icon: 'create' as const,
      color: '#5856D6',
      onPress: handleManualEntry,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Health Data</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Choose how you'd like to add your health data to CoreHealth
          </Text>

          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={option.onPress}
                disabled={isProcessing}
              >
                <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                  <Ionicons name={option.icon} size={24} color="white" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </View>

          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.processingText}>Processing document...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 30,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  processingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
});

export default AddDataModal;
