import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FileTabProps {
  onSelectDocument: () => void;
  onSelectFromGallery: () => void;
}

const FileTab: React.FC<FileTabProps> = ({ onSelectDocument, onSelectFromGallery }) => (
  <View style={styles.fileContainer}>
    <TouchableOpacity style={styles.fileOption} onPress={onSelectDocument}>
      <Ionicons name="document" size={24} color="#007AFF" />
      <Text style={styles.fileOptionText}>Select Document</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.fileOption} onPress={onSelectFromGallery}>
      <Ionicons name="image" size={24} color="#007AFF" />
      <Text style={styles.fileOptionText}>Select Image</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  fileContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  fileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 12,
  },
  fileOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
});

export default FileTab;
