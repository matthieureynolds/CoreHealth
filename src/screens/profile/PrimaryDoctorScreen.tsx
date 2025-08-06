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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useHealthData } from '../../context/HealthDataContext';
import { ProfileTabParamList } from '../../types';

type PrimaryDoctorScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

interface PrimaryDoctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email?: string;
  office: string;
  address?: string;
  notes?: string;
}

const PrimaryDoctorScreen: React.FC = () => {
  const navigation = useNavigation<PrimaryDoctorScreenNavigationProp>();
  const { profile, updateProfile } = useHealthData();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<PrimaryDoctor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    office: '',
    address: '',
    notes: '',
  });

  const primaryDoctor = profile?.primaryDoctor;

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

  const handleEdit = () => {
    if (primaryDoctor) {
      setFormData({
        name: primaryDoctor.name || '',
        specialty: primaryDoctor.specialty || '',
        phone: primaryDoctor.phone || '',
        email: primaryDoctor.email || '',
        office: primaryDoctor.office || '',
        address: primaryDoctor.address || '',
        notes: primaryDoctor.notes || '',
      });
      setEditingDoctor(primaryDoctor);
      setModalVisible(true);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter the doctor\'s name');
      return;
    }

    if (!formData.specialty.trim()) {
      Alert.alert('Error', 'Please enter the doctor\'s specialty');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter the doctor\'s phone number');
      return;
    }

    const doctorData: PrimaryDoctor = {
      id: editingDoctor?.id || Date.now().toString(),
      name: formData.name.trim(),
      specialty: formData.specialty.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      office: formData.office.trim(),
      address: formData.address.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    if (profile) {
      updateProfile({
        ...profile,
        primaryDoctor: doctorData,
      });
    }

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

  const handleDelete = () => {
    Alert.alert(
      'Delete Primary Doctor',
      'Are you sure you want to remove your primary doctor information?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (profile) {
              updateProfile({
                ...profile,
                primaryDoctor: undefined,
              });
            }
          },
        },
      ]
    );
  };

  const handleCall = () => {
    if (primaryDoctor?.phone) {
      // In a real app, you would use Linking to make the call
      Alert.alert('Call Doctor', `Call ${primaryDoctor.name} at ${primaryDoctor.phone}?`);
    }
  };

  const handleEmail = () => {
    if (primaryDoctor?.email) {
      // In a real app, you would use Linking to send email
      Alert.alert('Email Doctor', `Send email to ${primaryDoctor.email}?`);
    }
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
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Primary Doctor</Text>
            <Text style={styles.headerSubtitle}>Manage your doctor information</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!primaryDoctor ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name="medical-outline" 
              size={64} 
              color="#007AFF" 
              style={{ opacity: 0.3 }}
            />
            <Text style={styles.emptyStateTitle}>No Primary Doctor Set</Text>
            <Text style={styles.emptyStateText}>
              Add your primary doctor information for quick access during emergencies
            </Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAdd}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Primary Doctor</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.doctorCard}>
            <View style={styles.doctorHeader}>
              <View style={styles.doctorIcon}>
                <Ionicons name="medical-outline" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{primaryDoctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{primaryDoctor.specialty}</Text>
              </View>
            </View>

            <View style={styles.contactActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleCall}
              >
                <Ionicons name="call-outline" size={20} color="#4CD964" />
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
              
              {primaryDoctor.email && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleEmail}
                >
                  <Ionicons name="mail-outline" size={20} color="#007AFF" />
                  <Text style={styles.actionText}>Email</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailText}>{primaryDoctor.phone}</Text>
              </View>
              
              {primaryDoctor.email && (
                <View style={styles.detailRow}>
                  <Ionicons name="mail-outline" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>{primaryDoctor.email}</Text>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Ionicons name="business-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailText}>{primaryDoctor.office}</Text>
              </View>
              
              {primaryDoctor.address && (
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>{primaryDoctor.address}</Text>
                </View>
              )}
              
              {primaryDoctor.notes && (
                <View style={styles.detailRow}>
                  <Ionicons name="document-text-outline" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>{primaryDoctor.notes}</Text>
                </View>
              )}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEdit}
              >
                <Ionicons name="create-outline" size={20} color="#007AFF" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
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
              <Text style={styles.modalTitle}>
                {editingDoctor ? 'Edit' : 'Add'} Primary Doctor
              </Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Doctor Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter doctor's name"
                placeholderTextColor="#8E8E93"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              
              <Text style={styles.inputLabel}>Specialty *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Family Medicine, Cardiology"
                placeholderTextColor="#8E8E93"
                value={formData.specialty}
                onChangeText={(text) => setFormData({ ...formData, specialty: text })}
              />
              
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor="#8E8E93"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
              
              <Text style={styles.inputLabel}>Email (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor="#8E8E93"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
              />
              
              <Text style={styles.inputLabel}>Office Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., City Medical Center"
                placeholderTextColor="#8E8E93"
                value={formData.office}
                onChangeText={(text) => setFormData({ ...formData, office: text })}
              />
              
              <Text style={styles.inputLabel}>Office Address (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter office address"
                placeholderTextColor="#8E8E93"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
              />
              
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
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
    paddingTop: 32,
    paddingBottom: 16,
    backgroundColor: '#1C1C1E',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    borderColor: '#2C2C2E',
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  doctorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
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
  contactActions: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 6,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 6,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B30',
    marginLeft: 6,
  },
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
});

export default PrimaryDoctorScreen; 