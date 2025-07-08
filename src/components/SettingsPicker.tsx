import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PickerOption {
  value: string;
  label: string;
  description?: string;
}

interface SettingsPickerProps {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const SettingsPicker: React.FC<SettingsPickerProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.optionItem}
              onPress={() => handleSelect(option.value)}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  {option.description && (
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  )}
                </View>
                {selectedValue === option.value && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 17,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 60, // Same width as cancel button for centering
  },
  optionsContainer: {
    flex: 1,
    marginTop: 35,
  },
  optionItem: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 17,
    color: '#000000',
  },
  optionDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
});

export default SettingsPicker; 