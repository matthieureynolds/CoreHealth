import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecordType {
  value: string;
  label: string;
}

interface FilterModalProps {
  visible: boolean;
  selectedFilter: string;
  recordTypes: RecordType[];
  onClose: () => void;
  onSelect: (value: string) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  selectedFilter,
  recordTypes,
  onClose,
  onSelect,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    presentationStyle="pageSheet"
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Filter Records</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.modalContent}>
        {recordTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={styles.filterOption}
            onPress={() => onSelect(type.value)}
          >
            <Text style={styles.filterOptionText}>{type.label}</Text>
            {selectedFilter === type.value && (
              <Ionicons name="checkmark" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
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
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default FilterModal;
