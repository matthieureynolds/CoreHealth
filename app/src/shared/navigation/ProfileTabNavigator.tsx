import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
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
      }}
    >
      <CoreProfileScreens Stack={Stack} />
      <MedicalScreens Stack={Stack} />
      <SettingsScreens Stack={Stack} />
      <CommunityScreens Stack={Stack} />
      <LegalSupportScreens Stack={Stack} />
    </Stack.Navigator>
  );
};

export default ProfileTabNavigator;
