import 'react-native-get-random-values'; // must be first — Amplify crypto dependency
import '@aws-amplify/react-native'; // React Native adapter for Amplify
import './src/shared/utils/polyfills';
import './src/shared/config/amplify'; // configure Amplify before anything else
import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer, NavigationContainerRef, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { LogBox } from 'react-native';

// ─── TEMP DEMO ──────────────────────────────────────────────────────────────
// AWS backend is offline, so backend-dependent screens log errors that would
// otherwise pop the red dev overlay and interrupt a demo. Suppress overlays
// while demoing. REMOVE this line when the backend is restored.
LogBox.ignoreAllLogs();

import RootNavigator from './src/shared/navigation/RootNavigator';
import { AuthProvider } from './src/shared/context/AuthContext';
import { HealthDataProvider } from './src/shared/context/HealthDataContext';
import { SettingsProvider } from './src/shared/context/SettingsContext';
import BedtimeReminderModal from './src/shared/components/modals/BedtimeReminderModal';
import { useBedtimeReminder } from './src/shared/hooks/useBedtimeReminder';
import { RootStackParamList } from './src/shared/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

function handleNotificationTap(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data as any;
  if (!navigationRef.isReady()) return;
  if (data?.type === 'health_alert') {
    // Navigate to Main → Home tab which shows the dashboard with alert banners
    navigationRef.navigate('Main' as any);
  }
}

const AppContent: React.FC = () => {
  const { showModal, type, bedtime } = useBedtimeReminder();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (showModal && type) setModalVisible(true);
  }, [showModal, type]);

  // Handle notification taps (foreground + background)
  useEffect(() => {
    // Cold-start: app was killed, user tapped a notification
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) handleNotificationTap(response);
    });

    // App is running (foreground or background)
    const sub = Notifications.addNotificationResponseReceivedListener(handleNotificationTap);
    return () => sub.remove();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
      <StatusBar style="light" backgroundColor="#111" />
      <BedtimeReminderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
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
  container: { flex: 1, backgroundColor: '#fff' },
});
