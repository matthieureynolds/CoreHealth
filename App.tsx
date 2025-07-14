import './src/utils/polyfills';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { HealthDataProvider } from './src/context/HealthDataContext';
import { SettingsProvider } from './src/context/SettingsContext';

export default function App() {
  useEffect(() => {
    console.log('🚀 CoreHealth App is starting up!');
    console.log('📱 App.tsx: Main App component has loaded');
    console.log('⚡ Setting up providers: Auth, HealthData, Navigation');

    return () => {
      console.log('👋 App is shutting down');
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SettingsProvider>
      <AuthProvider>
        <HealthDataProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </HealthDataProvider>
      </AuthProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
