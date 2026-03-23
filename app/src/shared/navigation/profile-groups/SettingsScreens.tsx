import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';

import AccountSettingsScreen from '../../../features/profile/screens/settings/account-preferences/AccountSettingsScreen';
import EmailPasswordScreen from '../../../features/profile/screens/settings/account-preferences/EmailPasswordScreen';
import ConnectedDevicesScreen from '../../../features/profile/screens/settings/account-preferences/ConnectedDevicesScreen';
import DisplayFormatScreen from '../../../features/profile/screens/settings/account-preferences/DisplayFormatScreen';
import LifestyleSettingsScreen from '../../../features/profile/screens/profile/personal-info/LifestyleSettingsScreen';
import NotificationsScreen from '../../../features/profile/screens/settings/account-preferences/NotificationsScreen';
import DataSyncScreen from '../../../features/profile/screens/settings/data-privacy/DataSyncScreen';
import PrivacySecurityScreen from '../../../features/profile/screens/settings/data-privacy/PrivacySecurityScreen';
import FamilyLinkScreen from '../../../features/profile/screens/settings/data-privacy/FamilyLinkScreen';
import FamilyLinkConsentScreen from '../../../features/profile/screens/settings/data-privacy/FamilyLinkConsentScreen';
import BiomarkerVisibilityScreen from '../../../features/profile/screens/settings/account-preferences/BiomarkerVisibilityScreen';

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
