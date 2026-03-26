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
        animationType="fade"
        transparent
        onRequestClose={onClose}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.sheet}>
            {/* X / Title / Tick header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={22} color="#FF3B30" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{isEditing ? 'Edit Health ID' : 'Add Health ID'}</Text>
              <TouchableOpacity onPress={onSave} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="checkmark" size={22} color="#34C759" />
              </TouchableOpacity>
            </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Primary toggle */}
            <View style={styles.group}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleText}>Set as main ID</Text>
                <Switch
                  value={isPrimaryDraft}
                  onValueChange={onPrimaryChange}
                  trackColor={{ false: '#444', true: '#34C759' }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* Scan button */}
            <View style={styles.scanRow}>
              <TouchableOpacity style={styles.scanButton} onPress={onScanPress}>
                <Ionicons name="scan" size={18} color="#FFFFFF" />
                <Text style={styles.scanButtonText}>Scan Health ID</Text>
              </TouchableOpacity>
            </View>

            {/* Country + ID Number group */}
            <View style={styles.group}>
              <TouchableOpacity style={styles.countryRow} onPress={handleCountrySelect}>
                <View style={styles.countryInner}>
                  {selectedCountry && selectedCountryCode ? (
                    FLAG_IMAGES[flagKey] ? (
                      <Image
                        source={FLAG_IMAGES[flagKey]}
                        style={styles.flagImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <LinearGradient
                        colors={(COUNTRIES.find(c => c.code === selectedCountryCode)?.gradient ?? ['#444', '#666']) as [string, string]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.flagBadge}
                      />
                    )
                  ) : null}
                  <Text style={[styles.rowText, !selectedCountry && { color: '#8E8E93' }]}>
                    {selectedCountry || 'Country'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={18} color="#8E8E93" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TextInput
                style={styles.gInput}
                value={idNumber}
                onChangeText={onIdNumberChange}
                placeholder="Health ID Number"
                placeholderTextColor="#8E8E93"
              />
            </View>

            {/* Notes group */}
            <View style={styles.group}>
              <TextInput
                style={[styles.gInput, styles.notesInput]}
                value={notes}
                onChangeText={onNotesChange}
                placeholder="Notes"
                placeholderTextColor="#555"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  group: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: '#3A3A3C',
    marginLeft: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  scanRow: {
    marginBottom: 20,
    flexDirection: 'row',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3AABF0',
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
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  countryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagImage: {
    width: 32,
    height: 22,
    marginRight: 10,
  },
  flagBadge: {
    width: 32,
    height: 22,
    borderRadius: 3,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  rowText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  gInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  notesInput: {
    height: 90,
    textAlignVertical: 'top',
  },
});

export default AddHealthIDModal;
