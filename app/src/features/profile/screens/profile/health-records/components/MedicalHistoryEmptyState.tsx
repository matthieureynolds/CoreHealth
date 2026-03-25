import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabConfig {
  id: number;
  title: string;
  icon: string;
  color: string;
}

interface MedicalHistoryEmptyStateProps {
  tabConfig: TabConfig;
  onAdd: () => void;
}

const MedicalHistoryEmptyState: React.FC<MedicalHistoryEmptyStateProps> = ({ tabConfig, onAdd }) => (
  <View style={styles.emptyState}>
    <Ionicons
      name={tabConfig.icon as any}
      size={64}
      color={tabConfig.color}
      style={{ opacity: 0.3 }}
    />
    <Text style={styles.emptyStateTitle}>No {tabConfig.title} Added</Text>
    <Text style={styles.emptyStateText}>
      Start by adding your first {tabConfig.title.toLowerCase()} entry
    </Text>
    <TouchableOpacity
      style={[styles.addButton, { backgroundColor: tabConfig.color }]}
      onPress={onAdd}
    >
      <Ionicons name="add" size={20} color="#FFFFFF" />
      <Text style={styles.addButtonText}>Add {tabConfig.title.slice(0, -1)}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default MedicalHistoryEmptyState;
