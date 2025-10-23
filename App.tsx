import './src/utils/polyfills';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { HealthDataProvider } from './src/context/HealthDataContext';
import { SettingsProvider } from './src/context/SettingsContext';
import BedtimeReminderModal from './src/components/BedtimeReminderModal';
import { useBedtimeReminder } from './src/hooks/useBedtimeReminder';

const AppContent: React.FC = () => {
  const { showModal, type, bedtime } = useBedtimeReminder();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (showModal && type) {
      setModalVisible(true);
    }
  }, [showModal, type]);

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style="light" backgroundColor="#111" />
      <BedtimeReminderModal
        visible={modalVisible}
        onClose={handleCloseModal}
        type={type || 'bedtime'}
        bedtime={bedtime}
      />
    </NavigationContainer>
  );
};

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
        <AuthProvider>
          <HealthDataProvider>
            <AppContent />
          </HealthDataProvider>
        </AuthProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});
