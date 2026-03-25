import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UploadOptionsSectionProps {
  onTakePhoto: () => void;
  onPickDocument: () => void;
}

const UploadOptionsSection: React.FC<UploadOptionsSectionProps> = ({ onTakePhoto, onPickDocument }) => (
  <View style={styles.uploadSection}>
    <Text style={styles.sectionTitle}>Upload Method</Text>
    <View style={styles.uploadOptions}>
      <TouchableOpacity style={styles.uploadOption} onPress={onTakePhoto}>
        <Ionicons name="camera" size={32} color="#007AFF" />
        <Text style={styles.uploadOptionText}>Take Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.uploadOption} onPress={onPickDocument}>
        <Ionicons name="document" size={32} color="#FF9500" />
        <Text style={styles.uploadOptionText}>Pick Document</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
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
});

export default UploadOptionsSection;
