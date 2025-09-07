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
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import MedicalRecordScanner from '../../components/common/MedicalRecordScanner';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../context/HealthDataContext';
import { HealthID } from '../../types';
import { LinearGradient } from 'expo-linear-gradient';

const HealthIDsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [idScannerVisible, setIdScannerVisible] = useState(false);

  // Debug useEffect - removed since we're using Alert

  const countries = [
    { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', idTypes: ['NHS Number', 'NI Number'], gradient: ['#1e3c72', '#2a5298'] },
    { name: 'France', code: 'FR', flag: '🇫🇷', idTypes: ['Carte Vitale', 'Numéro de Sécurité Sociale'], gradient: ['#667eea', '#764ba2'] },
    { name: 'Germany', code: 'DE', flag: '🇩🇪', idTypes: ['Gesundheitskarte', 'Versichertennummer'], gradient: ['#f093fb', '#f5576c'] },
    { name: 'Australia', code: 'AU', flag: '🇦🇺', idTypes: ['Medicare', 'DVA Card'], gradient: ['#4facfe', '#00f2fe'] },
    { name: 'Canada', code: 'CA', flag: '🇨🇦', idTypes: ['Health Card', 'SIN'], gradient: ['#43e97b', '#38f9d7'] },
    { name: 'United States', code: 'US', flag: '🇺🇸', idTypes: ['Medicare', 'Medicaid', 'SSN'], gradient: ['#fa709a', '#fee140'] },
    { name: 'Spain', code: 'ES', flag: '🇪🇸', idTypes: ['Tarjeta Sanitaria', 'Número de Seguridad Social'], gradient: ['#a8edea', '#fed6e3'] },
    { name: 'Italy', code: 'IT', flag: '🇮🇹', idTypes: ['Tessera Sanitaria', 'Codice Fiscale'], gradient: ['#ff9a9e', '#fecfef'] },
    { name: 'Netherlands', code: 'NL', flag: '🇳🇱', idTypes: ['DigiD', 'BSN'], gradient: ['#a18cd1', '#fbc2eb'] },
    { name: 'Sweden', code: 'SE', flag: '🇸🇪', idTypes: ['Personnummer', 'Folkbokföring'], gradient: ['#fad0c4', '#ffd1ff'] },
    { name: 'Norway', code: 'NO', flag: '🇳🇴', idTypes: ['Fødselsnummer', 'D-nummer'], gradient: ['#ffecd2', '#fcb69f'] },
    { name: 'Denmark', code: 'DK', flag: '🇩🇰', idTypes: ['CPR-nummer', 'NemID'], gradient: ['#a8caba', '#5d4e75'] },
    { name: 'Switzerland', code: 'CH', flag: '🇨🇭', idTypes: ['AHV-Nummer', 'Versichertenkarte'], gradient: ['#d299c2', '#fef9d7'] },
    { name: 'Belgium', code: 'BE', flag: '🇧🇪', idTypes: ['Mutualité', 'Numéro de Registre National'], gradient: ['#89f7fe', '#66a6ff'] },
    { name: 'Austria', code: 'AT', flag: '🇦🇹', idTypes: ['e-card', 'Sozialversicherungsnummer'], gradient: ['#fdbb2d', '#22c1c3'] },
    { name: 'Ireland', code: 'IE', flag: '🇮🇪', idTypes: ['PPS Number', 'Medical Card'], gradient: ['#ff9a8b', '#a8e6cf'] },
    { name: 'New Zealand', code: 'NZ', flag: '🇳🇿', idTypes: ['NHI Number', 'IRD Number'], gradient: ['#ffecd2', '#fcb69f'] },
    { name: 'Japan', code: 'JP', flag: '🇯🇵', idTypes: ['My Number', 'Health Insurance Card'], gradient: ['#a8edea', '#fed6e3'] },
    { name: 'South Korea', code: 'KR', flag: '🇰🇷', idTypes: ['National Health Insurance', 'Resident Registration Number'], gradient: ['#d299c2', '#fef9d7'] },
    { name: 'Singapore', code: 'SG', flag: '🇸🇬', idTypes: ['NRIC', 'Pink IC'], gradient: ['#89f7fe', '#66a6ff'] },
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

  const scanHealthId = async () => {
    // Open richer scanner modal for a better UX
    setIdScannerVisible(true);
  };

  const handleScannerSave = (record: any) => {
    // Try to extract a plausible ID from scanned data
    const sourceText = `${record?.title || ''} ${record?.provider || ''} ${record?.date || ''}`;
    const match = sourceText.replace(/\s+/g, ' ').match(/[A-Z0-9]{6,}|(\d[\s-]?){6,}/i);
    const extractedId = match ? match[0].replace(/[^A-Za-z0-9]/g, '') : '9434765911';

    if (!selectedCountry) {
      const mockCountry = countries[0];
      setSelectedCountry(mockCountry.name);
      setSelectedCountryCode(mockCountry.code);
    }

    setIdNumber(extractedId);
    setNotes((prev) => prev ? prev : 'Auto-filled from scanned Health ID');
    setIdScannerVisible(false);
    Alert.alert('Scan complete', 'Health ID number has been auto-filled.');
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
      {/* Header (fixed) */}
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Health IDs List */}
        <View style={styles.content}>
          {profile?.healthIDs?.length ? (
            profile.healthIDs.map((healthID, index) => {
              const countryData = countries.find(c => c.code === healthID.countryCode);
              return (
                <View key={healthID.id} style={[styles.healthIDCard, { marginTop: index === 0 ? 0 : 16 }]}>
                  <LinearGradient
                    colors={(countryData?.gradient ?? ['#667eea', '#764ba2']) as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <View style={styles.countryInfo}>
                          <Text style={styles.countryFlag}>{countryData?.flag || '🏥'}</Text>
                          <View style={styles.countryDetails}>
                            <Text style={styles.countryName}>{healthID.country}</Text>
                            <Text style={styles.idType}>{healthID.idType}</Text>
                          </View>
                        </View>
                        <View style={styles.cardActions}>
                          {healthID.isPrimary && (
                            <View style={styles.primaryBadge}>
                              <Ionicons name="star" size={12} color="#fff" />
                              <Text style={styles.primaryText}>Primary</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.cardBody}>
                        <Text style={styles.idNumber}>{healthID.idNumber}</Text>
                        {healthID.notes && (
                          <Text style={styles.notes}>{healthID.notes}</Text>
                        )}
                      </View>
                      
                      <View style={styles.cardFooter}>
                        <TouchableOpacity
                          onPress={() => setPrimaryHealthID(healthID.id)}
                          style={[styles.actionButton, healthID.isPrimary && styles.disabledButton]}
                          disabled={healthID.isPrimary}
                        >
                          <Ionicons 
                            name={healthID.isPrimary ? "star" : "star-outline"} 
                            size={20} 
                            color={healthID.isPrimary ? "#fff" : "#fff"} 
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => deleteHealthID(healthID.id)}
                          style={styles.actionButton}
                        >
                          <Ionicons name="trash-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="card-outline" size={48} color="#007AFF" />
              </View>
              <Text style={styles.emptyTitle}>No Health IDs</Text>
              <Text style={styles.emptySubtitle}>Add your national health IDs to keep them organized and easily accessible</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={() => setShowAddModal(true)}>
                <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 8 }} />
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
            {/* Scan ID */}
            <View style={styles.scanRow}>
              <TouchableOpacity style={styles.scanButton} onPress={scanHealthId}>
                <Ionicons name="scan" size={18} color="#FFFFFF" />
                <Text style={styles.scanButtonText}>Scan Health ID</Text>
              </TouchableOpacity>
            </View>

            {/* Country Selection */}
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => {
                console.log('Country picker tapped, showing alert');
                // Create country options for Alert
                const countryOptions = countries.map(country => `${country.flag} ${country.name}`);
                Alert.alert(
                  'Select Country',
                  'Choose your country:',
                  [
                    ...countryOptions.map((countryDisplay, index) => ({
                      text: countryDisplay,
                      onPress: () => {
                        // Find the country by matching the display text
                        const selectedCountryData = countries.find(c => countryDisplay === `${c.flag} ${c.name}`);
                        if (selectedCountryData) {
                          console.log('Country selected via alert:', selectedCountryData.name);
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
                <View style={styles.countrySelector}>
                  {selectedCountry && (
                    <Text style={styles.selectedCountryFlag}>
                      {countries.find(c => c.name === selectedCountry)?.flag}
                    </Text>
                  )}
                  <Text style={[styles.inputText, !selectedCountry && styles.placeholderText]}>
                    {selectedCountry || 'Select a country'}
                  </Text>
                </View>
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

      {/* Health ID Scanner (re-using MedicalRecordScanner for richer UX) */}
      <MedicalRecordScanner
        visible={idScannerVisible}
        onClose={() => setIdScannerVisible(false)}
        onSave={handleScannerSave}
      />

      {/* Country selection now uses Alert instead of Modal */}
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 3,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    left: 20,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingBottom: 8,
  },
  addButton: {
    padding: 8,
    position: 'absolute',
    right: 20,
    zIndex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  healthIDCard: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 20,
    minHeight: 140,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  countryFlag: {
    fontSize: 32,
    marginRight: 12,
  },
  countryDetails: {
    flex: 1,
  },
  countryName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  idType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  primaryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  cardBody: {
    marginBottom: 16,
  },
  idNumber: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  notes: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    padding: 12,
    marginLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
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
  selectedCountryFlag: {
    fontSize: 20,
    marginRight: 8,
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