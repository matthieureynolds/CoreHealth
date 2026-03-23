import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { ProfileTabParamList, Doctor } from '../../../../../../shared/types';

type PrimaryDoctorScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const PrimaryDoctorScreen: React.FC = () => {
  const navigation = useNavigation<PrimaryDoctorScreenNavigationProp>();
  const { profile, updateProfile } = useHealthData();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    office: '',
    address: '',
    notes: '',
  });

  const doctors = profile?.doctors || [];

  const handleAdd = () => {
    setFormData({
      name: '',
      specialty: '',
      phone: '',
      email: '',
      office: '',
      address: '',
      notes: '',
    });
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
      Alert.alert('Error', 'Please enter the doctor\'s name');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter the doctor\'s phone number');
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

    let updatedDoctors: Doctor[];
    if (editingDoctor) {
      // Update existing doctor
      updatedDoctors = doctors.map(doc => 
        doc.id === editingDoctor.id ? doctorData : doc
      );
    } else {
      // Add new doctor
      updatedDoctors = [...doctors, doctorData];
    }

    updateProfile({
      ...profile,
      doctors: updatedDoctors,
    });

    setModalVisible(false);
    setFormData({
      name: '',
      specialty: '',
      phone: '',
      email: '',
      office: '',
      address: '',
      notes: '',
    });
  };

  const handleDelete = (doctorId: string) => {
    Alert.alert(
      'Delete Doctor',
      'Are you sure you want to remove this doctor?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedDoctors = doctors.filter(doc => doc.id !== doctorId);
            updateProfile({
              ...profile,
              doctors: updatedDoctors,
            });
          },
        },
      ]
    );
  };

  const handleCall = (doctor: Doctor) => {
    if (doctor?.phone) {
      Alert.alert(
        'Call Doctor',
        `Call ${doctor.name} at ${doctor.phone}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call',
            onPress: () => {
              const phoneNumber = doctor.phone.replace(/\s/g, '');
              Linking.openURL(`tel:${phoneNumber}`);
            },
          },
        ]
      );
    }
  };

  const handleEmail = (doctor: Doctor) => {
    if (doctor?.email) {
      Alert.alert(
        'Email Doctor',
        `Send email to ${doctor.email}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Email',
            onPress: () => {
              Linking.openURL(`mailto:${doctor.email}`);
            },
          },
        ]
      );
    }
  };

  const openDoctorOptions = (doctor: Doctor) => {
    Alert.alert(
      doctor.name,
      undefined,
      [
        { text: 'Edit', onPress: () => handleEdit(doctor) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(doctor.id) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Doctors</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {doctors.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name="medical-outline" 
              size={64} 
              color="#007AFF" 
              style={{ opacity: 0.3 }}
            />
            <Text style={styles.emptyStateTitle}>No Doctors Added</Text>
            <Text style={styles.emptyStateText}>
              Add your doctors for quick access during emergencies
            </Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAdd}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Doctor</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {doctors.map((doctor) => (
              <View key={doctor.id} style={styles.doctorCard}>
                <View style={styles.doctorHeader}>
                  <View style={styles.headerLeft}>
                    <View style={styles.doctorIcon}>
                      <Ionicons name="medical-outline" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>{doctor.name}</Text>
                      <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                      {!!doctor.office && (
                        <Text style={styles.doctorOffice}>{doctor.office}</Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.moreButton, { position: 'absolute', top: 6, right: 6 }]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={() => openDoctorOptions(doctor)}
                    accessibilityLabel="Edit doctor"
                  >
                    <Feather name="edit-2" size={18} color="#007AFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.contactActions}>
                  <TouchableOpacity 
                    style={styles.actionChipPrimary}
                    onPress={() => handleCall(doctor)}
                  >
                    <Ionicons name="call-outline" size={18} color="#007AFF" />
                    <Text style={styles.actionChipPrimaryText}>Call</Text>
                  </TouchableOpacity>
                  {doctor.email && (
                    <TouchableOpacity 
                      style={styles.actionChip}
                      onPress={() => handleEmail(doctor)}
                    >
                      <Ionicons name="mail-outline" size={18} color="#007AFF" />
                      <Text style={styles.actionChipText}>Email</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={16} color="#8E8E93" />
                    <Text style={styles.detailText}>{doctor.phone}</Text>
                  </View>
                  {doctor.email && (
                    <View style={styles.detailRow}>
                      <Ionicons name="mail-outline" size={16} color="#8E8E93" />
                      <Text style={styles.detailText}>{doctor.email}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Ionicons name="business-outline" size={16} color="#8E8E93" />
                    <Text style={styles.detailText}>{doctor.office}</Text>
                  </View>
                  {doctor.address && (
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={16} color="#8E8E93" />
                      <Text style={styles.detailText}>{doctor.address}</Text>
                    </View>
                  )}
                  {doctor.notes && (
                    <View style={styles.detailRow}>
                      <Ionicons name="document-text-outline" size={16} color="#8E8E93" />
                      <Text style={styles.detailText}>{doctor.notes}</Text>
                    </View>
                  )}
                </View>

                {/* Bottom action buttons removed as requested */}
              </View>
            ))}
            
            <TouchableOpacity 
              style={styles.addMoreButton}
              onPress={handleAdd}
            >
              <Ionicons name="add" size={20} color="#007AFF" />
              <Text style={styles.addMoreButtonText}>Add Another Doctor</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4, opacity: 0 }}>
                <Ionicons name="close" size={24} color="#FF3B30" />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { textAlign: 'center', flex: 1 }]}>
                {editingDoctor ? 'Edit' : 'Add'} Primary Doctor
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  console.log('Close button pressed - Primary Doctor Modal');
                  setModalVisible(false);
                }}
                style={styles.closeButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Doctor Name: *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter doctor's name"
                placeholderTextColor="#8E8E93"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              
              <Text style={styles.inputLabel}>Specialty: *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Family Medicine, Cardiology"
                placeholderTextColor="#8E8E93"
                value={formData.specialty}
                onChangeText={(text) => setFormData({ ...formData, specialty: text })}
              />
              
              <Text style={styles.inputLabel}>Phone Number: *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor="#8E8E93"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
              
              <Text style={styles.inputLabel}>Email: (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor="#8E8E93"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
              />
              
              <Text style={styles.inputLabel}>Office Name: *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., City Medical Center"
                placeholderTextColor="#8E8E93"
                value={formData.office}
                onChangeText={(text) => setFormData({ ...formData, office: text })}
              />
              
              <Text style={styles.inputLabel}>Office Address: (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter office address"
                placeholderTextColor="#8E8E93"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
              />
              
              <Text style={styles.inputLabel}>Notes: (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Add any additional notes..."
                placeholderTextColor="#8E8E93"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  header: {
    paddingTop: 72,
    paddingBottom: 5,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    left: 20,
    top: -42.3,
    zIndex: 1,
  },
  headerText: {
    flex: 1,
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
    top: -51.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
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
  doctorCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0A84FF33',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doctorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A84FF14',
    borderWidth: 1,
    borderColor: '#0A84FF33',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#8E8E93',
  },
  doctorOffice: {
    fontSize: 13,
    color: '#A0A0A0',
    marginTop: 2,
  },
  moreButton: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  contactActions: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    flex: 1,
  },
  actionChipText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionChipPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    flex: 1,
  },
  actionChipPrimaryText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  // Bottom action buttons removed
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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