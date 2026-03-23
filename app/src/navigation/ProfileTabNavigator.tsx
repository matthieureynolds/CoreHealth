import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../shared/context/AuthContext';
import { ProfileTabParamList } from '../shared/types';
import { colors } from '../shared/theme/colors';

import ProfileDetailsScreen from '../features/profile/screens/ProfileDetailsScreen';
import SettingsScreen from '../features/profile/screens/SettingsScreen';
import EditProfileScreen from '../features/profile/screens/EditProfileScreen';
import EditNameScreen from '../features/profile/screens/EditNameScreen';
import EditUsernameScreen from '../features/profile/screens/EditUsernameScreen';
import EditPhysicalStatsScreen from '../features/profile/screens/EditPhysicalStatsScreen';
import LifestyleInfoScreen from '../features/profile/screens/LifestyleInfoScreen';
import SymptomRegisteredScreen from '../features/profile/screens/SymptomRegisteredScreen';
import HealthIDsScreen from '../features/profile/screens/HealthIDsScreen';
import ConditionsScreen from '../features/profile/screens/ConditionsScreen';
import MedicationsScreen from '../features/profile/screens/MedicationsScreen';
import AllergiesScreen from '../features/profile/screens/AllergiesScreen';
import FamilyHistoryScreen from '../features/profile/screens/FamilyHistoryScreen';
import VaccinationsScreen from '../features/profile/screens/VaccinationsScreen';
import ScreeningsScreen from '../features/profile/screens/ScreeningsScreen';
import UploadMedicalRecordScreen from '../features/profile/screens/UploadMedicalRecordScreen';
import ViewMedicalRecordsScreen from '../features/profile/screens/ViewMedicalRecordsScreen';
import PastAppointmentsScreen from '../features/profile/screens/PastAppointmentsScreen';
import GenerateHealthReportScreen from '../features/profile/screens/GenerateHealthReportScreen';
import ShareWithDoctorScreen from '../features/profile/screens/ShareWithDoctorScreen';
import MedicalHistoryScreen from '../features/profile/screens/MedicalHistoryScreen';
import EmergencyContactsScreen from '../features/profile/screens/EmergencyContactsScreen';
import PrimaryDoctorScreen from '../features/profile/screens/PrimaryDoctorScreen';
import BiomarkerVisibilityScreen from '../features/profile/screens/BiomarkerVisibilityScreen';
import HelpSupportScreen from '../features/profile/screens/HelpSupportScreen';
import TermsOfServiceScreen from '../features/profile/screens/legal/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../features/profile/screens/legal/PrivacyPolicyScreen';
import ConsentFormsScreen from '../features/profile/screens/legal/ConsentFormsScreen';
import ComplianceNoticesScreen from '../features/profile/screens/legal/ComplianceNoticesScreen';
import DataProcessingAgreementScreen from '../features/profile/screens/DataProcessingAgreementScreen';
import DataRetentionPolicyScreen from '../features/profile/screens/DataRetentionPolicyScreen';
import SupportHelpScreen from '../features/profile/screens/SupportHelpScreen';
import FAQScreen from '../features/profile/screens/FAQScreen';
import AppInfoScreen from '../features/profile/screens/AppInfoScreen';
import AccountSettingsScreen from '../features/profile/screens/AccountSettingsScreen';
import EmailPasswordScreen from '../features/profile/screens/EmailPasswordScreen';
import ConnectedDevicesScreen from '../features/profile/screens/ConnectedDevicesScreen';
import DisplayFormatScreen from '../features/profile/screens/DisplayFormatScreen';
import LifestyleSettingsScreen from '../features/profile/screens/LifestyleSettingsScreen';
import NotificationsScreen from '../features/profile/screens/NotificationsScreen';
import DataSyncScreen from '../features/profile/screens/DataSyncScreen';
import PrivacySecurityScreen from '../features/profile/screens/PrivacySecurityScreen';
import LegalComplianceScreen from '../features/profile/screens/LegalComplianceScreen';
import FamilyLinkScreen from '../features/profile/screens/FamilyLinkScreen';
import FamilyLinkConsentScreen from '../features/profile/screens/FamilyLinkConsentScreen';
import CommunityLeaderboardScreen from '../features/profile/screens/CommunityLeaderboardScreen';
import CountryLeaderboardScreen from '../features/profile/screens/CountryLeaderboardScreen';
import PrivateCirclesScreen from '../features/profile/screens/PrivateCirclesScreen';
import PublicLeaguesScreen from '../features/profile/screens/PublicLeaguesScreen';
import PublicLeagueDetailScreen from '../features/profile/screens/PublicLeagueDetailScreen';
import CircleDetailScreen from '../features/profile/screens/CircleDetailScreen';
import CountryDetailScreen from '../features/profile/screens/CountryDetailScreen';
// Removed unused imports for non-existent screens/modals
// import ProfilePicturePicker from '../shared/components/ProfilePicturePicker';

const Stack = createStackNavigator<ProfileTabParamList>();

