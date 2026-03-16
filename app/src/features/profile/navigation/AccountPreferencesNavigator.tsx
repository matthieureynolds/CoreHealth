import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { AccountPreferencesStackParamList } from './types';
import { PROFILE_ROUTES } from './routeNames';

// Import screens
import AccountPreferencesScreen from '../screens/settings/account-preferences/AccountPreferencesScreen';
import EmailPasswordScreen from '../screens/settings/account-preferences/account-settings/email-password/EmailPasswordScreen';

const Stack = createStackNavigator<AccountPreferencesStackParamList>();

const AccountPreferencesNavigator: React.FC = () => {
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
        name={PROFILE_ROUTES.ACCOUNT_PREFERENCES}
        component={AccountPreferencesScreen}
        options={{
          title: 'Account & Preferences',
        }}
      />
      <Stack.Screen
        name={PROFILE_ROUTES.EMAIL_PASSWORD}
        component={EmailPasswordScreen}
        options={{
          title: 'Email & Password',
        }}
      />
      {/* Add more screens as needed */}
    </Stack.Navigator>
  );
};

export default AccountPreferencesNavigator;
