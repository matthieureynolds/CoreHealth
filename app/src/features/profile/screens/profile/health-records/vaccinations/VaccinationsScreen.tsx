import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { Vaccination, AttachedFile } from '../../../../../../shared/types';
import * as DocumentPicker from 'expo-document-picker';
import FileViewerModal from '../../../../../../shared/components/modals/FileViewerModal';
import VaccinationCard from './components/VaccinationCard';
import VaccinationEmptyState from './components/VaccinationEmptyState';
import VaccinationFormModal from './components/VaccinationFormModal';

const commonVaccines = [
  'COVID-19', 'Influenza (Flu)', 'Tetanus', 'Diphtheria', 'Pertussis (Whooping Cough)',
  'Measles', 'Mumps', 'Rubella', 'Varicella (Chickenpox)', 'Hepatitis A',
  'Hepatitis B', 'HPV (Human Papillomavirus)', 'Meningococcal', 'Pneumococcal',
  'Rotavirus', 'Haemophilus influenzae type b (Hib)', 'Polio', 'Yellow Fever',
  'Typhoid', 'Rabies', 'Japanese Encephalitis', 'Cholera', 'Tuberculosis (BCG)',
  'Shingles (Zoster)', 'Pneumonia', 'Meningitis B', 'Meningitis ACWY',
];

const VaccinationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [vaccineName, setVaccineName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dateReceived, setDateReceived] = useState<Date | null>(null);
  const [showDateReceivedPicker, setShowDateReceivedPicker] = useState(false);
  const [nextDueDate, setNextDueDate] = useState<Date | null>(null);
  const [showNextDuePicker, setShowNextDuePicker] = useState(false);
  const [dateModeReceived, setDateModeReceived] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [dateModeNextDue, setDateModeNextDue] = useState<'year' | 'yearMonth' | 'full'>('full');
  const [location, setLocation] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [currentFileUri, setCurrentFileUri] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [currentFileType, setCurrentFileType] = useState('');

  const resetForm = () => {
    setVaccineName('');
    setDateReceived(null);
    setNextDueDate(null);
    setLocation('');
    setBatchNumber('');
    setNotes('');
    setEditingVaccination(null);
    setAttachments([]);
  };

  const addVaccination = () => {
    if (!vaccineName.trim()) {
      Alert.alert('Error', 'Please enter a vaccine name');
      return;
    }

    if (editingVaccination) {
      const updated: Vaccination = {
        id: editingVaccination.id,
        name: vaccineName.trim(),
        date: dateReceived || new Date(),
        nextDue: nextDueDate || undefined,
        location: location.trim() || undefined,
        batchNumber: batchNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        attachments: attachments.length ? attachments : undefined,
      };
      const updatedVaccinations = (profile?.vaccinations || []).map(v =>
        v.id === editingVaccination.id ? updated : v,
      );
      updateProfile({ ...profile, vaccinations: updatedVaccinations });
    } else {
      const newVaccination: Vaccination = {
        id: Date.now().toString(),
        name: vaccineName.trim(),
        date: dateReceived || new Date(),
        nextDue: nextDueDate || undefined,
        location: location.trim() || undefined,
        batchNumber: batchNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        attachments: attachments.length ? attachments : undefined,
      };
      const updatedVaccinations = [...(profile?.vaccinations || []), newVaccination];
      updateProfile({ ...profile, vaccinations: updatedVaccinations });
    }

    setShowAddModal(false);
    resetForm();
  };

  const deleteVaccination = (id: string) => {
    Alert.alert('Delete Vaccination', 'Are you sure you want to delete this vaccination?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedVaccinations = profile?.vaccinations?.filter(v => v.id !== id) || [];
          updateProfile({ ...profile, vaccinations: updatedVaccinations });
        },
      },
    ]);
  };

  const handleEditVaccination = (v: Vaccination) => {
    setVaccineName(v.name);
    setDateReceived(v.date ? new Date(v.date) : new Date());
    setNextDueDate(v.nextDue ? new Date(v.nextDue) : null);
    setLocation(v.location || '');
    setBatchNumber(v.batchNumber || '');
    setNotes(v.notes || '');
    setAttachments(v.attachments || []);
    setEditingVaccination(v);
    setShowAddModal(true);
  };

  const openVaccinationOptions = (v: Vaccination) => {
    Alert.alert(v.name, undefined, [
      { text: 'Edit', onPress: () => handleEditVaccination(v) },
      { text: 'Delete', style: 'destructive', onPress: () => deleteVaccination(v.id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newFile: AttachedFile = {
          uri: asset.uri,
          name: asset.name || 'attachment',
          type: asset.mimeType,
        };
        setAttachments(prev => [...prev, newFile]);
      }
    } catch (e) {
      console.error('Attachment error', e);
      Alert.alert('Attachment Error', 'Failed to attach file.');
    }
  };

  const handleViewFile = (fileUri: string, fileName: string, fileType?: string) => {
    setCurrentFileUri(fileUri);
    setCurrentFileName(fileName);
    setCurrentFileType(fileType || '');
    setFileViewerVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vaccinations</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#3AABF0" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 95 }}>
        <View style={styles.content}>
          {profile?.vaccinations?.length ? (
            profile.vaccinations.map((vaccination) => (
              <VaccinationCard
                key={vaccination.id}
                vaccination={vaccination}
                onOptions={openVaccinationOptions}
                onViewFile={handleViewFile}
              />
            ))
          ) : (
            <VaccinationEmptyState onAdd={() => setShowAddModal(true)} />
          )}
        </View>
      </ScrollView>

      <VaccinationFormModal
        visible={showAddModal}
        editingVaccination={editingVaccination}
        vaccineName={vaccineName}
        setVaccineName={setVaccineName}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        dateReceived={dateReceived}
        setDateReceived={setDateReceived}
        showDateReceivedPicker={showDateReceivedPicker}
        setShowDateReceivedPicker={setShowDateReceivedPicker}
        nextDueDate={nextDueDate}
        setNextDueDate={setNextDueDate}
        showNextDuePicker={showNextDuePicker}
        setShowNextDuePicker={setShowNextDuePicker}
        dateModeReceived={dateModeReceived}
        setDateModeReceived={setDateModeReceived}
        dateModeNextDue={dateModeNextDue}
        setDateModeNextDue={setDateModeNextDue}
        location={location}
        setLocation={setLocation}
        batchNumber={batchNumber}
        setBatchNumber={setBatchNumber}
        notes={notes}
        setNotes={setNotes}
        attachments={attachments}
        onRemoveAttachment={(name) => setAttachments(prev => prev.filter(a => a.name !== name))}
        onAttachFile={handleAttachFile}
        onCancel={() => { setShowAddModal(false); resetForm(); }}
        onSave={addVaccination}
        commonVaccines={commonVaccines}
      />

      <FileViewerModal
        visible={fileViewerVisible}
        onClose={() => setFileViewerVisible(false)}
        fileUri={currentFileUri}
        fileName={currentFileName}
        fileType={currentFileType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#000000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
    paddingBottom: 8,
  },
  addButton: {
    padding: 8,
    width: 40,
    alignItems: 'flex-end',
  },
  content: {
    padding: 20,
  },
});

export default VaccinationsScreen;
