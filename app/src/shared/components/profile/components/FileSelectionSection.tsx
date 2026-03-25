import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FileSelectionSectionProps {
  onTakePhoto: () => void;
  onPickDocument: () => void;
}

const FileSelectionSection: React.FC<FileSelectionSectionProps> = ({ onTakePhoto, onPickDocument }) => (
  <View style={styles.fileSelectionSection}>
    <Text style={styles.sectionTitle}>Select Document</Text>
    <Text style={styles.sectionSubtitle}>
      Scan or upload your medical documents for AI-powered data extraction
    </Text>

    <View style={styles.selectionButtons}>
      <TouchableOpacity style={styles.selectionButton} onPress={onTakePhoto}>
        <View style={[styles.selectionIcon, { backgroundColor: '#007AFF' }]}>
          <Ionicons name="camera" size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.selectionTitle}>Take Photo</Text>
        <Text style={styles.selectionSubtitle}>Use camera to scan document</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.selectionButton} onPress={onPickDocument}>
        <View style={[styles.selectionIcon, { backgroundColor: '#30D158' }]}>
          <Ionicons name="folder-open" size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.selectionTitle}>Upload File</Text>
        <Text style={styles.selectionSubtitle}>Select from your device</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.scanHints}>
      <Ionicons name="information-circle-outline" size={16} color="#8E8E93" />
      <Text style={styles.scanHintText}>
        Tips: align card edges, avoid glare, use good lighting, lay the card on a flat surface.
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
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
  selectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
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
  scanHints: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
  },
  scanHintText: {
    flex: 1,
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 18,
  },
});

export default FileSelectionSection;
