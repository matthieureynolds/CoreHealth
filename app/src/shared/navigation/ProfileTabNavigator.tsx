import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileTabParamList } from '../types';
import { colors } from '../theme/colors';

import { CoreProfileScreens } from './profile-groups/CoreProfileScreens';
import { MedicalScreens } from './profile-groups/MedicalScreens';
import { SettingsScreens } from './profile-groups/SettingsScreens';
import { CommunityScreens } from './profile-groups/CommunityScreens';
import { LegalSupportScreens } from './profile-groups/LegalSupportScreens';

const Stack = createStackNavigator<ProfileTabParamList>();

const ProfileTabNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
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
        headerBackTitle: '',
        headerBackImage: () => (
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} style={{ marginLeft: 8 }} />
        ),
      }}
    >
      {CoreProfileScreens(Stack)}
      {MedicalScreens(Stack)}
      {SettingsScreens(Stack)}
      {CommunityScreens(Stack)}
      {LegalSupportScreens(Stack)}
    </Stack.Navigator>
  );
};

export default ProfileTabNavigator;
