import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Linking,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Contacts from 'expo-contacts';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { ProfileTabParamList, Doctor } from '../../../../../../shared/types';
import DoctorsHeader from './components/DoctorsHeader';
import DoctorCard from './components/DoctorCard';
import DoctorFormModal from './components/DoctorFormModal';

type PrimaryDoctorScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

type DoctorFormData = {
  name: string;
  specialty: string;
  phone: string;
  email: string;
  office: string;
  address: string;
  notes: string;
};

const EMPTY_FORM: DoctorFormData = {
  name: '', specialty: '', phone: '', email: '', office: '', address: '', notes: '',
};

const PrimaryDoctorScreen: React.FC = () => {
  const navigation = useNavigation<PrimaryDoctorScreenNavigationProp>();
  const { profile, updateProfile } = useHealthData();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<DoctorFormData>(EMPTY_FORM);
  const [addOptionsVisible, setAddOptionsVisible] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState<{ id: string; name: string; phoneNumbers: Contacts.PhoneNumber[]; emails: Contacts.Email[] }[]>([]);
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);

  const doctors = profile?.doctors || [];

  const showAddOptions = () => setAddOptionsVisible(true);

  const handleAdd = () => {
    setAddOptionsVisible(false);
    setFormData(EMPTY_FORM);
    setEditingDoctor(null);
    setModalVisible(true);
  };

  const handleImportFromContacts = async () => {
    setAddOptionsVisible(false);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant contacts permission to import from your device.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]);
        return;
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
        sort: Contacts.SortTypes.FirstName,
      });
      const filtered = data
        .filter(c => c.phoneNumbers?.length)
        .map(c => ({ id: c.id, name: c.name || 'Unknown', phoneNumbers: c.phoneNumbers || [], emails: c.emails || [] }));
      if (filtered.length) {
        setDeviceContacts(filtered);
        setSelectionModalVisible(true);
      } else {
        Alert.alert('No Contacts', 'No contacts with phone numbers found.');
      }
    } catch {
      Alert.alert('Error', 'Failed to load contacts from your device.');
    }
  };

  const applyDeviceContact = (c: { name: string; phoneNumbers: Contacts.PhoneNumber[]; emails: Contacts.Email[] }) => {
    setFormData({
      name: c.name,
      specialty: '',
      phone: c.phoneNumbers[0]?.number || '',
      email: c.emails[0]?.email || '',
      office: '',
      address: '',
      notes: '',
    });
    setEditingDoctor(null);
    setSelectionModalVisible(false);
    setModalVisible(true);
  };

  const handleEdit = (doctor: Doctor) => {
    setFormData({
      name: doctor.name || '',
      specialty: doctor.specialty || '',
      phone: doctor.phone || '',
      email: doctor.email || '',
      office: doctor.office || '',
      address: doctor.address || '',
      notes: doctor.notes || '',
    });
    setEditingDoctor(doctor);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', "Please enter the doctor's name");
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', "Please enter the doctor's phone number");
      return;
    }

    const doctorData: Doctor = {
      id: editingDoctor?.id || Date.now().toString(),
      name: formData.name.trim(),
      specialty: formData.specialty.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || '',
      office: formData.office.trim(),
      address: formData.address.trim() || '',
      notes: formData.notes.trim() || '',
      isRegistered: editingDoctor?.isRegistered || false,
    };

    const updatedDoctors = editingDoctor
      ? doctors.map(doc => (doc.id === editingDoctor.id ? doctorData : doc))
      : [...doctors, doctorData];

    updateProfile({ ...profile, doctors: updatedDoctors });
    setModalVisible(false);
    setFormData(EMPTY_FORM);
  };

  const handleDelete = (doctorId: string) => {
    Alert.alert('Delete Doctor', 'Are you sure you want to remove this doctor?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          updateProfile({ ...profile, doctors: doctors.filter(doc => doc.id !== doctorId) });
        },
      },
    ]);
  };

  const handleCall = (doctor: Doctor) => {
    if (doctor?.phone) {
      Alert.alert('Call Doctor', `Call ${doctor.name} at ${doctor.phone}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${doctor.phone.replace(/\s/g, '')}`) },
      ]);
    }
  };

  const handleEmail = (doctor: Doctor) => {
    if (doctor?.email) {
      Alert.alert('Email Doctor', `Send email to ${doctor.email}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email', onPress: () => Linking.openURL(`mailto:${doctor.email}`) },
      ]);
    }
  };

  const openDoctorOptions = (doctor: Doctor) => {
    Alert.alert(doctor.name, undefined, [
      { text: 'Edit', onPress: () => handleEdit(doctor) },
      { text: 'Delete', style: 'destructive', onPress: () => handleDelete(doctor.id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleChangeField = (field: keyof DoctorFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <DoctorsHeader onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 95 }}>
        {doctors.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={64} color="#3AABF0" style={{ opacity: 0.3 }} />
            <Text style={styles.emptyStateTitle}>No Doctors Added</Text>
            <Text style={styles.emptyStateText}>
              Add your doctors for quick access during emergencies
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={showAddOptions}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Doctor</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onCall={handleCall}
                onEmail={handleEmail}
                onOptions={openDoctorOptions}
              />
            ))}
            <TouchableOpacity style={styles.addMoreButton} onPress={showAddOptions}>
              <Ionicons name="add" size={20} color="#3AABF0" />
              <Text style={styles.addMoreButtonText}>Add Another Doctor</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <DoctorFormModal
        visible={modalVisible}
        isEditing={!!editingDoctor}
        formData={formData}
        onChangeField={handleChangeField}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />

      {/* Add Options Modal */}
      <Modal visible={addOptionsVisible} transparent animationType="fade" onRequestClose={() => setAddOptionsVisible(false)}>
        <TouchableOpacity style={styles.optionsOverlay} activeOpacity={1} onPress={() => setAddOptionsVisible(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.optionsSheet}>
            <View style={styles.optionsHeader}>
              <TouchableOpacity onPress={() => setAddOptionsVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={20} color="#FF3B30" />
              </TouchableOpacity>
              <Text style={styles.optionsTitle}>Add Doctor</Text>
              <View style={{ width: 20 }} />
            </View>
            <TouchableOpacity style={styles.optionRow} onPress={handleImportFromContacts}>
              <Ionicons name="people-outline" size={20} color="#AF52DE" />
              <Text style={styles.optionRowText}>Import from Contacts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionRow} onPress={handleAdd}>
              <Ionicons name="create-outline" size={20} color="#FF9500" />
              <Text style={styles.optionRowText}>Add Manually</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Device Contact Selection Modal */}
      <Modal visible={selectionModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.selectionContainer}>
          <View style={styles.selectionHeader}>
            <TouchableOpacity onPress={() => setSelectionModalVisible(false)}>
              <Text style={styles.selectionCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.selectionTitle}>Select Contact</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {deviceContacts.map(c => (
              <TouchableOpacity key={c.id} style={styles.contactSelectRow} onPress={() => applyDeviceContact(c)}>
                <View style={styles.contactSelectInfo}>
                  <Text style={styles.contactSelectName}>{c.name}</Text>
                  <Text style={styles.contactSelectMeta}>{c.phoneNumbers[0]?.number || 'No phone'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3AABF0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  addMoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3AABF0',
    marginLeft: 8,
  },
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  optionsSheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 44,
  },
  optionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 8,
  },
  optionRowText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 14,
  },
  selectionContainer: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectionCancelText: {
    fontSize: 16,
    color: '#3AABF0',
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  contactSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  contactSelectInfo: {
    flex: 1,
  },
  contactSelectName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 2,
  },
  contactSelectMeta: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default PrimaryDoctorScreen;
