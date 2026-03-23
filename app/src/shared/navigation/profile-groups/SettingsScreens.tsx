import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';

import AccountSettingsScreen from '../../../features/profile/screens/settings/account-preferences/account-settings/AccountSettingsScreen';
import EmailPasswordScreen from '../../../features/profile/screens/settings/account-preferences/account-settings/EmailPasswordScreen';
import ConnectedDevicesScreen from '../../../features/profile/screens/settings/account-preferences/connected-devices/ConnectedDevicesScreen';
import DisplayFormatScreen from '../../../features/profile/screens/settings/account-preferences/display-format/DisplayFormatScreen';
import LifestyleSettingsScreen from '../../../features/profile/screens/profile/personal-info/lifestyle-info/LifestyleSettingsScreen';
import NotificationsScreen from '../../../features/profile/screens/settings/account-preferences/notifications/NotificationsScreen';
import DataSyncScreen from '../../../features/profile/screens/settings/data-privacy/data-sync/DataSyncScreen';
import PrivacySecurityScreen from '../../../features/profile/screens/settings/data-privacy/privacy-security/PrivacySecurityScreen';
import FamilyLinkScreen from '../../../features/profile/screens/settings/data-privacy/data-sync/FamilyLinkScreen';
import FamilyLinkConsentScreen from '../../../features/profile/screens/settings/data-privacy/data-sync/FamilyLinkConsentScreen';
import BiomarkerVisibilityScreen from '../../../features/profile/screens/settings/account-preferences/display-format/BiomarkerVisibilityScreen';

type StackType = ReturnType<typeof createStackNavigator<ProfileTabParamList>>;

export const SettingsScreens = (Stack: StackType) => (
  <>
    <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EmailPassword" component={EmailPasswordScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ConnectedDevices" component={ConnectedDevicesScreen} options={{ headerShown: false }} />
    <Stack.Screen name="DisplayFormat" component={DisplayFormatScreen} options={{ headerShown: false }} />
    <Stack.Screen name="LifestyleSettings" component={LifestyleSettingsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="DataSync" component={DataSyncScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} options={{ headerShown: false }} />
    <Stack.Screen name="FamilyLink" component={FamilyLinkScreen} options={{ headerShown: false }} />
    <Stack.Screen name="FamilyLinkConsent" component={FamilyLinkConsentScreen} options={{ headerShown: false }} />
    <Stack.Screen name="BiomarkerVisibility" component={BiomarkerVisibilityScreen} options={{ headerShown: false }} />
  </>
);
