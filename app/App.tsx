import 'react-native-get-random-values'; // must be first — Amplify crypto dependency
import '@aws-amplify/react-native'; // React Native adapter for Amplify
import './src/shared/utils/polyfills';
import './src/shared/config/amplify'; // configure Amplify before anything else
import React, { useEffect, useState } from 'react';import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import RootNavigator from './src/shared/navigation/RootNavigator';
import { AuthProvider } from './src/shared/context/AuthContext';
import { HealthDataProvider } from './src/shared/context/HealthDataContext';
import { SettingsProvider } from './src/shared/context/SettingsContext';
import BedtimeReminderModal from './src/shared/components/modals/BedtimeReminderModal';
import { useBedtimeReminder } from './src/shared/hooks/useBedtimeReminder';

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
