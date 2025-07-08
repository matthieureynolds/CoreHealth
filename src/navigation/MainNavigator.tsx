import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types';

import {
  DashboardScreen,
  BodyMapScreen,
  DevicesScreen,
  TravelScreen,
} from '../screens';

import ProfileTabNavigator from './ProfileTabNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'BodyMap':
              iconName = focused ? 'body' : 'body-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Devices':
              iconName = focused ? 'watch' : 'watch-outline';
              break;
            case 'Travel':
              iconName = focused ? 'airplane' : 'airplane-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerStyle: {
          backgroundColor: '#F8F9FA',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Health Dashboard' }}
      />
      <Tab.Screen
        name="BodyMap"
        component={BodyMapScreen}
        options={{ title: 'Body Map' }}
      />
      <Tab.Screen
        name="Devices"
        component={DevicesScreen}
        options={{ title: 'Connected Devices' }}
      />
      <Tab.Screen
        name="Travel"
        component={TravelScreen}
        options={{ title: 'Travel Health' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTabNavigator}
        options={{ title: 'My Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