// Stack Navigator for Profile section with detail screens
const ProfileTabNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.bg,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
          color: colors.textPrimary,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="ProfileDetails"
        component={ProfileDetailsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
        }}
      />
      <Stack.Screen
        name="EditName"
        component={EditNameScreen}
        options={{
          title: 'Edit Name',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditUsername"
        component={EditUsernameScreen}
        options={{
          title: 'Edit Username',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditPhysicalStats"
        component={EditPhysicalStatsScreen}
        options={{
          title: 'Edit Physical Stats',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LifestyleInfo"
        component={LifestyleInfoScreen}
        options={{
          title: 'Lifestyle Info',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CommunityLeaderboard"
        component={CommunityLeaderboardScreen}
        options={{
          title: 'Community',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PrivateCircles"
        component={PrivateCirclesScreen}
        options={{
          title: 'Private Circles',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CountryLeaderboard"
        component={CountryLeaderboardScreen}
        options={{
          title: 'Country Leaderboard',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PublicLeagues"
        component={PublicLeaguesScreen}
        options={{
          title: 'Public Leagues',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PublicLeagueDetail"
        component={PublicLeagueDetailScreen}
        options={{
          title: 'Public League',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CircleDetail"
        component={CircleDetailScreen}
        options={{
          title: 'Circle',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CountryDetail"
        component={CountryDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SymptomRegistered"
        component={SymptomRegisteredScreen}
        options={{
          title: 'Symptom Registered',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HealthIDs"
        component={HealthIDsScreen}
        options={{
          title: 'Health IDs',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Conditions"
        component={ConditionsScreen}
        options={{
          title: 'Medical Conditions',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Medications"
        component={MedicationsScreen}
        options={{
          title: 'Medications',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Allergies"
        component={AllergiesScreen}
        options={{
          title: 'Allergies',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="FamilyHistory"
        component={FamilyHistoryScreen}
        options={{
          title: 'Family History',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Vaccinations"
        component={VaccinationsScreen}
        options={{
          title: 'Vaccinations',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Screenings"
        component={ScreeningsScreen}
        options={{
          title: 'Screenings',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="UploadMedicalRecord"
        component={UploadMedicalRecordScreen}
        options={{
          title: 'Upload Medical Record',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ViewMedicalRecords"
        component={ViewMedicalRecordsScreen}
        options={{
          title: 'View Medical Records',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PastAppointments"
        component={PastAppointmentsScreen}
        options={{
          title: 'Past Appointments',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GenerateHealthReport"
        component={GenerateHealthReportScreen}
        options={{
          title: 'Generate Health Report',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ShareWithDoctor"
        component={ShareWithDoctorScreen}
        options={{
          title: 'Share with Doctor',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MedicalHistory"
        component={MedicalHistoryScreen}
        options={{
          title: 'Medical History',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EmergencyContacts"
        component={EmergencyContactsScreen}
        options={{
          title: 'Emergency Contacts',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PrimaryDoctor"
        component={PrimaryDoctorScreen}
        options={{
          title: 'Primary Doctor',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BiomarkerVisibility"
        component={BiomarkerVisibilityScreen}
        options={{
          title: 'Biomarker Visibility',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{
          title: 'Help & Support',
        }}
      />
      {/* Legacy screens removed; using new legal document screens below */}
      <Stack.Screen
        name="About"
        component={AppInfoScreen}
        options={{
          title: 'About CoreHealth',
        }}
      />
      {/* New Settings Screens */}
      <Stack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{
          title: 'Account Settings',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EmailPassword"
        component={EmailPasswordScreen}
        options={{
          title: 'Email & Password',
          headerShown: false,
        }}
      />
      {/* Removed ConnectedAccounts and TwoFactorAuth screens */}
      <Stack.Screen
        name="ConnectedDevices"
        component={ConnectedDevicesScreen}
        options={{
          title: 'Connected Devices',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DisplayFormat"
        component={DisplayFormatScreen}
        options={{
          title: 'Display & Format',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LifestyleSettings"
        component={LifestyleSettingsScreen}
        options={{
          title: 'Personal Info - Lifestyle',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="DataSync"
        component={DataSyncScreen}
        options={{
          title: 'Data & Sync',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PrivacySecurity"
        component={PrivacySecurityScreen}
        options={{
          title: 'Privacy & Security',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="FamilyLink"
        component={FamilyLinkScreen}
        options={{
          title: 'Family Link',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="FamilyLinkConsent"
        component={FamilyLinkConsentScreen}
        options={{
          title: 'Consent & Broadcast',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LegalCompliance"
        component={LegalComplianceScreen}
        options={{
          title: 'Legal & Compliance',
          headerShown: false,
        }}
      />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ConsentForms" component={ConsentFormsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ComplianceNotices" component={ComplianceNoticesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DataProcessingAgreement" component={DataProcessingAgreementScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DataRetentionPolicy" component={DataRetentionPolicyScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="SupportHelp"
        component={SupportHelpScreen}
        options={{
          title: 'Support & Help',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="FAQ"
        component={FAQScreen}
        options={{
          title: 'FAQs',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AppInfo"
        component={AppInfoScreen}
        options={{
          title: 'App Info',
          headerShown: false,
        }}
      />

    </Stack.Navigator>
  );
};

export default ProfileTabNavigator;

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.bg,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: colors.textTertiary,
    marginBottom: 2,
  },
}); 