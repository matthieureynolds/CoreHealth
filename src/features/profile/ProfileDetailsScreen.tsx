import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { calculateProfileCompletion } from '../../utils/profileCompletion';
import ProfilePicturePicker from '../../components/ProfilePicturePicker';
import { useHealthData } from '../../context/HealthDataContext';
import { ProfileTabParamList } from '../../types';

type ProfileDetailsScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const ProfileDetailsScreen: React.FC = () => {
  const navigation = useNavigation<ProfileDetailsScreenNavigationProp>();
  const { user, updateUserPhoto } = useAuth();
  const { profile, updateProfile } = useHealthData();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [tempBirthDate, setTempBirthDate] = useState<Date | null>(null);
  
  // Animated value for gender picker bottom sheet
  const genderPickerTranslateY = useRef(new Animated.Value(1000)).current;

  // Initialize tempBirthDate when picker opens
  useEffect(() => {
    if (showDatePicker) {
      setTempBirthDate(profile?.birthDate ? new Date(profile.birthDate) : new Date());
    } else {
      setTempBirthDate(null);
    }
  }, [showDatePicker, profile?.birthDate]);

  // Animate gender picker bottom sheet when opening/closing
  useEffect(() => {
    if (showGenderPicker) {
      // Start from off-screen and slide up
      genderPickerTranslateY.setValue(1000);
      Animated.spring(genderPickerTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      genderPickerTranslateY.setValue(0);
    }
  }, [showGenderPicker]);

  // Picker options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  const handlePhotoSelected = (photoURI: string) => {
    if (updateUserPhoto) {
      updateUserPhoto(photoURI);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Scrollable Profile Header (avatar, name) */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={() => navigation.navigate('CommunityLeaderboard' as never)} style={styles.headerCommunityButton}>
          <FontAwesome5 name="users" size={22} color="#0A84FF" solid />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)} style={styles.headerSettingsButton}>
          <Ionicons name="settings-sharp" size={24} color="#0A84FF" />
        </TouchableOpacity>
        <ProfilePicturePicker
          currentPhotoURL={user?.photoURL}
          onPhotoSelected={handlePhotoSelected}
          size={110}
          userInitial={user?.preferredName?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
          progressPercent={calculateProfileCompletion(user, profile)}
        />
        <Text style={[styles.profileName, { marginTop: 2 }]}> 
          {user?.firstName && user?.surname
            ? `${user.firstName} ${user.surname}`
            : user?.displayName || 'User'}
        </Text>
        <Text style={[styles.profileEmail, { marginTop: 2 }]}> 
          {`@${(user?.username || user?.preferredName || user?.firstName || 'user')
            .toString()
            .replace(/\s+/g, '.')
            .toLowerCase()}`}
        </Text>
      </View>
      {/* Personal Info Card */}
      <View style={[styles.card, styles.cardTightBottom]}>
        <Text style={styles.cardHeader}>PERSONAL INFO</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('EditName')}>
          <Ionicons name="person-outline" size={22} color="#FF9500" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Name</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.cardValue}>
              {user?.firstName && user?.surname 
                ? `${user.firstName} ${user.surname}` 
                : user?.displayName || 'Not set'}
            </Text>
            {user?.username ? (
              <Text style={[styles.cardValue, { color: '#9AA3AF', marginTop: 2 }]}>@{user.username}</Text>
            ) : null}
          </View>
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
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('LifestyleInfo')}>
          <Ionicons name="bed-outline" size={22} color="#5856D6" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Lifestyle Info</Text>
          <Text style={styles.cardValue}>Sleep Schedule</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.cardRow, styles.tallRow50, styles.lastRow]} onPress={() => navigation.navigate('HealthIDs')}>
          <Ionicons name="card-outline" size={22} color="#8E44AD" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Linked Health ID</Text>
          <Text style={styles.cardValue}>{profile?.healthIDs?.length ? `${profile.healthIDs.length} IDs` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Health Records Card */}
      <View style={[styles.card, styles.cardTightBottom]}>
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
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('SymptomRegistered')}>
          <Ionicons name="medical-outline" size={22} color="#FF6B6B" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Symptoms</Text>
          <Text style={styles.cardValue}>Track & Analyze</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.cardRow, styles.tallRow50, styles.lastRow]} onPress={() => navigation.navigate('Screenings')}>
          <Ionicons name="search-outline" size={22} color="#007AFF" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Screenings</Text>
          <Text style={styles.cardValue}>{profile?.screenings?.length ? `${profile.screenings.length} screenings` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>



      {/* Record Management Card */}
      <View style={[styles.card, styles.cardTightBottom]}>
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
        <TouchableOpacity style={[styles.cardRow, styles.tallRow50, styles.lastRow]} onPress={() => navigation.navigate('ShareWithDoctor')}>
          <Ionicons name="share-outline" size={22} color="#FF9500" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Share with Doctor</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Emergency Info Card */}
      <View style={[styles.card, styles.cardTightBottom]}>
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
        <TouchableOpacity style={[styles.cardRow, styles.tallRow50, styles.lastRow]} onPress={() => navigation.navigate('PrimaryDoctor')}>
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

      {/* Community Card removed by request */}

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
              <TouchableOpacity onPress={() => {
                setTempBirthDate(null);
                setShowDatePicker(false);
              }} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FF3B30" />
              </TouchableOpacity>
              <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
              <TouchableOpacity
                onPress={() => {
                  const dateToSave = tempBirthDate || (profile?.birthDate ? new Date(profile.birthDate) : new Date());
                  const today = new Date();
                  const birthDate = new Date(dateToSave);
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
                        birthDate: dateToSave.toISOString(),
                      });
                      setShowDatePicker(false);
                      setTempBirthDate(null);
                    } catch (error) {
                      console.error('Error updating birth date:', error);
                      Alert.alert('Error', 'Failed to save date of birth. Please try again.');
                    }
                  } else {
                    Alert.alert('Error', 'Please select a valid date of birth');
                  }
                }}
                style={styles.closeButton}
              >
                <Ionicons name="checkmark" size={24} color="#34C759" />
              </TouchableOpacity>
            </View>
            <View style={styles.datePickerBody}>
              <DateTimePicker
                value={tempBirthDate || (profile?.birthDate ? new Date(profile.birthDate) : new Date())}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
                style={styles.datePicker}
                textColor="#fff"
                themeVariant="dark"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setTempBirthDate(selectedDate);
                  }
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Gender Picker - Bottom Sheet Style */}
      <Modal
        visible={showGenderPicker}
        transparent
        animationType="none"
        presentationStyle="overFullScreen"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowGenderPicker(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.bottomSheetContainer}>
            <Animated.View
              style={[
                styles.bottomSheetContent,
                {
                  transform: [{ translateY: genderPickerTranslateY }],
                },
              ]}
            >
              {/* Handle bar */}
              <View style={styles.bottomSheetHandleContainer}>
                <View style={styles.bottomSheetHandle} />
              </View>

              {/* Header */}
              <View style={styles.bottomSheetHeader} pointerEvents="box-none">
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowGenderPicker(false);
                  }}
                  style={styles.bottomSheetCloseButton}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
                <Text style={styles.bottomSheetTitle}>Select Gender</Text>
                <View style={{ width: 32 }} />
              </View>

              {/* Options List */}
              <ScrollView
                style={styles.bottomSheetBody}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.bottomSheetBodyContent}
              >
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.optionItem}
                    onPress={() => {
                      try {
                        updateProfile({
                          ...profile,
                          gender: option.value as 'male' | 'female',
                        });
                        Animated.timing(genderPickerTranslateY, {
                          toValue: 1000,
                          duration: 250,
                          useNativeDriver: true,
                        }).start(() => {
                          setShowGenderPicker(false);
                          genderPickerTranslateY.setValue(0);
                        });
                      } catch (error) {
                        console.error('Error updating gender:', error);
                        Alert.alert('Error', 'Failed to update gender. Please try again.');
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                    </View>
                    {profile?.gender === option.value && (
                      <Ionicons name="checkmark" size={20} color="#34C759" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingTop: 66,
    paddingBottom: 18,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  headerSettingsButton: {
    position: 'absolute',
    right: 16,
    top: 58,
    padding: 8,
  },
  headerCommunityButton: {
    position: 'absolute',
    left: 16,
    top: 58,
    padding: 8,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1C1C1E',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1C1C1E',
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
    marginBottom: 20,
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
    marginTop: 20,
    marginBottom: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTightBottom: {
    paddingBottom: 0,
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
  tallRow50: {
    height: 50,
  },
  lastRow: {
    borderBottomWidth: 0,
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
    minWidth: 320,
    maxWidth: 380,
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
    marginBottom: 0,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  datePickerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePicker: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 12,
    padding: 10,
    height: 210,
    marginTop: 0,
    marginBottom: 16,
  },
  datePickerBody: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    alignSelf: 'stretch',
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
  // Bottom Sheet Styles for Gender Picker
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  bottomSheetContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
  bottomSheetHandleContainer: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#3A3A3C',
    borderRadius: 2,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    zIndex: 10,
  },
  bottomSheetCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  bottomSheetBody: {
    flex: 0,
  },
  bottomSheetBodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#888',
  },
});

export default ProfileDetailsScreen; 