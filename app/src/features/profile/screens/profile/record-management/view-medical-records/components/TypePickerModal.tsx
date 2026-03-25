import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecordType {
  value: string;
  label: string;
  icon: string;
  color: string;
}

interface TypePickerModalProps {
  visible: boolean;
  recordTypes: RecordType[];
  onSelect: (type: string) => void;
  onClose: () => void;
}

const TypePickerModal: React.FC<TypePickerModalProps> = ({
  visible,
  recordTypes,
  onSelect,
  onClose,
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
        <Text style={styles.modalTitle}>Select Record Type</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.modalContent}>
        {recordTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={styles.typeOption}
            onPress={() => onSelect(type.value)}
          >
            <Ionicons name={type.icon as any} size={24} color={type.color as any} />
            <Text style={styles.typeOptionText}>{type.label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
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
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  typeOptionText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    marginLeft: 12,
  },
});

export default TypePickerModal;
