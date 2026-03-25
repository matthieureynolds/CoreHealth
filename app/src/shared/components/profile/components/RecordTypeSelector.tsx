import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecordType {
  id: string;
  title: string;
  icon: string;
  color: string;
}

interface RecordTypeSelectorProps {
  recordTypes: RecordType[];
  selectedType: string;
  onSelect: (type: string) => void;
}

const RecordTypeSelector: React.FC<RecordTypeSelectorProps> = ({ recordTypes, selectedType, onSelect }) => (
  <View style={styles.typeSelectionSection}>
    <Text style={styles.sectionTitle}>Record Type</Text>
    <View style={styles.typeGrid}>
      {recordTypes.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.typeCard,
            selectedType === type.id && { borderColor: type.color, borderWidth: 2 },
          ]}
          onPress={() => onSelect(type.id)}
        >
          <View style={[styles.typeIcon, { backgroundColor: type.color }]}>
            <Ionicons name={type.icon as any} size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.typeTitle}>{type.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  typeSelectionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
});

export default RecordTypeSelector;
