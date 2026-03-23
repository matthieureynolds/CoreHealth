import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';

import ProfileDetailsScreen from '../../../features/profile/screens/profile/personal-info/ProfileDetailsScreen';
import EditProfileScreen from '../../../features/profile/screens/profile/personal-info/EditProfileScreen';
import EditNameScreen from '../../../features/profile/screens/profile/personal-info/EditNameScreen';
import EditUsernameScreen from '../../../features/profile/screens/profile/personal-info/EditUsernameScreen';
import EditPhysicalStatsScreen from '../../../features/profile/screens/profile/personal-info/EditPhysicalStatsScreen';
import LifestyleInfoScreen from '../../../features/profile/screens/profile/personal-info/LifestyleInfoScreen';
import SymptomRegisteredScreen from '../../../features/profile/screens/profile/personal-info/SymptomRegisteredScreen';
import HealthIDsScreen from '../../../features/profile/screens/profile/health-records/HealthIDsScreen';
import SettingsScreen from '../../../features/profile/screens/settings/SettingsScreen';

type StackType = ReturnType<typeof createStackNavigator<ProfileTabParamList>>;

export const CoreProfileScreens = (Stack: StackType) => (
  <>
    <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    <Stack.Screen name="EditName" component={EditNameScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EditUsername" component={EditUsernameScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EditPhysicalStats" component={EditPhysicalStatsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="LifestyleInfo" component={LifestyleInfoScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SymptomRegistered" component={SymptomRegisteredScreen} options={{ headerShown: false }} />
    <Stack.Screen name="HealthIDs" component={HealthIDsScreen} options={{ headerShown: false }} />
  </>
);
