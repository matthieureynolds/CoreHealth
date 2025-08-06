import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import AboutScreen from '../screens/profile/AboutScreen';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator<ProfileTabParamList>();

// Tab Navigator for Profile and Settings
const ProfileTabsNavigator: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }} edges={['top']}>
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
        statusBarStyle: 'light',
        statusBarBackgroundColor: '#111',
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
        }}
      />
      <Stack.Screen
        name="EditPhysicalStats"
        component={EditPhysicalStatsScreen}
        options={{
          title: 'Edit Physical Stats',
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
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{
          title: 'Terms of Service',
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          title: 'Privacy Policy',
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: 'About CoreHealth',
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileTabNavigator; 