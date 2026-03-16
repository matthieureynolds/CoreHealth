import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { SettingsStackParamList } from './types';
import { PROFILE_ROUTES } from './routeNames';

// Import main settings screens
import SettingsHomeScreen from '../screens/settings/SettingsHomeScreen';
import AccountPreferencesNavigator from './AccountPreferencesNavigator';
import DataPrivacyNavigator from './DataPrivacyNavigator';
import SupportHelpNavigator from './SupportHelpNavigator';

const Stack = createStackNavigator<SettingsStackParamList>();

const SettingsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000000',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="SettingsHome"
        component={SettingsHomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={PROFILE_ROUTES.ACCOUNT_PREFERENCES}
        component={AccountPreferencesNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={PROFILE_ROUTES.DATA_PRIVACY}
        component={DataPrivacyNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={PROFILE_ROUTES.SUPPORT_HELP}
        component={SupportHelpNavigator}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
