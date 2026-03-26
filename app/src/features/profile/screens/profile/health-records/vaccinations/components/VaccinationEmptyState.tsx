import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VaccinationEmptyStateProps {
  onAdd: () => void;
}

const VaccinationEmptyState: React.FC<VaccinationEmptyStateProps> = ({ onAdd }) => (
  <View style={styles.emptyState}>
    <Ionicons name="shield-checkmark-outline" size={64} color="#666" />
    <Text style={styles.emptyTitle}>No Vaccinations</Text>
    <Text style={styles.emptySubtitle}>
      Add your vaccinations to keep track of your immunization history
    </Text>
    <TouchableOpacity style={styles.addFirstButton} onPress={onAdd}>
      <Text style={styles.addFirstButtonText}>Add Vaccination</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  addFirstButton: {
    backgroundColor: '#3AABF0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VaccinationEmptyState;
