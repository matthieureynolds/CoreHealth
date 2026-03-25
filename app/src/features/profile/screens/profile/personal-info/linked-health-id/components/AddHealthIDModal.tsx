import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Image,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MedicalRecordScanner from '../../../../../../../shared/components/profile/MedicalRecordScanner';
import { COUNTRIES, FLAG_IMAGES } from '../countries';

interface AddHealthIDModalProps {
  visible: boolean;
  isEditing: boolean;
  selectedCountry: string;
  selectedCountryCode: string;
  idNumber: string;
  notes: string;
  isPrimaryDraft: boolean;
  idScannerVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  onCountryChange: (name: string, code: string) => void;
  onIdNumberChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onPrimaryChange: (value: boolean) => void;
  onScanPress: () => void;
  onScannerClose: () => void;
  onScannerSave: (record: any) => void;
}

const AddHealthIDModal: React.FC<AddHealthIDModalProps> = ({
  visible,
  isEditing,
  selectedCountry,
  selectedCountryCode,
  idNumber,
  notes,
  isPrimaryDraft,
  idScannerVisible,
  onClose,
  onSave,
  onCountryChange,
  onIdNumberChange,
  onNotesChange,
  onPrimaryChange,
  onScanPress,
  onScannerClose,
  onScannerSave,
}) => {
  const handleCountrySelect = () => {
    const countryOptions = COUNTRIES.map(c => c.name);
    Alert.alert(
      'Select Country',
      'Choose your country:',
      [
        ...countryOptions.map((name) => ({
          text: name,
          onPress: () => {
            const found = COUNTRIES.find(c => c.name === name);
            if (found) {
              onCountryChange(found.name, found.code);
            }
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const flagKey = selectedCountryCode.toLowerCase();

  return (
    <>
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
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Health ID' : 'Add Health ID'}</Text>
            <TouchableOpacity onPress={onSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Primary toggle */}
            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <Text style={styles.inputText}>Set as main ID</Text>
                <Switch
                  value={isPrimaryDraft}
                  onValueChange={onPrimaryChange}
                  trackColor={{ false: '#444', true: '#34C759' }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* Scan ID */}
            <View style={styles.scanRow}>
              <TouchableOpacity style={styles.scanButton} onPress={onScanPress}>
                <Ionicons name="scan" size={18} color="#FFFFFF" />
                <Text style={styles.scanButtonText}>Scan Health ID</Text>
              </TouchableOpacity>
            </View>

            {/* Country Selection */}
            <TouchableOpacity style={styles.inputContainer} onPress={handleCountrySelect}>
              <Text style={styles.inputLabel}>Country:</Text>
              <View style={styles.inputRow}>
                <View style={styles.countrySelector}>
                  {selectedCountry && selectedCountryCode ? (
                    FLAG_IMAGES[flagKey] ? (
                      <Image
                        source={FLAG_IMAGES[flagKey]}
                        style={styles.selectedCountryFlagImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <LinearGradient
                        colors={(COUNTRIES.find(c => c.code === selectedCountryCode)?.gradient ?? ['#444', '#666']) as [string, string]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.selectedCountryBadge}
                      />
                    )
                  ) : null}
                  <Text style={[styles.inputText, !selectedCountry && styles.placeholderText]}>
                    {selectedCountry || 'Select a country'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#888" />
              </View>
            </TouchableOpacity>

            {/* ID Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ID Number:</Text>
              <TextInput
                style={styles.textInput}
                value={idNumber}
                onChangeText={onIdNumberChange}
                placeholder="Enter your health ID number"
                placeholderTextColor="#666"
              />
            </View>

            {/* Notes */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes: (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={notes}
                onChangeText={onNotesChange}
                placeholder="Add any additional notes"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      <MedicalRecordScanner
        visible={idScannerVisible}
        onClose={onScannerClose}
        onSave={onScannerSave}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
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
    backgroundColor: '#181818',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  scanRow: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    fontWeight: '500',
  },
  placeholderText: {
    color: '#666',
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedCountryBadge: {
    width: 50,
    height: 34,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  selectedCountryFlagImage: {
    width: 50,
    height: 34,
    borderRadius: 0,
    marginRight: 8,
    overflow: 'hidden',
  },
});

export default AddHealthIDModal;
