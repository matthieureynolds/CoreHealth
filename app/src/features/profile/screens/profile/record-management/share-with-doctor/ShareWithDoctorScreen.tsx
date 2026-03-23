import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, ActivityIndicator, Platform, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '../../../../../../shared/context/AuthContext';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { Doctor } from '../../../../../../shared/types';
import { generateHealthReportHTML } from './shareWithDoctorReport';

const REPORT_SECTIONS = [
  { id: 'personal_info', label: 'Personal Information', icon: 'person-outline' },
  { id: 'medical_conditions', label: 'Medical Conditions', icon: 'medical-outline' },
  { id: 'medications', label: 'Medications', icon: 'medical-outline' },
  { id: 'allergies', label: 'Allergies', icon: 'warning-outline' },
  { id: 'family_history', label: 'Family History', icon: 'people-outline' },
  { id: 'vaccinations', label: 'Vaccinations', icon: 'shield-checkmark-outline' },
  { id: 'screenings', label: 'Screenings', icon: 'search-outline' },
  { id: 'medical_records', label: 'Medical Records', icon: 'folder-outline' },
];

const BLANK_DOCTOR = { name: '', specialty: '', phone: '', email: '', office: '', address: '', notes: '' };

const ShareWithDoctorScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { profile, updateProfile } = useHealthData();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>(REPORT_SECTIONS.map(s => s.id));
  const [newDoctor, setNewDoctor] = useState(BLANK_DOCTOR);

  const toggleSection = (id: string) => setSelectedSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const getSectionCount = (id: string): number => {
    switch (id) {
      case 'medical_conditions': return profile?.medicalHistory?.length || 0;
      case 'medications': return profile?.medications?.length || 0;
      case 'allergies': return profile?.allergies?.length || 0;
      case 'family_history': return profile?.familyHistory?.length || 0;
      case 'vaccinations': return profile?.vaccinations?.length || 0;
      case 'screenings': return profile?.screenings?.length || 0;
      case 'medical_records': return profile?.medicalRecords?.length || 0;
      default: return 0;
    }
  };

  const addNewDoctor = () => {
    if (!newDoctor.name.trim() || !newDoctor.specialty.trim()) { Alert.alert('Error', 'Please enter doctor name and specialty'); return; }
    const doctor: Doctor = {
      id: Date.now().toString(),
      name: newDoctor.name.trim(), specialty: newDoctor.specialty.trim(),
      phone: newDoctor.phone.trim(), email: newDoctor.email.trim(),
      office: newDoctor.office.trim(), address: newDoctor.address.trim(),
      notes: newDoctor.notes.trim(), isRegistered: false,
    };
    updateProfile({ ...profile, doctors: [...(profile?.doctors || []), doctor] });
    setSelectedDoctor(doctor);
    setShowAddDoctor(false);
    setNewDoctor(BLANK_DOCTOR);
    Alert.alert('Success', 'Doctor added successfully');
  };

  const generateAndShareReport = async () => {
    if (!selectedDoctor) { Alert.alert('Error', 'Please select a doctor'); return; }
    if (!selectedSections.length) { Alert.alert('Error', 'Please select at least one section'); return; }
    setIsGenerating(true);
    try {
      const patientName = user?.displayName || (user as any)?.firstName || 'User';
      const html = generateHealthReportHTML({ patientName, selectedDoctor, selectedSections, profile });
      const { uri } = await Print.printToFileAsync({ html, base64: false, width: 612, height: 792, margins: { left: 36, right: 36, top: 36, bottom: 36 } });
      setIsGenerating(false);
      const date = new Date().toISOString().split('T')[0];
      const filename = `CoreHealth_Report_${patientName.replace(/\s+/g, '_')}_Dr_${selectedDoctor.name.replace(/\s+/g, '_')}_${date}.pdf`;
      Alert.alert('Health Report Generated! 📄', `Ready to share with Dr. ${selectedDoctor.name}.`, [
        { text: 'Share with Doctor', onPress: async () => {
          try {
            if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Share with Dr. ${selectedDoctor.name}`, UTI: 'com.adobe.pdf' });
            else Alert.alert('Sharing not available', 'Sharing is not available on this device');
          } catch { Alert.alert('Error', 'Could not share the report'); }
        }},
        { text: 'Save to Device', onPress: async () => {
          try {
            if (Platform.OS === 'ios') {
              if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Save Health Report', UTI: 'com.adobe.pdf' });
            } else {
              const dir = (FileSystem as any).documentDirectory + 'Downloads/';
              await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
              await FileSystem.copyAsync({ from: uri, to: dir + filename });
              Alert.alert('Saved!', `Report saved as ${filename}`);
            }
          } catch { Alert.alert('Error', 'Could not save the report. Please try sharing instead.'); }
        }},
        { text: 'View Report', onPress: async () => {
          try {
            const canOpen = await Linking.canOpenURL(uri);
            if (canOpen) { await Linking.openURL(uri); }
            else if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'View Health Report', UTI: 'com.adobe.pdf' });
            else Alert.alert('Viewing not available', 'PDF viewing is not available on this device');
          } catch { Alert.alert('Error', 'Could not open the report'); }
        }},
        { text: 'Cancel', style: 'cancel' },
      ]);
    } catch (error) {
      setIsGenerating(false);
      Alert.alert('Error', 'Failed to generate the health report. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (navigation as any).goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share with Doctor</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.doctorSection}>
            <Text style={styles.sectionTitle}>Select Doctor</Text>
            <Text style={styles.sectionSubtitle}>Choose a registered doctor or add a new one</Text>
            <TouchableOpacity style={styles.doctorCard} onPress={() => setShowDoctorPicker(true)}>
              {selectedDoctor ? (
                <View style={styles.selectedDoctor}>
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>Dr. {selectedDoctor.name}</Text>
                    <Text style={styles.doctorSpecialty}>{selectedDoctor.specialty}</Text>
                    {selectedDoctor.office && <Text style={styles.doctorOffice}>{selectedDoctor.office}</Text>}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#888" />
                </View>
              ) : (
                <View style={styles.noDoctorSelected}>
                  <Ionicons name="person-add-outline" size={24} color="#888" />
                  <Text style={styles.noDoctorText}>Select a doctor</Text>
                  <Ionicons name="chevron-forward" size={20} color="#888" />
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.addDoctorButton} onPress={() => setShowAddDoctor(true)}>
              <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.addDoctorButtonText}>Add New Doctor</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionsSection}>
            <Text style={styles.sectionTitle}>Select Information to Share</Text>
            <Text style={styles.sectionSubtitle}>Choose which health information to include in the report</Text>
            {REPORT_SECTIONS.map(section => (
              <TouchableOpacity key={section.id} style={[styles.sectionCard, selectedSections.includes(section.id) && styles.selectedSection]} onPress={() => toggleSection(section.id)}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionInfo}>
                    <Ionicons name={section.icon as any} size={24} color={selectedSections.includes(section.id) ? '#007AFF' : '#888'} />
                    <View style={styles.sectionText}>
                      <Text style={[styles.sectionLabel, selectedSections.includes(section.id) && styles.selectedSectionText]}>{section.label}</Text>
                      {section.id !== 'personal_info' && <Text style={styles.sectionCount}>{getSectionCount(section.id)} items</Text>}
                    </View>
                  </View>
                  <View style={[styles.checkbox, selectedSections.includes(section.id) && styles.checkedBox]}>
                    {selectedSections.includes(section.id) && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.shareSection}>
            <TouchableOpacity style={[styles.shareButton, (!selectedDoctor || !selectedSections.length) && styles.disabledButton]} onPress={generateAndShareReport} disabled={!selectedDoctor || !selectedSections.length || isGenerating}>
              {isGenerating ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="share-outline" size={20} color="#fff" />}
              <Text style={styles.shareButtonText}>{isGenerating ? 'Generating & Sharing...' : 'Generate & Share Report'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Doctor Picker Modal */}
      <Modal visible={showDoctorPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowDoctorPicker(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDoctorPicker(false)}><Text style={styles.cancelButton}>Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>Select Doctor</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {profile?.doctors?.length ? (
              <>
                <Text style={styles.doctorCountText}>{profile.doctors.length} doctor{profile.doctors.length > 1 ? 's' : ''} available</Text>
                {profile.doctors.map(doctor => (
                  <TouchableOpacity key={doctor.id} style={styles.doctorOption} onPress={() => { setSelectedDoctor(doctor); setShowDoctorPicker(false); }}>
                    <View style={styles.doctorOptionInfo}>
                      <Text style={styles.doctorOptionName}>Dr. {doctor.name}</Text>
                      <Text style={styles.doctorOptionSpecialty}>{doctor.specialty}</Text>
                      {doctor.office && <Text style={styles.doctorOptionOffice}>{doctor.office}</Text>}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#888" />
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={styles.noDoctorsState}>
                <Ionicons name="people-outline" size={48} color="#666" />
                <Text style={styles.noDoctorsTitle}>No Doctors Added</Text>
                <Text style={styles.noDoctorsSubtitle}>Add a doctor to get started</Text>
                <TouchableOpacity style={styles.addFromDoctorsButton} onPress={() => { setShowDoctorPicker(false); setShowAddDoctor(true); }}>
                  <Text style={styles.addFromDoctorsButtonText}>Add New Doctor</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Add Doctor Modal */}
      <Modal visible={showAddDoctor} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddDoctor(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddDoctor(false)}><Text style={styles.cancelButton}>Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Doctor</Text>
            <TouchableOpacity onPress={addNewDoctor}><Text style={styles.saveButton}>Save</Text></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {[
              { key: 'name', label: 'Doctor Name *', placeholder: 'e.g., John Smith' },
              { key: 'specialty', label: 'Specialty *', placeholder: 'e.g., Cardiology' },
              { key: 'phone', label: 'Phone Number', placeholder: 'e.g., +1 (555) 123-4567', keyboardType: 'phone-pad' },
              { key: 'email', label: 'Email', placeholder: 'e.g., doctor@hospital.com', keyboardType: 'email-address' },
              { key: 'office', label: 'Office/Hospital', placeholder: 'e.g., City General Hospital' },
              { key: 'address', label: 'Address', placeholder: 'e.g., 123 Medical Center Dr' },
            ].map(f => (
              <View key={f.key} style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{f.label}</Text>
                <TextInput style={styles.textInput} value={(newDoctor as any)[f.key]} onChangeText={t => setNewDoctor({ ...newDoctor, [f.key]: t })} placeholder={f.placeholder} placeholderTextColor="#666" keyboardType={(f as any).keyboardType || 'default'} />
              </View>
            ))}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput style={[styles.textInput, styles.textArea]} value={newDoctor.notes} onChangeText={t => setNewDoctor({ ...newDoctor, notes: t })} placeholder="Add any additional notes" placeholderTextColor="#666" multiline numberOfLines={3} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 72, paddingBottom: 5, backgroundColor: '#181818', borderBottomWidth: 1, borderBottomColor: '#222' },
  backButton: { padding: 8, position: 'absolute', left: 20, top: 24.7, zIndex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center', position: 'absolute', left: 0, right: 0, paddingTop: 16.5, paddingBottom: 8 },
  content: { padding: 20 },
  doctorSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 8 },
  sectionSubtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
  doctorCard: { backgroundColor: '#181818', borderRadius: 12, padding: 16, marginBottom: 16 },
  selectedDoctor: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  doctorSpecialty: { fontSize: 14, color: '#007AFF', marginBottom: 2 },
  doctorOffice: { fontSize: 14, color: '#888' },
  noDoctorSelected: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  noDoctorText: { fontSize: 16, color: '#888', flex: 1, marginLeft: 12 },
  addDoctorButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#181818', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#007AFF' },
  addDoctorButtonText: { fontSize: 16, color: '#007AFF', marginLeft: 8 },
  sectionsSection: { marginBottom: 32 },
  sectionCard: { backgroundColor: '#181818', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  selectedSection: { borderColor: '#007AFF', backgroundColor: '#0A1929' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sectionText: { marginLeft: 12, flex: 1 },
  sectionLabel: { fontSize: 16, color: '#fff', fontWeight: '500' },
  selectedSectionText: { color: '#007AFF' },
  sectionCount: { fontSize: 12, color: '#888', marginTop: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#555', alignItems: 'center', justifyContent: 'center' },
  checkedBox: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  shareSection: { marginBottom: 32 },
  shareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 16, gap: 8 },
  disabledButton: { backgroundColor: '#3A3A3C' },
  shareButtonText: { fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 8 },
  modalContainer: { flex: 1, backgroundColor: '#1C1C1E' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  cancelButton: { fontSize: 16, color: '#007AFF' },
  saveButton: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  modalContent: { flex: 1, padding: 20 },
  doctorCountText: { fontSize: 14, color: '#888', marginBottom: 16 },
  doctorOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', borderRadius: 12, padding: 16, marginBottom: 12 },
  doctorOptionInfo: { flex: 1 },
  doctorOptionName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  doctorOptionSpecialty: { fontSize: 14, color: '#007AFF', marginBottom: 2 },
  doctorOptionOffice: { fontSize: 12, color: '#888' },
  noDoctorsState: { alignItems: 'center', paddingVertical: 60 },
  noDoctorsTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginTop: 16, marginBottom: 8 },
  noDoctorsSubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
  addFromDoctorsButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  addFromDoctorsButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#888', marginBottom: 8 },
  textInput: { backgroundColor: '#2C2C2E', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#fff' },
  textArea: { height: 80, textAlignVertical: 'top' },
});

export default ShareWithDoctorScreen;
