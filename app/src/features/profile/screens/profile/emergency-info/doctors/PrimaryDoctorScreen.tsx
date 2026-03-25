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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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

  const doctors = profile?.doctors || [];

  const handleAdd = () => {
    setFormData(EMPTY_FORM);
    setEditingDoctor(null);
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {doctors.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={64} color="#007AFF" style={{ opacity: 0.3 }} />
            <Text style={styles.emptyStateTitle}>No Doctors Added</Text>
            <Text style={styles.emptyStateText}>
              Add your doctors for quick access during emergencies
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
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
            <TouchableOpacity style={styles.addMoreButton} onPress={handleAdd}>
              <Ionicons name="add" size={20} color="#007AFF" />
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
    backgroundColor: '#007AFF',
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
    color: '#007AFF',
    marginLeft: 8,
  },
});

export default PrimaryDoctorScreen;
