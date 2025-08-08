import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { Doctor } from '../../types';

const ShareWithDoctorScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { profile, updateProfile } = useHealthData();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'personal_info',
    'medical_conditions',
    'medications',
    'allergies',
    'family_history',
    'vaccinations',
    'screenings',
    'medical_records'
  ]);

  // New doctor form state
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    office: '',
    address: '',
    notes: '',
  });

  const reportSections = [
    { id: 'personal_info', label: 'Personal Information', icon: 'person-outline' },
    { id: 'medical_conditions', label: 'Medical Conditions', icon: 'medical-outline' },
    { id: 'medications', label: 'Medications', icon: 'medical-outline' },
    { id: 'allergies', label: 'Allergies', icon: 'warning-outline' },
    { id: 'family_history', label: 'Family History', icon: 'people-outline' },
    { id: 'vaccinations', label: 'Vaccinations', icon: 'shield-checkmark-outline' },
    { id: 'screenings', label: 'Screenings', icon: 'search-outline' },
    { id: 'medical_records', label: 'Medical Records', icon: 'folder-outline' },
  ];

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const addNewDoctor = () => {
    if (!newDoctor.name.trim() || !newDoctor.specialty.trim()) {
      Alert.alert('Error', 'Please enter doctor name and specialty');
      return;
    }

    const doctor: Doctor = {
      id: Date.now().toString(),
      name: newDoctor.name.trim(),
      specialty: newDoctor.specialty.trim(),
      phone: newDoctor.phone.trim(),
      email: newDoctor.email.trim(),
      office: newDoctor.office.trim(),
      address: newDoctor.address.trim(),
      notes: newDoctor.notes.trim(),
      isRegistered: false,
    };

    const updatedDoctors = [...(profile?.doctors || []), doctor];
    updateProfile({
      ...profile,
      doctors: updatedDoctors,
    });

    setSelectedDoctor(doctor);
    setShowAddDoctor(false);
    setNewDoctor({
      name: '',
      specialty: '',
      phone: '',
      email: '',
      office: '',
      address: '',
      notes: '',
    });

    Alert.alert('Success', 'Doctor added successfully');
  };

  const generateAndShareReport = async () => {
    if (!selectedDoctor) {
      Alert.alert('Error', 'Please select a doctor');
      return;
    }

    if (selectedSections.length === 0) {
      Alert.alert('Error', 'Please select at least one section to include in the report');
      return;
    }

    setIsGenerating(true);

    // Simulate report generation and sharing
    setTimeout(() => {
      setIsGenerating(false);
      Alert.alert(
        'Report Shared',
        `Health report has been generated and shared with Dr. ${selectedDoctor.name}`,
        [
          { text: 'View Report', onPress: () => viewReport() },
          { text: 'Share Again', onPress: () => shareAgain() },
          { text: 'OK', style: 'cancel' }
        ]
      );
    }, 3000);
  };

  const viewReport = () => {
    Alert.alert('View Report', 'PDF viewer would open here to display the shared report');
  };

  const shareAgain = () => {
    Alert.alert('Share Again', 'Share options would appear here (email, messaging, etc.)');
  };

  const getSectionCount = (sectionId: string) => {
    switch (sectionId) {
      case 'medical_conditions':
        return profile?.medicalHistory?.length || 0;
      case 'medications':
        return profile?.medications?.length || 0;
      case 'allergies':
        return profile?.allergies?.length || 0;
      case 'family_history':
        return profile?.familyHistory?.length || 0;
      case 'vaccinations':
        return profile?.vaccinations?.length || 0;
      case 'screenings':
        return profile?.screenings?.length || 0;
      case 'medical_records':
        return profile?.medicalRecords?.length || 0;
      default:
        return 0;
    }
  };

  const getSectionIcon = (iconName: string) => {
    return iconName as any;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share with Doctor</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Doctor Selection */}
          <View style={styles.doctorSection}>
            <Text style={styles.sectionTitle}>Select Doctor</Text>
            <Text style={styles.sectionSubtitle}>
              Choose a registered doctor or add a new one
            </Text>

            <TouchableOpacity
              style={styles.doctorCard}
              onPress={() => setShowDoctorPicker(true)}
            >
              {selectedDoctor ? (
                <View style={styles.selectedDoctor}>
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>Dr. {selectedDoctor.name}</Text>
                    <Text style={styles.doctorSpecialty}>{selectedDoctor.specialty}</Text>
                    {selectedDoctor.office && (
                      <Text style={styles.doctorOffice}>{selectedDoctor.office}</Text>
                    )}
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

            <TouchableOpacity
              style={styles.addDoctorButton}
              onPress={() => setShowAddDoctor(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.addDoctorButtonText}>Add New Doctor</Text>
            </TouchableOpacity>
          </View>

          {/* Report Sections */}
          <View style={styles.sectionsSection}>
            <Text style={styles.sectionTitle}>Select Information to Share</Text>
            <Text style={styles.sectionSubtitle}>
              Choose which health information to include in the report
            </Text>

            {reportSections.map((section) => (
              <TouchableOpacity
                key={section.id}
                style={[
                  styles.sectionCard,
                  selectedSections.includes(section.id) && styles.selectedSection
                ]}
                onPress={() => toggleSection(section.id)}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionInfo}>
                    <Ionicons 
                      name={getSectionIcon(section.icon)} 
                      size={24} 
                      color={selectedSections.includes(section.id) ? '#007AFF' : '#888'} 
                    />
                    <View style={styles.sectionText}>
                      <Text style={[
                        styles.sectionLabel,
                        selectedSections.includes(section.id) && styles.selectedSectionText
                      ]}>
                        {section.label}
                      </Text>
                      {section.id !== 'personal_info' && (
                        <Text style={styles.sectionCount}>
                          {getSectionCount(section.id)} items
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={[
                    styles.checkbox,
                    selectedSections.includes(section.id) && styles.checkedBox
                  ]}>
                    {selectedSections.includes(section.id) && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Generate and Share Button */}
          <View style={styles.shareSection}>
            <TouchableOpacity
              style={[
                styles.shareButton,
                (!selectedDoctor || selectedSections.length === 0) && styles.disabledButton
              ]}
              onPress={generateAndShareReport}
              disabled={!selectedDoctor || selectedSections.length === 0 || isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="share-outline" size={20} color="#fff" />
              )}
              <Text style={styles.shareButtonText}>
                {isGenerating ? 'Generating & Sharing...' : 'Generate & Share Report'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Report Preview */}
          {selectedDoctor && (
            <View style={styles.previewSection}>
              <Text style={styles.previewTitle}>Report Preview</Text>
              <View style={styles.previewCard}>
                <Text style={styles.previewHeader}>CoreHealth Health Report</Text>
                <Text style={styles.previewDate}>
                  Generated on {new Date().toLocaleDateString()}
                </Text>
                <Text style={styles.previewPatient}>
                  Patient: {user?.displayName || 'User'}
                </Text>
                <Text style={styles.previewDoctor}>
                  Shared with: Dr. {selectedDoctor.name} ({selectedDoctor.specialty})
                </Text>
                <View style={styles.previewSections}>
                  <Text style={styles.previewSectionsTitle}>Included Sections:</Text>
                  {selectedSections.map(sectionId => {
                    const section = reportSections.find(s => s.id === sectionId);
                    return (
                      <Text key={sectionId} style={styles.previewSectionItem}>
                        • {section?.label}
                      </Text>
                    );
                  })}
                </View>
                <Text style={styles.previewNote}>
                  This report contains confidential health information shared with your healthcare provider.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Doctor Picker Modal */}
      <Modal
        visible={showDoctorPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDoctorPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDoctorPicker(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Doctor</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {profile?.doctors && profile.doctors.length > 0 ? (
              <>
                <Text style={styles.doctorCountText}>
                  {profile.doctors.length} doctor{profile.doctors.length > 1 ? 's' : ''} available
                </Text>
                {profile.doctors.map((doctor) => (
                  <TouchableOpacity
                    key={doctor.id}
                    style={styles.doctorOption}
                    onPress={() => {
                      setSelectedDoctor(doctor);
                      setShowDoctorPicker(false);
                    }}
                  >
                    <View style={styles.doctorOptionInfo}>
                      <Text style={styles.doctorOptionName}>Dr. {doctor.name}</Text>
                      <Text style={styles.doctorOptionSpecialty}>{doctor.specialty}</Text>
                      {doctor.office && (
                        <Text style={styles.doctorOptionOffice}>{doctor.office}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#888" />
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={styles.noDoctorsState}>
                <Ionicons name="people-outline" size={48} color="#666" />
                <Text style={styles.noDoctorsTitle}>No Doctors Added</Text>
                <Text style={styles.noDoctorsSubtitle}>
                  Add a doctor in the "Doctors" tab first, or add a new doctor here
                </Text>
                <TouchableOpacity
                  style={styles.addFromDoctorsButton}
                  onPress={() => {
                    setShowDoctorPicker(false);
                    setShowAddDoctor(true);
                  }}
                >
                  <Text style={styles.addFromDoctorsButtonText}>Add New Doctor</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Add Doctor Modal */}
      <Modal
        visible={showAddDoctor}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddDoctor(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddDoctor(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Doctor</Text>
            <TouchableOpacity onPress={addNewDoctor}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Doctor Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newDoctor.name}
                onChangeText={(text) => setNewDoctor({...newDoctor, name: text})}
                placeholder="e.g., John Smith"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Specialty *</Text>
              <TextInput
                style={styles.textInput}
                value={newDoctor.specialty}
                onChangeText={(text) => setNewDoctor({...newDoctor, specialty: text})}
                placeholder="e.g., Cardiology, General Practice"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={newDoctor.phone}
                onChangeText={(text) => setNewDoctor({...newDoctor, phone: text})}
                placeholder="e.g., +1 (555) 123-4567"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={newDoctor.email}
                onChangeText={(text) => setNewDoctor({...newDoctor, email: text})}
                placeholder="e.g., doctor@hospital.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Office/Hospital</Text>
              <TextInput
                style={styles.textInput}
                value={newDoctor.office}
                onChangeText={(text) => setNewDoctor({...newDoctor, office: text})}
                placeholder="e.g., City General Hospital"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.textInput}
                value={newDoctor.address}
                onChangeText={(text) => setNewDoctor({...newDoctor, address: text})}
                placeholder="e.g., 123 Medical Center Dr"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newDoctor.notes}
                onChangeText={(text) => setNewDoctor({...newDoctor, notes: text})}
                placeholder="Add any additional notes about this doctor"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  content: {
    padding: 20,
  },
  doctorSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  doctorCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  selectedDoctor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  doctorOffice: {
    fontSize: 14,
    color: '#888',
  },
  noDoctorSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noDoctorText: {
    fontSize: 16,
    color: '#888',
    flex: 1,
    marginLeft: 12,
  },
  addDoctorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF20',
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addDoctorButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  sectionsSection: {
    marginBottom: 32,
  },
  sectionCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedSection: {
    backgroundColor: '#007AFF20',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionText: {
    marginLeft: 12,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  selectedSectionText: {
    color: '#007AFF',
  },
  sectionCount: {
    fontSize: 14,
    color: '#888',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  shareSection: {
    marginBottom: 32,
  },
  shareButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  previewSection: {
    marginBottom: 32,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  previewCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 20,
  },
  previewHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  previewDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  previewPatient: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  previewDoctor: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 16,
  },
  previewSections: {
    marginBottom: 16,
  },
  previewSectionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  previewSectionItem: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
    marginLeft: 8,
  },
  previewNote: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
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
  doctorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  doctorOptionInfo: {
    flex: 1,
  },
  doctorOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  doctorOptionSpecialty: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  doctorOptionOffice: {
    fontSize: 14,
    color: '#888',
  },
  noDoctorsState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noDoctorsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  noDoctorsSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
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
  doctorCountText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  addFromDoctorsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  addFromDoctorsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ShareWithDoctorScreen; 