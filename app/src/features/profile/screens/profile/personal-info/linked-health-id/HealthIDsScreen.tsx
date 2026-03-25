import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { HealthID } from '../../../../../../shared/types';
import { COUNTRIES } from './countries';
import HealthIDCard from './components/HealthIDCard';
import EmptyHealthIDState from './components/EmptyHealthIDState';
import AddHealthIDModal from './components/AddHealthIDModal';

const HealthIDsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [idScannerVisible, setIdScannerVisible] = useState(false);
  const [editingHealthIdId, setEditingHealthIdId] = useState<string | null>(null);
  const [isPrimaryDraft, setIsPrimaryDraft] = useState(false);

  const resetModalState = () => {
    setEditingHealthIdId(null);
    setSelectedCountry('');
    setSelectedCountryCode('');
    setIdNumber('');
    setNotes('');
    setIsPrimaryDraft(false);
  };

  const openAddModal = () => {
    resetModalState();
    setIsPrimaryDraft(!(profile?.healthIDs && profile.healthIDs.length > 0));
    setShowAddModal(true);
  };

  const saveHealthID = () => {
    if (!selectedCountry || !idNumber.trim()) {
      Alert.alert('Error', 'Please select a country and enter an ID number');
      return;
    }

    const selectedCountryData = COUNTRIES.find(c => c.code === selectedCountryCode);

    if (editingHealthIdId) {
      const updatedHealthIDs = (profile?.healthIDs || []).map(hid => {
        if (hid.id === editingHealthIdId) {
          return {
            ...hid,
            country: selectedCountry,
            countryCode: selectedCountryCode,
            idType: selectedCountryData?.idTypes[0] || hid.idType,
            idNumber: idNumber.trim(),
            notes: notes.trim() || undefined,
            isPrimary: isPrimaryDraft,
          };
        }
        return isPrimaryDraft ? { ...hid, isPrimary: false } : hid;
      });
      updateProfile({ ...profile, healthIDs: updatedHealthIDs });
    } else {
      const newHealthID: HealthID = {
        id: Date.now().toString(),
        country: selectedCountry,
        countryCode: selectedCountryCode,
        idType: selectedCountryData?.idTypes[0] || 'Health ID',
        idNumber: idNumber.trim(),
        isPrimary: isPrimaryDraft,
        notes: notes.trim() || undefined,
      };
      let updatedHealthIDs = [...(profile?.healthIDs || [])];
      if (isPrimaryDraft) {
        updatedHealthIDs = updatedHealthIDs.map(hid => ({ ...hid, isPrimary: false }));
      }
      updatedHealthIDs.push(newHealthID);
      updateProfile({ ...profile, healthIDs: updatedHealthIDs });
    }

    setShowAddModal(false);
    resetModalState();
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
            updateProfile({ ...profile, healthIDs: updatedHealthIDs });
          },
        },
      ]
    );
  };

  const openHealthIdOptions = (healthID: HealthID) => {
    Alert.alert(
      'Health ID Options',
      'What would you like to do?',
      [
        {
          text: 'Edit',
          onPress: () => {
            setSelectedCountry(healthID.country);
            setSelectedCountryCode(healthID.countryCode || '');
            setIdNumber(healthID.idNumber);
            setNotes(healthID.notes || '');
            setEditingHealthIdId(healthID.id);
            setIsPrimaryDraft(!!healthID.isPrimary);
            setShowAddModal(true);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteHealthID(healthID.id),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleScannerSave = (record: any) => {
    const sourceText = `${record?.title || ''} ${record?.provider || ''} ${record?.date || ''}`;
    const match = sourceText.replace(/\s+/g, ' ').match(/[A-Z0-9]{6,}|(\d[\s-]?){6,}/i);
    const extractedId = match ? match[0].replace(/[^A-Za-z0-9]/g, '') : '9434765911';

    if (!selectedCountry) {
      const mockCountry = COUNTRIES[0];
      setSelectedCountry(mockCountry.name);
      setSelectedCountryCode(mockCountry.code);
    }

    setIdNumber(extractedId);
    setNotes(prev => prev || 'Auto-filled from scanned Health ID');
    setIdScannerVisible(false);
    Alert.alert('Scan complete', 'Health ID number has been auto-filled.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health IDs</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {profile?.healthIDs?.length ? (
            profile.healthIDs.map((healthID, index) => (
              <HealthIDCard
                key={healthID.id}
                healthID={healthID}
                index={index}
                onOptionsPress={openHealthIdOptions}
              />
            ))
          ) : (
            <EmptyHealthIDState onAddPress={openAddModal} />
          )}
        </View>
      </ScrollView>

      <AddHealthIDModal
        visible={showAddModal}
        isEditing={!!editingHealthIdId}
        selectedCountry={selectedCountry}
        selectedCountryCode={selectedCountryCode}
        idNumber={idNumber}
        notes={notes}
        isPrimaryDraft={isPrimaryDraft}
        idScannerVisible={idScannerVisible}
        onClose={() => { setShowAddModal(false); resetModalState(); }}
        onSave={saveHealthID}
        onCountryChange={(name, code) => { setSelectedCountry(name); setSelectedCountryCode(code); }}
        onIdNumberChange={setIdNumber}
        onNotesChange={setNotes}
        onPrimaryChange={setIsPrimaryDraft}
        onScanPress={() => setIdScannerVisible(true)}
        onScannerClose={() => setIdScannerVisible(false)}
        onScannerSave={handleScannerSave}
      />
    </View>
  );
};

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
    paddingTop: 72,
    paddingBottom: 5,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    left: 20,
    top: 24.7,
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
    paddingTop: 16.5,
    paddingBottom: 8,
  },
  addButton: {
    padding: 8,
    position: 'absolute',
    right: 20,
    top: 24.7,
    zIndex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
});

export default HealthIDsScreen;
