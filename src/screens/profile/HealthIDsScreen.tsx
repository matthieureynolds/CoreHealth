import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../context/HealthDataContext';
import { HealthID } from '../../types';

const HealthIDsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Debug useEffect - removed since we're using Alert

  const countries = [
    { name: 'United Kingdom', code: 'GB', idTypes: ['NHS Number', 'NI Number'] },
    { name: 'France', code: 'FR', idTypes: ['Carte Vitale', 'Numéro de Sécurité Sociale'] },
    { name: 'Germany', code: 'DE', idTypes: ['Gesundheitskarte', 'Versichertennummer'] },
    { name: 'Australia', code: 'AU', idTypes: ['Medicare', 'DVA Card'] },
    { name: 'Canada', code: 'CA', idTypes: ['Health Card', 'SIN'] },
    { name: 'United States', code: 'US', idTypes: ['Medicare', 'Medicaid', 'SSN'] },
    { name: 'Spain', code: 'ES', idTypes: ['Tarjeta Sanitaria', 'Número de Seguridad Social'] },
    { name: 'Italy', code: 'IT', idTypes: ['Tessera Sanitaria', 'Codice Fiscale'] },
    { name: 'Netherlands', code: 'NL', idTypes: ['DigiD', 'BSN'] },
    { name: 'Sweden', code: 'SE', idTypes: ['Personnummer', 'Folkbokföring'] },
    { name: 'Norway', code: 'NO', idTypes: ['Fødselsnummer', 'D-nummer'] },
    { name: 'Denmark', code: 'DK', idTypes: ['CPR-nummer', 'NemID'] },
    { name: 'Switzerland', code: 'CH', idTypes: ['AHV-Nummer', 'Versichertenkarte'] },
    { name: 'Belgium', code: 'BE', idTypes: ['Mutualité', 'Numéro de Registre National'] },
    { name: 'Austria', code: 'AT', idTypes: ['e-card', 'Sozialversicherungsnummer'] },
    { name: 'Ireland', code: 'IE', idTypes: ['PPS Number', 'Medical Card'] },
    { name: 'New Zealand', code: 'NZ', idTypes: ['NHI Number', 'IRD Number'] },
    { name: 'Japan', code: 'JP', idTypes: ['My Number', 'Health Insurance Card'] },
    { name: 'South Korea', code: 'KR', idTypes: ['National Health Insurance', 'Resident Registration Number'] },
    { name: 'Singapore', code: 'SG', idTypes: ['NRIC', 'Pink IC'] },
  ];

  const selectedCountryData = countries.find(c => c.code === selectedCountryCode);

  const addHealthID = () => {
    if (!selectedCountry || !idNumber.trim()) {
      Alert.alert('Error', 'Please select a country and enter an ID number');
      return;
    }

    const newHealthID: HealthID = {
      id: Date.now().toString(),
      country: selectedCountry,
      countryCode: selectedCountryCode,
      idType: selectedCountryData?.idTypes[0] || 'Health ID',
      idNumber: idNumber.trim(),
      isPrimary: !profile?.healthIDs?.length,
      notes: notes.trim() || undefined,
    };

    const updatedHealthIDs = [...(profile?.healthIDs || []), newHealthID];
    updateProfile({
      ...profile,
      healthIDs: updatedHealthIDs,
    });

    setShowAddModal(false);
    setSelectedCountry('');
    setSelectedCountryCode('');
    setIdNumber('');
    setNotes('');
  };

  const deleteHealthID = (id: string) => {
    Alert.alert(
      'Delete Health ID',
      'Are you sure you want to delete this health ID?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedHealthIDs = profile?.healthIDs?.filter(hid => hid.id !== id) || [];
            updateProfile({
              ...profile,
              healthIDs: updatedHealthIDs,
            });
          },
        },
      ]
    );
  };

  const setPrimaryHealthID = (id: string) => {
    const updatedHealthIDs = profile?.healthIDs?.map(hid => ({
      ...hid,
      isPrimary: hid.id === id,
    })) || [];
    updateProfile({
      ...profile,
      healthIDs: updatedHealthIDs,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health IDs</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              console.log('Add button pressed');
              setShowAddModal(true);
            }}
          >
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Health IDs List */}
        <View style={styles.content}>
          {profile?.healthIDs?.length ? (
            profile.healthIDs.map((healthID) => (
              <View key={healthID.id} style={styles.healthIDCard}>
                <View style={styles.healthIDHeader}>
                  <View style={styles.healthIDInfo}>
                    <Text style={styles.countryName}>{healthID.country}</Text>
                    <Text style={styles.idType}>{healthID.idType}</Text>
                    <Text style={styles.idNumber}>{healthID.idNumber}</Text>
                    {healthID.notes && <Text style={styles.notes}>{healthID.notes}</Text>}
                  </View>
                  <View style={styles.healthIDActions}>
                    {healthID.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryText}>Primary</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => setPrimaryHealthID(healthID.id)}
                      style={[styles.actionButton, healthID.isPrimary && styles.disabledButton]}
                      disabled={healthID.isPrimary}
                    >
                      <Ionicons name="star" size={20} color={healthID.isPrimary ? "#666" : "#FFD700"} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteHealthID(healthID.id)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No Health IDs</Text>
              <Text style={styles.emptySubtitle}>Add your national health IDs to keep them organized</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.addFirstButtonText}>Add Health ID</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Health ID Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Health ID</Text>
            <TouchableOpacity onPress={addHealthID}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Country Selection */}
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => {
                console.log('Country picker tapped, showing alert');
                // Create country options for Alert
                const countryOptions = countries.map(country => country.name);
                Alert.alert(
                  'Select Country',
                  'Choose your country:',
                  [
                    ...countryOptions.map((countryName, index) => ({
                      text: countryName,
                      onPress: () => {
                        const selectedCountryData = countries.find(c => c.name === countryName);
                        if (selectedCountryData) {
                          console.log('Country selected via alert:', countryName);
                          setSelectedCountry(selectedCountryData.name);
                          setSelectedCountryCode(selectedCountryData.code);
                        }
                      }
                    })),
                    {
                      text: 'Cancel',
                      style: 'cancel'
                    }
                  ]
                );
              }}
            >
              <Text style={styles.inputLabel}>Country</Text>
              <View style={styles.inputRow}>
                <Text style={[styles.inputText, !selectedCountry && styles.placeholderText]}>
                  {selectedCountry || 'Select a country'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#888" />
              </View>
            </TouchableOpacity>

            {/* ID Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ID Number</Text>
              <TextInput
                style={styles.textInput}
                value={idNumber}
                onChangeText={setIdNumber}
                placeholder="Enter your health ID number"
                placeholderTextColor="#666"
              />
            </View>

            {/* Notes */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Country selection now uses Alert instead of Modal */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#111',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  addButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  healthIDCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  healthIDHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  healthIDInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  idType: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  idNumber: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  notes: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  healthIDActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  primaryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
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
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#111',
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
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  placeholderText: {
    color: '#666',
  },
  textInput: {
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  countryOptionText: {
    fontSize: 16,
    color: '#fff',
  },
  countryPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  countryPickerBottomSheet: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  countryPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  countryPickerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  countryPickerContent: {
    maxHeight: 300,
  },
});

export default HealthIDsScreen; 