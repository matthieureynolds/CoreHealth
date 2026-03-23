import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';

import AccountSettingsScreen from '../../../features/profile/screens/settings/account-preferences/account-settings/AccountSettingsScreen';
import EmailPasswordScreen from '../../../features/profile/screens/settings/account-preferences/account-settings/EmailPasswordScreen';
import ConnectedDevicesScreen from '../../../features/profile/screens/settings/account-preferences/connected-devices/ConnectedDevicesScreen';
import DisplayFormatScreen from '../../../features/profile/screens/settings/account-preferences/display-format/DisplayFormatScreen';
import LifestyleSettingsScreen from '../../../features/profile/screens/profile/personal-info/lifestyle-info/LifestyleSettingsScreen';
import NotificationsScreen from '../../../features/profile/screens/settings/account-preferences/notifications/NotificationsScreen';
import BiomarkerVisibilityScreen from '../../../features/profile/screens/settings/account-preferences/display-format/BiomarkerVisibilityScreen';
import DataSyncScreen from '../../../features/profile/screens/settings/data-privacy/data-sync/DataSyncScreen';

// Display & Format sub-screens
import UnitsScreen from '../../../features/profile/screens/settings/account-preferences/display-format/units/UnitsScreen';
import DateFormatScreen from '../../../features/profile/screens/settings/account-preferences/display-format/date-format/DateFormatScreen';
import TimeFormatScreen from '../../../features/profile/screens/settings/account-preferences/display-format/time-format/TimeFormatScreen';
import LanguageScreen from '../../../features/profile/screens/settings/account-preferences/display-format/language/LanguageScreen';

// Notifications sub-screens
import SupplementsMedicationRemindersScreen from '../../../features/profile/screens/settings/account-preferences/notifications/supplements-medication-reminders/SupplementsMedicationRemindersScreen';
import MedicalAppointmentScreen from '../../../features/profile/screens/settings/account-preferences/notifications/medical-appointment/MedicalAppointmentScreen';
import MonthlyHealthSummaryScreen from '../../../features/profile/screens/settings/account-preferences/notifications/monthly-health-summary/MonthlyHealthSummaryScreen';
import WeeklyHealthSummaryScreen from '../../../features/profile/screens/settings/account-preferences/notifications/weekly-health-summary/WeeklyHealthSummaryScreen';
import SleepRemindersScreen from '../../../features/profile/screens/settings/account-preferences/notifications/sleep-reminders/SleepRemindersScreen';

// Privacy & Security — hub
import PrivacySecurityScreen from '../../../features/profile/screens/settings/data-privacy/privacy-security/PrivacySecurityScreen';

// Privacy & Security — Security sub-screens
import BiometricLockScreen from '../../../features/profile/screens/settings/data-privacy/privacy-security/security/biometric-lock/BiometricLockScreen';
import LocationAccessScreen from '../../../features/profile/screens/settings/data-privacy/privacy-security/security/location-access/LocationAccessScreen';
import DataConsentScreen from '../../../features/profile/screens/settings/data-privacy/privacy-security/security/data-consent/DataConsentScreen';

// Privacy & Security — Privacy sub-screens
import FamilyLinkScreen from '../../../features/profile/screens/settings/data-privacy/privacy-security/privacy/family-link/FamilyLinkScreen';
import FamilyLinkConsentScreen from '../../../features/profile/screens/settings/data-privacy/privacy-security/privacy/family-link/FamilyLinkConsentScreen';
import DataSharingSettingsScreen from '../../../features/profile/screens/settings/data-privacy/privacy-security/privacy/data-sharing-settings/DataSharingSettingsScreen';
import HealthDataDownloadScreen from '../../../features/profile/screens/settings/data-privacy/privacy-security/privacy/health-data-download/HealthDataDownloadScreen';
import DeleteAccountScreen from '../../../features/profile/screens/settings/data-privacy/privacy-security/privacy/delete-account-data/DeleteAccountScreen';

type StackType = ReturnType<typeof createStackNavigator<ProfileTabParamList>>;

export const SettingsScreens = (Stack: StackType) => (
  <>
    {/* Account Preferences */}
    <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EmailPassword" component={EmailPasswordScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ConnectedDevices" component={ConnectedDevicesScreen} options={{ headerShown: false }} />
    <Stack.Screen name="DisplayFormat" component={DisplayFormatScreen} options={{ headerShown: false }} />
    <Stack.Screen name="LifestyleSettings" component={LifestyleSettingsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="BiomarkerVisibility" component={BiomarkerVisibilityScreen} options={{ headerShown: false }} />

    {/* Display & Format sub-screens */}
    <Stack.Screen name="Units" component={UnitsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="DateFormat" component={DateFormatScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TimeFormat" component={TimeFormatScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Language" component={LanguageScreen} options={{ headerShown: false }} />

    {/* Notifications sub-screens */}
    <Stack.Screen name="SupplementsMedicationReminders" component={SupplementsMedicationRemindersScreen} options={{ headerShown: false }} />
    <Stack.Screen name="MedicalAppointment" component={MedicalAppointmentScreen} options={{ headerShown: false }} />
    <Stack.Screen name="MonthlyHealthSummary" component={MonthlyHealthSummaryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="WeeklyHealthSummary" component={WeeklyHealthSummaryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SleepReminders" component={SleepRemindersScreen} options={{ headerShown: false }} />

    {/* Data & Sync */}
    <Stack.Screen name="DataSync" component={DataSyncScreen} options={{ headerShown: false }} />

    {/* Privacy & Security — hub */}
    <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} options={{ headerShown: false }} />

    {/* Privacy & Security — Security */}
    <Stack.Screen name="BiometricLock" component={BiometricLockScreen} options={{ headerShown: false }} />
    <Stack.Screen name="LocationAccess" component={LocationAccessScreen} options={{ headerShown: false }} />
    <Stack.Screen name="DataConsent" component={DataConsentScreen} options={{ headerShown: false }} />

    {/* Privacy & Security — Privacy */}
    <Stack.Screen name="FamilyLink" component={FamilyLinkScreen} options={{ headerShown: false }} />
    <Stack.Screen name="FamilyLinkConsent" component={FamilyLinkConsentScreen} options={{ headerShown: false }} />
    <Stack.Screen name="DataSharingSettings" component={DataSharingSettingsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="HealthDataDownload" component={HealthDataDownloadScreen} options={{ headerShown: false }} />
    <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ headerShown: false }} />
  </>
);
