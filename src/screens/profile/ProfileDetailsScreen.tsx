import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { ProfileTabParamList } from '../../types';

type ProfileDetailsScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const ProfileDetailsScreen: React.FC = () => {
  const navigation = useNavigation<ProfileDetailsScreenNavigationProp>();
  const { user } = useAuth();
  const { profile, updateProfile } = useHealthData();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Picker options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Personal Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>PERSONAL INFO</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('EditName')}>
          <Ionicons name="person-outline" size={22} color="#FF9500" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Name</Text>
          <Text style={styles.cardValue}>
            {user?.firstName && user?.surname 
              ? `${user.firstName} ${user.surname}` 
              : user?.displayName || 'Not set'}
            </Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={22} color="#4CD964" style={styles.cardIcon} />
                          <Text style={styles.cardLabel}>Date of Birth</Text>
          <Text style={styles.cardValue}>{profile?.age ? `${profile.age} years old` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => setShowGenderPicker(true)}>
          <Ionicons name="body-outline" size={22} color="#007AFF" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Gender</Text>
          <Text style={styles.cardValue}>{profile?.gender ? genderOptions.find(opt => opt.value === profile.gender)?.label || profile.gender : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('EditPhysicalStats')}>
          <Ionicons name="fitness-outline" size={22} color="#FF3B30" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Physical Stats</Text>
          <Text style={styles.cardValue}>{profile ? `${profile.height}cm, ${profile.weight}kg` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('HealthIDs')}>
          <Ionicons name="card-outline" size={22} color="#8E44AD" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Linked Health ID</Text>
          <Text style={styles.cardValue}>{profile?.healthIDs?.length ? `${profile.healthIDs.length} IDs` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Health Records Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>HEALTH RECORDS</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('Conditions')}>
          <Ionicons name="medical-outline" size={22} color="#FF9500" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Conditions</Text>
          <Text style={styles.cardValue}>{profile?.medicalHistory?.length ? `${profile.medicalHistory.length} conditions` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('Medications')}>
          <Ionicons name="medical-outline" size={22} color="#4CD964" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Medications</Text>
          <Text style={styles.cardValue}>{profile?.medications?.length ? `${profile.medications.length} medications` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('Allergies')}>
          <Ionicons name="warning-outline" size={22} color="#FFD93D" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Allergies</Text>
          <Text style={styles.cardValue}>{profile?.allergies?.length ? `${profile.allergies.length} allergies` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('FamilyHistory')}>
          <Ionicons name="people-outline" size={22} color="#4ECDC4" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Family History</Text>
          <Text style={styles.cardValue}>{profile?.familyHistory?.length ? `${profile.familyHistory.length} conditions` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('Vaccinations')}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#6BCF7F" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Vaccinations</Text>
          <Text style={styles.cardValue}>{profile?.vaccinations?.length ? `${profile.vaccinations.length} vaccines` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('Screenings')}>
          <Ionicons name="search-outline" size={22} color="#007AFF" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Screenings</Text>
          <Text style={styles.cardValue}>{profile?.screenings?.length ? `${profile.screenings.length} screenings` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>



      {/* Record Management Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>RECORD MANAGEMENT</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('UploadMedicalRecord')}>
          <Ionicons name="camera-outline" size={22} color="#FF6B6B" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Upload Medical Record</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('ViewMedicalRecords')}>
          <Ionicons name="folder-outline" size={22} color="#4ECDC4" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>View Medical Records</Text>
          <Text style={styles.cardValue}>{profile?.medicalRecords?.length ? `${profile.medicalRecords.length} records` : 'No records'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('GenerateHealthReport')}>
          <Ionicons name="document-text-outline" size={22} color="#45B7D1" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Generate Health Report</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('ShareWithDoctor')}>
          <Ionicons name="share-outline" size={22} color="#FF9500" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Share with Doctor</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Emergency Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>EMERGENCY INFO</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('EmergencyContacts')}>
          <Ionicons name="call-outline" size={22} color="#FF3B30" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Emergency Contacts</Text>
          <Text style={styles.cardValue}>
            {profile?.emergencyContacts && profile.emergencyContacts.length > 0 
              ? `${profile.emergencyContacts.length} contact${profile.emergencyContacts.length > 1 ? 's' : ''}` 
              : 'Not set'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('PrimaryDoctor')}>
          <Ionicons name="medical-outline" size={22} color="#007AFF" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Doctors</Text>
          <Text style={styles.cardValue}>
            {profile?.doctors && profile.doctors.length > 0 
              ? `${profile.doctors.length} doctor${profile.doctors.length > 1 ? 's' : ''}` 
              : 'Not set'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Date of Birth Picker */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={profile?.birthDate ? new Date(profile.birthDate) : new Date()}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              style={styles.datePicker}
              textColor="#fff"
              themeVariant="dark"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  const today = new Date();
                  const birthDate = new Date(selectedDate);
                  let age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                  }
                  if (age >= 1 && age <= 150) {
                    try {
                      updateProfile({
                        ...profile,
                        age,
                        birthDate: selectedDate.toISOString(),
                      });
                      // Removed setShowDatePicker(false) here
                    } catch (error) {
                      console.error('Error updating birth date:', error);
                      Alert.alert('Error', 'Failed to save date of birth. Please try again.');
                    }
                  } else {
                    Alert.alert('Error', 'Please select a valid date of birth');
                  }
                }
              }}
            />
            <TouchableOpacity
              style={styles.datePickerSaveButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.datePickerSaveButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Gender Picker */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Gender</Text>
              <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                <Ionicons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.ethnicityPickerOptions} showsVerticalScrollIndicator={false}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.ethnicityPickerOption}
          onPress={() => {
                    try {
                      updateProfile({
                        ...profile,
                        gender: option.value as 'male' | 'female',
                      });
                      setShowGenderPicker(false);
                    } catch (error) {
                      console.error('Error updating gender:', error);
                      Alert.alert('Error', 'Failed to update gender. Please try again.');
                    }
                  }}
                >
                  <Text style={styles.ethnicityPickerOptionText}>{option.label}</Text>
                  {profile?.gender === option.value && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
      </View>
      </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#222',
    paddingVertical: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileEmail: {
    color: '#aaa',
    fontSize: 15,
    marginBottom: 0,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  editProfileText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#181818',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    color: '#888',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  cardIcon: {
    marginRight: 16,
  },
  cardLabel: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  cardValue: {
    color: '#aaa',
    fontSize: 15,
    marginRight: 8,
  },
  chevron: {
    marginLeft: 8,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  pickerContainer: {
    backgroundColor: '#181818',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  pickerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerOptions: {
    maxHeight: 400,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  pickerOptionText: {
    color: '#fff',
    fontSize: 16,
  },
  wheelPickerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  wheelPicker: {
    backgroundColor: 'transparent',
    color: '#fff',
    width: 200,
    height: 150,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  datePickerContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    minWidth: 300,
    maxWidth: 350,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  datePicker: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 12,
    padding: 10,
  },
  datePickerSaveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
    alignItems: 'center',
  },
  datePickerSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ethnicityPickerOptions: {
    maxHeight: 300,
  },
  ethnicityPickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  ethnicityPickerOptionText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
});

export default ProfileDetailsScreen; 