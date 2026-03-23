import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';

import ProfileDetailsScreen from '../../../features/profile/screens/ProfileDetailsScreen';
import EditProfileScreen from '../../../features/profile/screens/EditProfileScreen';
import EditNameScreen from '../../../features/profile/screens/EditNameScreen';
import EditUsernameScreen from '../../../features/profile/screens/EditUsernameScreen';
import EditPhysicalStatsScreen from '../../../features/profile/screens/EditPhysicalStatsScreen';
import LifestyleInfoScreen from '../../../features/profile/screens/LifestyleInfoScreen';
import SymptomRegisteredScreen from '../../../features/profile/screens/SymptomRegisteredScreen';
import HealthIDsScreen from '../../../features/profile/screens/HealthIDsScreen';
import SettingsScreen from '../../../features/profile/screens/SettingsScreen';

type StackType = ReturnType<typeof createStackNavigator<ProfileTabParamList>>;

export const CoreProfileScreens: React.FC<{ Stack: StackType }> = ({ Stack }) => (
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
