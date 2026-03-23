import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../../../../shared/context/AuthContext';
import { calculateProfileCompletion } from '../../../../../shared/utils/profileCompletion';
import ProfilePicturePicker from '../../../../../shared/components/profile/ProfilePicturePicker';
import { useHealthData } from '../../../../../shared/context/HealthDataContext';
import { ProfileTabParamList } from '../../../../../shared/types';
import DateOfBirthPickerModal from './DateOfBirthPickerModal';
import GenderPickerModal from './GenderPickerModal';

type ProfileDetailsScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

// Constants for collapsing header
const COLLAPSE_DISTANCE = 120;
const AVATAR_LARGE = 110;
const AVATAR_SMALL = 32;
const NAME_LARGE = 24;
const NAME_SMALL = 18;
const USERNAME_LARGE = 15;
const USERNAME_SMALL = 12;
const HEADER_BG_START = 20;
const HEADER_BG_END = 100;

const ProfileDetailsScreen: React.FC = () => {
  const navigation = useNavigation<ProfileDetailsScreenNavigationProp>();
  const { user, updateUserPhoto } = useAuth();
  const { profile, updateProfile } = useHealthData();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  
  // Animated value for scroll position
  const scrollY = useRef(new Animated.Value(0)).current;

  // Track scroll position to enable/disable header interactions
  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      setIsHeaderVisible(value > COLLAPSE_DISTANCE / 2);
    });
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [scrollY]);


  const handlePhotoSelected = (photoURI: string) => {
    if (updateUserPhoto) {
      updateUserPhoto(photoURI);
    }
  };

  // Interpolations for collapsing header
  const avatarScale = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [1, AVATAR_SMALL / AVATAR_LARGE],
    extrapolate: 'clamp',
  });

  // Calculate the distance the avatar needs to travel
  // From center of screen to left side of sticky header
  const headerTopPadding = Platform.OS === 'ios' ? 44 : 20;
  const headerContentPadding = 8;
  const stickyHeaderY = headerTopPadding + headerContentPadding + AVATAR_SMALL / 2;
  const initialAvatarY = 66 + AVATAR_LARGE / 2; // Initial position from top
  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [0, stickyHeaderY - initialAvatarY],
    extrapolate: 'clamp',
  });

  // Avatar stays centered (no horizontal translation)

  const largeNameOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const largeNameTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const largeUsernameOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const largeUsernameTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const nameSize = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [NAME_LARGE, NAME_SMALL],
    extrapolate: 'clamp',
  });

  const usernameSize = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [USERNAME_LARGE, USERNAME_SMALL],
    extrapolate: 'clamp',
  });

  const headerBgOpacity = scrollY.interpolate({
    inputRange: [HEADER_BG_START, HEADER_BG_END],
    outputRange: [0, 1], // Fully opaque (not transparent)
    extrapolate: 'clamp',
  });

  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const stickyHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [-20, 0],
    extrapolate: 'clamp',
  });

  const userName = user?.firstName && user?.surname
    ? `${user.firstName} ${user.surname}`
    : user?.displayName || 'User';
  
  const userUsername = `@${(user?.username || user?.preferredName || user?.firstName || 'user')
    .toString()
    .replace(/\s+/g, '.')
    .toLowerCase()}`;

  const profileCompletion = calculateProfileCompletion(user, profile);

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            opacity: stickyHeaderOpacity,
            transform: [{ translateY: stickyHeaderTranslateY }],
          },
        ]}
        pointerEvents={isHeaderVisible ? 'auto' : 'none'}
      >
        <Animated.View
          style={[
            styles.stickyHeaderBackground,
            {
              opacity: headerBgOpacity,
            },
          ]}
        >
          <BlurView
            intensity={15}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <View style={styles.stickyHeaderContent}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CommunityLeaderboard' as never)}
            style={styles.stickyHeaderCommunityButton}
          >
            <FontAwesome5 name="users" size={20} color="#0A84FF" solid />
          </TouchableOpacity>
          <View style={styles.stickyHeaderTextContainer}>
            <Text style={styles.stickyHeaderName} numberOfLines={1}>
              {userName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings' as never)}
            style={styles.stickyHeaderSettingsButton}
          >
            <Ionicons name="settings" size={22} color="#0A84FF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Scrollable Profile Header (avatar, name) */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={() => navigation.navigate('CommunityLeaderboard' as never)} style={styles.headerCommunityButton}>
            <FontAwesome5 name="users" size={22} color="#0A84FF" solid />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)} style={styles.headerSettingsButton}>
            <Ionicons name="settings" size={24} color="#0A84FF" />
          </TouchableOpacity>
          
          {/* Animated Avatar */}
          <Animated.View
            style={[
              styles.animatedAvatarContainer,
              {
                transform: [
                  { scale: avatarScale },
                  { translateY: avatarTranslateY },
                ],
              },
            ]}
          >
            <ProfilePicturePicker
              currentPhotoURL={user?.photoURL}
              onPhotoSelected={handlePhotoSelected}
              size={AVATAR_LARGE}
              userInitial={user?.preferredName?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
              progressPercent={profileCompletion}
            />
          </Animated.View>
          
          {/* Animated Name + green verified tick when profile 100% complete */}
          <Animated.View
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 2,
                opacity: largeNameOpacity,
                transform: [{ translateY: largeNameTranslateY }],
              },
            ]}
          >
            <Animated.Text
              style={[styles.profileName, { fontSize: nameSize }]}
            >
              {userName}
            </Animated.Text>
            {profileCompletion >= 100 && (
              <Ionicons name="checkmark-circle" size={22} color="#34C759" style={{ marginLeft: 6 }} />
            )}
          </Animated.View>
          
          {/* Animated Username */}
          <Animated.Text
            style={[
              styles.profileEmail,
              {
                marginTop: 2,
                opacity: largeUsernameOpacity,
                fontSize: usernameSize,
                transform: [{ translateY: largeUsernameTranslateY }],
              },
            ]}
          >
            {userUsername}
          </Animated.Text>
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
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('PastAppointments')}>
          <Ionicons name="calendar-outline" size={22} color="#34C759" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Past Appointments</Text>
          <Text style={styles.cardValue}>{profile?.pastAppointments?.length ? `${profile.pastAppointments.length} appointments` : 'None'}</Text>
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

      <DateOfBirthPickerModal
        visible={showDatePicker}
        currentBirthDate={profile?.birthDate}
        onConfirm={(date, age) => {
          try {
            updateProfile({ ...profile, age, birthDate: date.toISOString() });
            setShowDatePicker(false);
          } catch {
            Alert.alert('Error', 'Failed to save date of birth. Please try again.');
          }
        }}
        onClose={() => setShowDatePicker(false)}
      />

      <GenderPickerModal
        visible={showGenderPicker}
        currentGender={profile?.gender}
        onSelect={(gender) => {
          try {
            updateProfile({ ...profile, gender });
          } catch {
            Alert.alert('Error', 'Failed to update gender. Please try again.');
          }
          setShowGenderPicker(false);
        }}
        onClose={() => setShowGenderPicker(false)}
      />
      </Animated.ScrollView>
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
    backgroundColor: '#000000',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 12,
    minHeight: Platform.OS === 'ios' ? 88 : 64,
  },
  stickyHeaderBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000', // Fully opaque black
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    position: 'relative',
  },
  stickyHeaderCommunityButton: {
    marginRight: 12,
    padding: 4,
  },
  stickyHeaderSettingsButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  stickyHeaderTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyHeaderName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  stickyHeaderUsername: {
    color: '#aaa',
    fontSize: 12,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingTop: 66,
    paddingBottom: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  animatedAvatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
    marginBottom: 8,
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
    marginTop: 12,
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