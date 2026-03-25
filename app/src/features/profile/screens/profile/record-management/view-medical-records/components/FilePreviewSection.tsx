import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SelectedFile {
  uri: string;
  name?: string;
  type?: string;
}

interface FilePreviewSectionProps {
  selectedFile: SelectedFile;
  onRemove: () => void;
}

const FilePreviewSection: React.FC<FilePreviewSectionProps> = ({ selectedFile, onRemove }) => (
  <View style={styles.previewSection}>
    <Text style={styles.sectionTitle}>Preview</Text>
    <View style={styles.imagePreview}>
      {selectedFile.type?.startsWith('image/') ? (
        <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
      ) : (
        <View style={styles.docPreview}>
          <Ionicons name="document-outline" size={28} color="#FFFFFF" />
          <Text style={styles.docPreviewText} numberOfLines={1}>
            {selectedFile.name || 'Document'}
          </Text>
        </View>
      )}
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Ionicons name="close-circle" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  previewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
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
});

export default FilePreviewSection;
