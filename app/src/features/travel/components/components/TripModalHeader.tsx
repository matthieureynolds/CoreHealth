import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TripModalHeaderProps {
  onClose: () => void;
  onSave: () => void;
  isLoading: boolean;
}

const TripModalHeader: React.FC<TripModalHeaderProps> = ({ onClose, onSave, isLoading }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
      <Text style={styles.cancelText}>Cancel</Text>
    </TouchableOpacity>
    <Text style={styles.title}>Create Trip Plan</Text>
    <TouchableOpacity
      onPress={onSave}
      style={[styles.saveButton, isLoading && styles.disabledButton]}
      disabled={isLoading}
    >
      <Text style={styles.saveText}>Save</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default TripModalHeader;
