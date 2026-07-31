import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import StickyHeader from "./components/StickyHeader";
import ScrollableProfileHeader from "./components/ScrollableProfileHeader";
import InfoCard, { CardRowConfig } from "./components/InfoCard";
import ProfilePicturePicker from "@shared/components/profile/ProfilePicturePicker";
import {
  useProfileDetails,
  AVATAR_LARGE,
  COLLAPSE_DISTANCE,
} from "./useProfileDetails";

const ProfileDetailsScreen: React.FC = () => {
  const { width: screenWidth } = useWindowDimensions();
  const {
    navigation,
    user,
    profile,
    isHeaderVisible,
    scrollY,
    handlePhotoSelected,
    avatarScale,
    avatarOpacity,
    avatarTranslateY,
    avatarTranslateX,
    largeNameOpacity,
    largeNameTranslateY,
    headerBgOpacity,
    stickyHeaderOpacity,
    stickyHeaderTranslateY,
    userName,
    userUsername,
    profileCompletion,
  } = useProfileDetails();

  const healthRecordsRows: CardRowConfig[] = useMemo(
    () => [
      {
        icon: "body-outline",
        iconColor: "#3AABF0",
        label: "Physical Stats",
        value: profile?.height ? `${profile.height} cm` : "Not set",
        onPress: () => navigation.navigate("EditPhysicalStats"),
      },
      {
        icon: "medical-outline",
        iconColor: "#FF9500",
        label: "Conditions",
        value: profile?.medicalHistory?.length
          ? `${profile.medicalHistory.length} conditions`
          : "Not set",
        onPress: () => navigation.navigate("Conditions"),
      },
      {
        icon: "medical-outline",
        iconColor: "#4CD964",
        label: "Medications",
        value: profile?.medications?.length
          ? `${profile.medications.length} medications`
          : "Not set",
        onPress: () => navigation.navigate("Medications"),
      },
      {
        icon: "warning-outline",
        iconColor: "#FFD93D",
        label: "Allergies",
        value: profile?.allergies?.length
          ? `${profile.allergies.length} allergies`
          : "Not set",
        onPress: () => navigation.navigate("Allergies"),
      },
      {
        icon: "people-outline",
        iconColor: "#4ECDC4",
        label: "Family History",
        value: profile?.familyHistory?.length
          ? `${profile.familyHistory.length} conditions`
          : "Not set",
        onPress: () => navigation.navigate("FamilyHistory"),
      },
      {
        icon: "shield-checkmark-outline",
        iconColor: "#6BCF7F",
        label: "Vaccinations",
        value: profile?.vaccinations?.length
          ? `${profile.vaccinations.length} vaccines`
          : "Not set",
        onPress: () => navigation.navigate("Vaccinations"),
        isLast: true,
        tallRow: true,
      },
    ],
    [
      profile?.height,
      profile?.medicalHistory?.length,
      profile?.medications?.length,
      profile?.allergies?.length,
      profile?.familyHistory?.length,
      profile?.vaccinations?.length,
      navigation,
    ],
  );

  const medicalHistoryRows: CardRowConfig[] = useMemo(
    () => [
      {
        icon: "pulse-outline",
        iconColor: "#FF6B6B",
        label: "Symptoms",
        value: "Track & Analyze",
        onPress: () => navigation.navigate("SymptomRegistered"),
      },
      {
        icon: "calendar-outline",
        iconColor: "#34C759",
        label: "Past Appointments",
        value: profile?.pastAppointments?.length
          ? `${profile.pastAppointments.length} appointments`
          : "None",
        onPress: () => navigation.navigate("PastAppointments"),
      },
      {
        icon: "search-outline",
        iconColor: "#3AABF0",
        label: "Screenings",
        value: profile?.screenings?.length
          ? `${profile.screenings.length} screenings`
          : "Not set",
        onPress: () => navigation.navigate("Screenings"),
        isLast: true,
        tallRow: true,
      },
    ],
    [
      profile?.pastAppointments?.length,
      profile?.screenings?.length,
      navigation,
    ],
  );

  const recordManagementRows: CardRowConfig[] = useMemo(
    () => [
      {
        icon: "folder-outline",
        iconColor: "#4ECDC4",
        label: "View Medical Records",
        value: profile?.medicalRecords?.length
          ? `${profile.medicalRecords.length} records`
          : "No records",
        onPress: () => navigation.navigate("ViewMedicalRecords"),
      },
      {
        icon: "document-text-outline",
        iconColor: "#45B7D1",
        label: "Generate Health Report",
        onPress: () => navigation.navigate("GenerateHealthReport"),
      },
      {
        icon: "share-outline",
        iconColor: "#FF9500",
        label: "Share with Doctor",
        onPress: () => navigation.navigate("ShareWithDoctor"),
        isLast: true,
        tallRow: true,
      },
    ],
    [profile?.medicalRecords?.length, navigation],
  );

  const emergencyInfoRows: CardRowConfig[] = useMemo(
    () => [
      {
        icon: "call-outline",
        iconColor: "#FF3B30",
        label: "Emergency Contacts",
        value: profile?.emergencyContacts?.length
          ? `${profile.emergencyContacts.length} contact${profile.emergencyContacts.length > 1 ? "s" : ""}`
          : "Not set",
        onPress: () => navigation.navigate("EmergencyContacts"),
      },
      {
        icon: "medical-outline",
        iconColor: "#3AABF0",
        label: "Doctors",
        value: profile?.doctors?.length
          ? `${profile.doctors.length} doctor${profile.doctors.length > 1 ? "s" : ""}`
          : "Not set",
        onPress: () => navigation.navigate("PrimaryDoctor"),
        isLast: true,
        tallRow: true,
      },
    ],
    [profile?.emergencyContacts?.length, profile?.doctors?.length, navigation],
  );

  return (
    <View style={styles.container}>
      <StickyHeader
        stickyHeaderOpacity={stickyHeaderOpacity}
        stickyHeaderTranslateY={stickyHeaderTranslateY}
        headerBgOpacity={headerBgOpacity}
        isHeaderVisible={isHeaderVisible}
        userName={userName}
      />

      {/* Floating avatar — ONE element that morphs from hero → navbar */}
      <Animated.View
        style={[
          styles.floatingAvatar,
          {
            left: (screenWidth - AVATAR_LARGE) / 2,
            opacity: avatarOpacity,
            transform: [
              { translateX: avatarTranslateX },
              { translateY: avatarTranslateY },
              { scale: avatarScale },
            ],
          },
        ]}
      >
        <ProfilePicturePicker
          currentPhotoURL={user?.photoURL}
          onPhotoSelected={handlePhotoSelected}
          size={AVATAR_LARGE}
          userInitial={
            user?.preferredName?.charAt(0) || user?.firstName?.charAt(0) || "U"
          }
          progressPercent={profileCompletion}
          showProgressLabel={!isHeaderVisible}
        />
      </Animated.View>

      {/* Always-visible top buttons — sit above everything, never scroll */}
      <TouchableOpacity
        onPress={() => (navigation as any).navigate("CommunityLeaderboard")}
        style={styles.topCommunityButton}
      >
        <FontAwesome5 name="users" size={22} color="#FFD60A" solid />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => (navigation as any).navigate("Settings")}
        style={styles.topSettingsButton}
      >
        <Ionicons name="settings" size={24} color="#D1D1D6" />
      </TouchableOpacity>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        snapToOffsets={[0, COLLAPSE_DISTANCE]}
        snapToEnd={false}
        decelerationRate="fast"
      >
        <ScrollableProfileHeader
          largeNameOpacity={largeNameOpacity}
          largeNameTranslateY={largeNameTranslateY}
          userName={userName}
          profileCompletion={profileCompletion}
        />

        <InfoCard title="HEALTH RECORDS" rows={healthRecordsRows} />
        <InfoCard title="MEDICAL HISTORY" rows={medicalHistoryRows} />
        <InfoCard title="RECORD MANAGEMENT" rows={recordManagementRows} />
        <InfoCard title="EMERGENCY INFO" rows={emergencyInfoRows} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#000000",
  },
  floatingAvatar: {
    position: "absolute",
    top: 66, // matches profileHeader paddingTop
    zIndex: 1000,
  },
  topCommunityButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 58 : 32,
    left: 16,
    padding: 8,
    zIndex: 1001,
  },
  topSettingsButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 58 : 32,
    right: 16,
    padding: 8,
    zIndex: 1001,
  },
  card: {
    backgroundColor: "#181818",
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTightBottom: {
    paddingBottom: 0,
  },
  cardHeader: {
    color: "#888",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
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
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  cardValue: {
    color: "#aaa",
    fontSize: 15,
    marginRight: 8,
  },
  chevron: {
    marginLeft: 8,
  },
});

export default ProfileDetailsScreen;
