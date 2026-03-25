import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateOfBirthPickerModal from './DateOfBirthPickerModal';
import GenderPickerModal from './GenderPickerModal';
import StickyHeader from './components/StickyHeader';
import ScrollableProfileHeader from './components/ScrollableProfileHeader';
import InfoCard, { CardRowConfig } from './components/InfoCard';
import { useProfileDetails, genderOptions } from './useProfileDetails';

const ProfileDetailsScreen: React.FC = () => {
  const {
    navigation,
    user,
    profile,
    showDatePicker,
    setShowDatePicker,
    showGenderPicker,
    setShowGenderPicker,
    isHeaderVisible,
    scrollY,
    handlePhotoSelected,
    handleDateConfirm,
    handleGenderSelect,
    avatarScale,
    avatarTranslateY,
    largeNameOpacity,
    largeNameTranslateY,
    largeUsernameOpacity,
    largeUsernameTranslateY,
    nameSize,
    usernameSize,
    headerBgOpacity,
    stickyHeaderOpacity,
    stickyHeaderTranslateY,
    userName,
    userUsername,
    profileCompletion,
  } = useProfileDetails();

  const personalInfoRows: CardRowConfig[] = [
    {
      icon: 'calendar-outline',
      iconColor: '#4CD964',
      label: 'Date of Birth',
      value: profile?.age ? `${profile.age} years old` : 'Not set',
      onPress: () => setShowDatePicker(true),
    },
    {
      icon: 'body-outline',
      iconColor: '#007AFF',
      label: 'Gender',
      value: profile?.gender
        ? genderOptions.find(opt => opt.value === profile.gender)?.label || profile.gender
        : 'Not set',
      onPress: () => setShowGenderPicker(true),
    },
    {
      icon: 'fitness-outline',
      iconColor: '#FF3B30',
      label: 'Physical Stats',
      value: profile ? `${profile.height}cm, ${profile.weight}kg` : 'Not set',
      onPress: () => navigation.navigate('EditPhysicalStats'),
    },
    {
      icon: 'bed-outline',
      iconColor: '#5856D6',
      label: 'Lifestyle Info',
      value: 'Sleep Schedule',
      onPress: () => navigation.navigate('LifestyleInfo'),
    },
    {
      icon: 'card-outline',
      iconColor: '#8E44AD',
      label: 'Linked Health ID',
      value: profile?.healthIDs?.length ? `${profile.healthIDs.length} IDs` : 'Not set',
      onPress: () => navigation.navigate('HealthIDs'),
      isLast: true,
      tallRow: true,
    },
  ];

  const healthRecordsRows: CardRowConfig[] = [
    {
      icon: 'medical-outline',
      iconColor: '#FF9500',
      label: 'Conditions',
      value: profile?.medicalHistory?.length ? `${profile.medicalHistory.length} conditions` : 'Not set',
      onPress: () => navigation.navigate('Conditions'),
    },
    {
      icon: 'medical-outline',
      iconColor: '#4CD964',
      label: 'Medications',
      value: profile?.medications?.length ? `${profile.medications.length} medications` : 'Not set',
      onPress: () => navigation.navigate('Medications'),
    },
    {
      icon: 'warning-outline',
      iconColor: '#FFD93D',
      label: 'Allergies',
      value: profile?.allergies?.length ? `${profile.allergies.length} allergies` : 'Not set',
      onPress: () => navigation.navigate('Allergies'),
    },
    {
      icon: 'people-outline',
      iconColor: '#4ECDC4',
      label: 'Family History',
      value: profile?.familyHistory?.length ? `${profile.familyHistory.length} conditions` : 'Not set',
      onPress: () => navigation.navigate('FamilyHistory'),
    },
    {
      icon: 'shield-checkmark-outline',
      iconColor: '#6BCF7F',
      label: 'Vaccinations',
      value: profile?.vaccinations?.length ? `${profile.vaccinations.length} vaccines` : 'Not set',
      onPress: () => navigation.navigate('Vaccinations'),
    },
    {
      icon: 'medical-outline',
      iconColor: '#FF6B6B',
      label: 'Symptoms',
      value: 'Track & Analyze',
      onPress: () => navigation.navigate('SymptomRegistered'),
    },
    {
      icon: 'calendar-outline',
      iconColor: '#34C759',
      label: 'Past Appointments',
      value: profile?.pastAppointments?.length ? `${profile.pastAppointments.length} appointments` : 'None',
      onPress: () => navigation.navigate('PastAppointments'),
    },
    {
      icon: 'search-outline',
      iconColor: '#007AFF',
      label: 'Screenings',
      value: profile?.screenings?.length ? `${profile.screenings.length} screenings` : 'Not set',
      onPress: () => navigation.navigate('Screenings'),
      isLast: true,
      tallRow: true,
    },
  ];

  const recordManagementRows: CardRowConfig[] = [
    {
      icon: 'folder-outline',
      iconColor: '#4ECDC4',
      label: 'View Medical Records',
      value: profile?.medicalRecords?.length ? `${profile.medicalRecords.length} records` : 'No records',
      onPress: () => navigation.navigate('ViewMedicalRecords'),
    },
    {
      icon: 'document-text-outline',
      iconColor: '#45B7D1',
      label: 'Generate Health Report',
      onPress: () => navigation.navigate('GenerateHealthReport'),
    },
    {
      icon: 'share-outline',
      iconColor: '#FF9500',
      label: 'Share with Doctor',
      onPress: () => navigation.navigate('ShareWithDoctor'),
      isLast: true,
      tallRow: true,
    },
  ];

  const emergencyInfoRows: CardRowConfig[] = [
    {
      icon: 'call-outline',
      iconColor: '#FF3B30',
      label: 'Emergency Contacts',
      value: profile?.emergencyContacts?.length
        ? `${profile.emergencyContacts.length} contact${profile.emergencyContacts.length > 1 ? 's' : ''}`
        : 'Not set',
      onPress: () => navigation.navigate('EmergencyContacts'),
    },
    {
      icon: 'medical-outline',
      iconColor: '#007AFF',
      label: 'Doctors',
      value: profile?.doctors?.length
        ? `${profile.doctors.length} doctor${profile.doctors.length > 1 ? 's' : ''}`
        : 'Not set',
      onPress: () => navigation.navigate('PrimaryDoctor'),
      isLast: true,
      tallRow: true,
    },
  ];

  return (
    <View style={styles.container}>
      <StickyHeader
        stickyHeaderOpacity={stickyHeaderOpacity}
        stickyHeaderTranslateY={stickyHeaderTranslateY}
        headerBgOpacity={headerBgOpacity}
        isHeaderVisible={isHeaderVisible}
        userName={userName}
        onCommunityPress={() => (navigation as any).navigate('CommunityLeaderboard')}
        onSettingsPress={() => (navigation as any).navigate('Settings')}
      />

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <ScrollableProfileHeader
          avatarScale={avatarScale}
          avatarTranslateY={avatarTranslateY}
          largeNameOpacity={largeNameOpacity}
          largeNameTranslateY={largeNameTranslateY}
          largeUsernameOpacity={largeUsernameOpacity}
          largeUsernameTranslateY={largeUsernameTranslateY}
          nameSize={nameSize}
          usernameSize={usernameSize}
          userName={userName}
          userUsername={userUsername}
          profileCompletion={profileCompletion}
          photoURL={user?.photoURL}
          userInitial={user?.preferredName?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
          onPhotoSelected={handlePhotoSelected}
          onCommunityPress={() => (navigation as any).navigate('CommunityLeaderboard')}
          onSettingsPress={() => (navigation as any).navigate('Settings')}
        />

        {/* Name row — custom layout with two-line value */}
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
          {personalInfoRows.map((row, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.cardRow,
                row.tallRow && styles.tallRow50,
                row.isLast && styles.lastRow,
              ]}
              onPress={row.onPress}
            >
              <Ionicons name={row.icon} size={22} color={row.iconColor} style={styles.cardIcon} />
              <Text style={styles.cardLabel}>{row.label}</Text>
              {row.value !== undefined && (
                <Text style={styles.cardValue}>{row.value}</Text>
              )}
              <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
            </TouchableOpacity>
          ))}
        </View>

        <InfoCard title="HEALTH RECORDS" rows={healthRecordsRows} />
        <InfoCard title="RECORD MANAGEMENT" rows={recordManagementRows} />
        <InfoCard title="EMERGENCY INFO" rows={emergencyInfoRows} />

        <DateOfBirthPickerModal
          visible={showDatePicker}
          currentBirthDate={profile?.birthDate}
          onConfirm={handleDateConfirm}
          onClose={() => setShowDatePicker(false)}
        />

        <GenderPickerModal
          visible={showGenderPicker}
          currentGender={profile?.gender}
          onSelect={handleGenderSelect}
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
});

export default ProfileDetailsScreen;
