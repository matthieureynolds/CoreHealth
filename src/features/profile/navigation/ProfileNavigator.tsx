import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ProfileStackParamList } from './types';
import { PROFILE_ROUTES } from './routeNames';

// Import screens
import ProfileHomeScreen from '../screens/ProfileHomeScreen';
import SettingsNavigator from './SettingsNavigator';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator<ProfileStackParamList>();

// Profile Tabs Navigator
const ProfileTabsNavigator: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['top']}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#888',
          tabBarIndicatorStyle: {
            backgroundColor: '#007AFF',
          },
          tabBarStyle: {
            backgroundColor: '#000000',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          tabBarLabelStyle: {
            fontSize: 15,
            fontWeight: '600',
            textTransform: 'none',
          },
        }}
      >
        <Tab.Screen
          name={PROFILE_ROUTES.PROFILE_HOME}
          component={ProfileHomeScreen}
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }: { color: string }) => (
              <Ionicons name="person" size={18} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name={PROFILE_ROUTES.SETTINGS_HOME}
          component={SettingsNavigator}
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }: { color: string }) => (
              <Ionicons name="settings" size={18} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

// Main Profile Navigator
const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileTabs" component={ProfileTabsNavigator} />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
