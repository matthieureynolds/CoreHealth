import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ProfileTabParamList } from '../types';

import ProfileDetailsScreen from '../screens/profile/ProfileDetailsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import EditNameScreen from '../screens/profile/EditNameScreen';
import EditPhysicalStatsScreen from '../screens/profile/EditPhysicalStatsScreen';
import HealthIDsScreen from '../screens/profile/HealthIDsScreen';
import ConditionsScreen from '../screens/profile/ConditionsScreen';
import MedicationsScreen from '../screens/profile/MedicationsScreen';
import AllergiesScreen from '../screens/profile/AllergiesScreen';
import FamilyHistoryScreen from '../screens/profile/FamilyHistoryScreen';
import VaccinationsScreen from '../screens/profile/VaccinationsScreen';
import ScreeningsScreen from '../screens/profile/ScreeningsScreen';
import UploadMedicalRecordScreen from '../screens/profile/UploadMedicalRecordScreen';
import ViewMedicalRecordsScreen from '../screens/profile/ViewMedicalRecordsScreen';
import GenerateHealthReportScreen from '../screens/profile/GenerateHealthReportScreen';
import ShareWithDoctorScreen from '../screens/profile/ShareWithDoctorScreen';
import MedicalHistoryScreen from '../screens/profile/MedicalHistoryScreen';
import EmergencyContactsScreen from '../screens/profile/EmergencyContactsScreen';
import PrimaryDoctorScreen from '../screens/profile/PrimaryDoctorScreen';
import BiomarkerVisibilityScreen from '../screens/profile/BiomarkerVisibilityScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import TermsOfServiceScreen from '../screens/profile/TermsOfServiceScreen';
import AboutScreen from '../screens/profile/AboutScreen';
// New Settings Screens
import AccountSettingsScreen from '../screens/profile/AccountSettingsScreen';
import EmailPasswordScreen from '../screens/profile/EmailPasswordScreen';
import ConnectedAccountsScreen from '../screens/profile/ConnectedAccountsScreen';
import TwoFactorAuthScreen from '../screens/profile/TwoFactorAuthScreen';
import ConnectedDevicesScreen from '../screens/profile/ConnectedDevicesScreen';
import DisplayFormatScreen from '../screens/profile/DisplayFormatScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import DataSyncScreen from '../screens/profile/DataSyncScreen';
import PrivacySecurityScreen from '../screens/profile/PrivacySecurityScreen';
import LegalComplianceScreen from '../screens/profile/LegalComplianceScreen';
import TermsScreen from '../screens/profile/TermsScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import ConsentFormsScreen from '../screens/profile/ConsentFormsScreen';
import ComplianceNoticesScreen from '../screens/profile/ComplianceNoticesScreen';
import DataProcessingAgreementScreen from '../screens/profile/DataProcessingAgreementScreen';
import DataRetentionPolicyScreen from '../screens/profile/DataRetentionPolicyScreen';
import SupportHelpScreen from '../screens/profile/SupportHelpScreen';
import FAQScreen from '../screens/profile/FAQScreen';
import AppInfoScreen from '../screens/profile/AppInfoScreen';
import LoginSecurityScreen from '../screens/profile/LoginSecurityScreen';
import IdentityVerificationModal from '../screens/profile/modals/IdentityVerificationModal';
import NewEmailModal from '../screens/profile/modals/NewEmailModal';
import CheckEmailScreen from '../screens/profile/CheckEmailScreen';
import ProfilePicturePicker from '../components/ProfilePicturePicker';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator<ProfileTabParamList>();

// Tab Navigator for Profile and Settings
const ProfileTabsNavigator: React.FC = () => {
  const { user, updateUserPhoto } = useAuth();

  const handlePhotoSelected = (photoURI: string) => {
    // Update the user's photo in the auth context
    if (updateUserPhoto) {
      updateUserPhoto(photoURI);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }} edges={['top']}>
      {/* User Profile Section */}
      <View style={styles.profileHeader}>
        <ProfilePicturePicker
          currentPhotoURL={user?.photoURL}
          onPhotoSelected={handlePhotoSelected}
          size={120}
          userInitial={user?.preferredName?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
        />
        <Text style={styles.profileName}>
          {user?.firstName && user?.surname 
            ? `${user.firstName} ${user.surname}` 
            : user?.displayName || 'User'}
        </Text>
        <Text style={styles.profileUsername}>
          {user?.preferredName || user?.firstName || 'matthieu.reynolds_04'}
        </Text>
      </View>

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
            fontSize: 16,
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
              <Ionicons name="person" size={20} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }: { color: string }) => (
              <Ionicons name="settings" size={20} color={color} />
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
        component={AboutScreen}
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
      <Stack.Screen
        name="ConnectedAccounts"
        component={ConnectedAccountsScreen}
        options={{
          title: 'Connected Accounts',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TwoFactorAuth"
        component={TwoFactorAuthScreen}
        options={{
          title: 'Two-Factor Authentication',
          headerShown: false,
        }}
      />
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
      <Stack.Screen name="TermsOfService" component={TermsScreen} options={{ headerShown: false }} />
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
    paddingVertical: 30,
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
    marginBottom: 16,
  },
}); 