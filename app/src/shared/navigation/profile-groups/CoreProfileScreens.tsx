import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';

import ProfileDetailsScreen from '../../../features/profile/screens/profile/personal-info/ProfileDetailsScreen';
import EditProfileScreen from '../../../features/profile/screens/profile/personal-info/EditProfileScreen';
import EditNameScreen from '../../../features/profile/screens/profile/personal-info/name/EditNameScreen';
import EditUsernameScreen from '../../../features/profile/screens/profile/personal-info/name/EditUsernameScreen';
import EditPhysicalStatsScreen from '../../../features/profile/screens/profile/personal-info/physical-stats/EditPhysicalStatsScreen';
import LifestyleInfoScreen from '../../../features/profile/screens/profile/personal-info/lifestyle-info/LifestyleInfoScreen';
import SymptomRegisteredScreen from '../../../features/profile/screens/profile/health-records/symptoms/SymptomRegisteredScreen';
import HealthIDsScreen from '../../../features/profile/screens/profile/personal-info/linked-health-id/HealthIDsScreen';
import SettingsScreen from '../../../features/profile/screens/settings/SettingsScreen';
import ProfilePictureScreen from '../../../features/profile/screens/profile/personal-info/profile-picture/ProfilePictureScreen';

type StackType = ReturnType<typeof createStackNavigator<ProfileTabParamList>>;

export const CoreProfileScreens = (Stack: StackType) => (
  <>
    <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: true, title: 'Edit Profile' }} />
    <Stack.Screen name="EditName" component={EditNameScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EditUsername" component={EditUsernameScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EditPhysicalStats" component={EditPhysicalStatsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="LifestyleInfo" component={LifestyleInfoScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SymptomRegistered" component={SymptomRegisteredScreen} options={{ headerShown: false }} />
    <Stack.Screen name="HealthIDs" component={HealthIDsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ProfilePicture" component={ProfilePictureScreen} options={{ headerShown: false }} />
  </>
);
