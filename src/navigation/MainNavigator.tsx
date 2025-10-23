import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types';

import {
  DashboardScreen,
  BodyMapScreen,
  TravelScreen,
} from '../screens';

import ProfileTabNavigator from './ProfileTabNavigator';
import HealthAssistantScreen from '../screens/HealthAssistantScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'home';
              break;
            case 'BodyMap':
              iconName = 'body';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            case 'HealthAssistant':
              iconName = 'chatbubbles';
              break;
            case 'Travel':
              iconName = 'airplane';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={focused ? 32 : 24} color={focused ? '#007AFF' : '#FFFFFF'} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: '#000000',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#000000',
          borderTopWidth: 0,
          height: 90,
          paddingTop: 8,
          paddingBottom: 25,
          elevation: 0,
          shadowOpacity: 0,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="BodyMap"
        component={BodyMapScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HealthAssistant"
        component={HealthAssistantScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Travel"
        component={TravelScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTabNavigator}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
