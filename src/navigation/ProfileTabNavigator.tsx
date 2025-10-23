import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ProfileTabParamList } from '../types';

import ProfileDetailsScreen from '../features/profile/ProfileDetailsScreen';
import SettingsScreen from '../features/profile/SettingsScreen';
import EditProfileScreen from '../features/profile/EditProfileScreen';
import EditNameScreen from '../features/profile/EditNameScreen';
import EditPhysicalStatsScreen from '../features/profile/EditPhysicalStatsScreen';
import LifestyleInfoScreen from '../features/profile/LifestyleInfoScreen';
import CommunityLeaderboardScreen from '../features/profile/CommunityLeaderboardScreen';
import SymptomRegisteredScreen from '../features/profile/SymptomRegisteredScreen';
import HealthIDsScreen from '../features/profile/HealthIDsScreen';
import ConditionsScreen from '../features/profile/ConditionsScreen';
import MedicationsScreen from '../features/profile/MedicationsScreen';
import AllergiesScreen from '../features/profile/AllergiesScreen';
import FamilyHistoryScreen from '../features/profile/FamilyHistoryScreen';
import VaccinationsScreen from '../features/profile/VaccinationsScreen';
import ScreeningsScreen from '../features/profile/ScreeningsScreen';
import UploadMedicalRecordScreen from '../features/profile/UploadMedicalRecordScreen';
import ViewMedicalRecordsScreen from '../features/profile/ViewMedicalRecordsScreen';
import GenerateHealthReportScreen from '../features/profile/GenerateHealthReportScreen';
import ShareWithDoctorScreen from '../features/profile/ShareWithDoctorScreen';
import MedicalHistoryScreen from '../features/profile/MedicalHistoryScreen';
import EmergencyContactsScreen from '../features/profile/EmergencyContactsScreen';
import PrimaryDoctorScreen from '../features/profile/PrimaryDoctorScreen';
import BiomarkerVisibilityScreen from '../features/profile/BiomarkerVisibilityScreen';
import HelpSupportScreen from '../features/profile/HelpSupportScreen';
import TermsOfServiceScreen from '../features/profile/5B-SETTINGS/2-Data-Privacy/3-Legal-Compliance/1-Legal-Documents/1-Terms-Conditions/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../features/profile/5B-SETTINGS/2-Data-Privacy/3-Legal-Compliance/1-Legal-Documents/2-Privacy-Policy/PrivacyPolicyScreen';
import ConsentFormsScreen from '../features/profile/5B-SETTINGS/2-Data-Privacy/3-Legal-Compliance/1-Legal-Documents/3-Consent-Forms/ConsentFormsScreen';
import ComplianceNoticesScreen from '../features/profile/5B-SETTINGS/2-Data-Privacy/3-Legal-Compliance/1-Legal-Documents/4-HIPAA-GDPR/ComplianceNoticesScreen';
import DataProcessingAgreementScreen from '../features/profile/DataProcessingAgreementScreen';
import DataRetentionPolicyScreen from '../features/profile/DataRetentionPolicyScreen';
import SupportHelpScreen from '../features/profile/SupportHelpScreen';
import FAQScreen from '../features/profile/FAQScreen';
import AppInfoScreen from '../features/profile/AppInfoScreen';
import AccountSettingsScreen from '../features/profile/AccountSettingsScreen';
import EmailPasswordScreen from '../features/profile/EmailPasswordScreen';
import ConnectedDevicesScreen from '../features/profile/ConnectedDevicesScreen';
import DisplayFormatScreen from '../features/profile/DisplayFormatScreen';
import LifestyleSettingsScreen from '../features/profile/LifestyleSettingsScreen';
import NotificationsScreen from '../features/profile/NotificationsScreen';
import DataSyncScreen from '../features/profile/DataSyncScreen';
import PrivacySecurityScreen from '../features/profile/PrivacySecurityScreen';
import LegalComplianceScreen from '../features/profile/LegalComplianceScreen';
// Removed unused imports for non-existent screens/modals
// import ProfilePicturePicker from '../components/ProfilePicturePicker';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator<ProfileTabParamList>();

// Tab Navigator for Profile and Settings
const ProfileTabsNavigator: React.FC = () => {
  const { user } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }} edges={['top']}>
      {/* Profile header moved into ProfileDetailsScreen to enable scrolling */}

      {/* Tabs */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#888',
          tabBarIndicatorStyle: {
            backgroundColor: '#007AFF',
          },
          tabBarStyle: {
            backgroundColor: '#111',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          tabBarLabelStyle: {
            fontSize: 15,
            fontWeight: '600',
            textTransform: 'none',
          },
        }}
      >
        <Tab.Screen
          name="ProfileDetails"
          component={ProfileDetailsScreen}
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }: { color: string }) => (
              <Ionicons name="person" size={18} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }: { color: string }) => (
              <Ionicons name="settings" size={18} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

// Stack Navigator for Profile section with detail screens
const ProfileTabNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#111',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#fff',
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="ProfileTabs"
        component={ProfileTabsNavigator}
        options={{ headerShown: false }}
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
          title: 'Health Community',
          headerShown: false,
        }}
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
    backgroundColor: '#111',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: '#888',
    marginBottom: 2,
  },
}); 