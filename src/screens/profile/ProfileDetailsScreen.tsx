import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
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
  const [showEthnicityPicker, setShowEthnicityPicker] = useState(false);

  // Picker options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  const ethnicityOptions = [
    { value: 'east_asian', label: 'East Asian' },
    { value: 'south_asian', label: 'South Asian' },
    { value: 'southeast_asian', label: 'Southeast Asian' },
    { value: 'middle_eastern', label: 'Middle Eastern' },
    { value: 'north_african', label: 'North African' },
    { value: 'sub_saharan_african', label: 'Sub-Saharan African' },
    { value: 'european', label: 'European' },
    { value: 'latin_american', label: 'Latin American' },
    { value: 'caribbean', label: 'Caribbean' },
    { value: 'pacific_islander', label: 'Pacific Islander' },
    { value: 'indigenous_american', label: 'Indigenous American' },
    { value: 'mixed_heritage', label: 'Mixed Heritage' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
        <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {user && typeof (user as any).avatar === 'string' && (user as any).avatar.length > 0 ? (
            <Image source={{ uri: (user as any).avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{user?.displayName?.charAt(0) || 'U'}</Text>
            </View>
          )}
        </View>
        <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <TouchableOpacity style={styles.editProfileButton} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="create-outline" size={16} color="#007AFF" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

      {/* Personal Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>PERSONAL INFO</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('EditName')}>
          <Ionicons name="person-outline" size={22} color="#FF9500" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Name</Text>
          <Text style={styles.cardValue}>{user?.displayName || 'Not set'}</Text>
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
        <TouchableOpacity style={styles.cardRow} onPress={() => setShowEthnicityPicker(true)}>
          <Ionicons name="globe-outline" size={22} color="#6BCF7F" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Ethnicity</Text>
          <Text style={styles.cardValue}>{profile?.ethnicity ? ethnicityOptions.find(opt => opt.value === profile.ethnicity)?.label || profile.ethnicity : 'Not set'}</Text>
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
          <Text style={styles.cardLabel}>Emergency Contact</Text>
          <Text style={styles.cardValue}>{profile?.emergencyContact ? 'Set' : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('PrimaryDoctor')}>
          <Ionicons name="medical-outline" size={22} color="#007AFF" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Primary Doctor</Text>
          <Text style={styles.cardValue}>{profile?.primaryDoctor ? 'Set' : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Birthday Date Picker */}
      {showDatePicker && (
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
                              <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              style={styles.datePicker}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  // Calculate age from birth date
                  const today = new Date();
                  const birthDate = new Date(selectedDate);
                  const age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                  }

                  if (age >= 1 && age <= 150) {
                    updateProfile({
                      ...profile,
                      age,
                    });
                  } else {
                    Alert.alert('Error', 'Please select a valid date of birth');
                  }
                }
              }}
            />
          </View>
        </View>
      )}

      {/* Gender Picker */}
      {showGenderPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Gender</Text>
              <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                <Ionicons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.wheelPickerContainer}>
              <Picker
                selectedValue={profile?.gender || 'male'}
                style={styles.wheelPicker}
                onValueChange={(itemValue) => {
                  updateProfile({
                    ...profile,
                    gender: itemValue as 'male' | 'female',
                  });
                  setShowGenderPicker(false);
                }}
              >
                {genderOptions.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    color="#fff"
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      )}

      {/* Ethnicity Picker */}
      {showEthnicityPicker && (
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Ethnicity</Text>
              <TouchableOpacity onPress={() => setShowEthnicityPicker(false)}>
                <Ionicons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.ethnicityPickerOptions} showsVerticalScrollIndicator={false}>
              {ethnicityOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.ethnicityPickerOption}
          onPress={() => {
                    updateProfile({
                      ...profile,
                      ethnicity: option.value,
                    });
                    setShowEthnicityPicker(false);
                  }}
                >
                  <Text style={styles.ethnicityPickerOptionText}>{option.label}</Text>
                  {profile?.ethnicity === option.value && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
      </View>
      </View>
      )}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  datePickerContainer: {
    backgroundColor: '#181818',
    borderRadius: 20,
    padding: 20,
    minWidth: 300,
    maxWidth: 350,
    width: '100%',
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
    backgroundColor: 'transparent',
    color: '#fff',
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