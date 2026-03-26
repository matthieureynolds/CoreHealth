import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import {
  UserSettings,
  defaultSettings,
  GeneralSettings,
  NotificationSettings,
  PrivacySecuritySettings,
  DataSyncSettings,
  HealthEmergencySettings,
  TravelSettings,
  AccessibilitySettings,
  LifestyleSettings,
  BiomarkerSettings,
  AppSettings,
} from '../types/settings';
import { HealthAssistantService } from '../services/ai/healthAssistantService';
import { refreshUserSnapshot } from '../services/user/userSnapshotService';
import { settingsReducer, mergeWithDefaults } from './settingsHelpers';

interface SettingsContextType {
  settings: UserSettings;
  isLoading: boolean;
  updateGeneralSettings: (updates: Partial<GeneralSettings>) => Promise<void>;
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => Promise<void>;
  updatePrivacySettings: (updates: Partial<PrivacySecuritySettings>) => Promise<void>;
  updateDataSyncSettings: (updates: Partial<DataSyncSettings>) => Promise<void>;
  updateHealthEmergencySettings: (updates: Partial<HealthEmergencySettings>) => Promise<void>;
  updateTravelSettings: (updates: Partial<TravelSettings>) => Promise<void>;
  updateAccessibilitySettings: (updates: Partial<AccessibilitySettings>) => Promise<void>;
  updateLifestyleSettings: (updates: Partial<LifestyleSettings>) => Promise<void>;
  updateBiomarkerSettings: (updates: Partial<BiomarkerSettings>) => Promise<void>;
  updateAppSettings: (updates: Partial<AppSettings>) => Promise<void>;
  updateSettings: (category: keyof UserSettings, updates: any) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportSettings: () => Promise<string>;
  importSettings: (settingsJson: string) => Promise<boolean>;
  toggleTheme: () => Promise<void>;
  setupBiometricAuth: () => Promise<boolean>;
  scheduleNotificationPermissions: () => Promise<boolean>;
  testNotification: () => Promise<void>;
}

interface SettingsProviderProps {
  children: ReactNode;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = '@corehealth_settings';

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, dispatch] = useReducer(settingsReducer, defaultSettings);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => { loadSettings(); }, []);
  useEffect(() => { applySettings(settings); }, [settings]);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        const mergedSettings = mergeWithDefaults(parsedSettings, defaultSettings);
        dispatch({ type: 'LOAD_SETTINGS', payload: mergedSettings });
        try {
          await HealthAssistantService.syncSettingsSnapshot(mergedSettings);
          await refreshUserSnapshot();
        } catch { /* non-fatal */ }
      } else {
        try {
          await HealthAssistantService.syncSettingsSnapshot(defaultSettings);
          await refreshUserSnapshot();
        } catch { /* non-fatal */ }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      try {
        await HealthAssistantService.syncSettingsSnapshot(newSettings);
        await refreshUserSnapshot();
      } catch { /* non-fatal */ }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const applySettings = async (currentSettings: UserSettings) => {
    if (currentSettings.general.theme !== 'auto') {
      Appearance.setColorScheme(currentSettings.general.theme as ColorSchemeName);
    }
    if (currentSettings.notifications.enabled) {
      await configureNotifications(currentSettings.notifications);
    }
    applyAccessibilitySettings(currentSettings.accessibility);
  };

  const configureNotifications = async (notifSettings: NotificationSettings) => {
    try {
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: notifSettings.enabled,
          shouldPlaySound: notifSettings.enabled,
          shouldSetBadge: notifSettings.enabled,
          shouldShowBanner: notifSettings.enabled,
          shouldShowList: notifSettings.enabled,
        }),
      });
    } catch (error) {
      console.error('Error configuring notifications:', error);
    }
  };

  const applyAccessibilitySettings = (_accessibilitySettings: AccessibilitySettings) => {
    // Reserved for future React Native accessibility API integration
  };

  const updateGeneralSettings = async (updates: Partial<GeneralSettings>) => {
    const newSettings = { ...settings, general: { ...settings.general, ...updates } };
    dispatch({ type: 'UPDATE_GENERAL', payload: updates });
    await saveSettings(newSettings);
  };

  const updateNotificationSettings = async (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, notifications: { ...settings.notifications, ...updates } };
    dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: updates });
    await saveSettings(newSettings);
  };

  const updatePrivacySettings = async (updates: Partial<PrivacySecuritySettings>) => {
    const newSettings = { ...settings, privacy: { ...settings.privacy, ...updates } };
    dispatch({ type: 'UPDATE_PRIVACY', payload: updates });
    await saveSettings(newSettings);
  };

  const updateDataSyncSettings = async (updates: Partial<DataSyncSettings>) => {
    const newSettings = { ...settings, dataSync: { ...settings.dataSync, ...updates } };
    dispatch({ type: 'UPDATE_DATA_SYNC', payload: updates });
    await saveSettings(newSettings);
  };

  const updateHealthEmergencySettings = async (updates: Partial<HealthEmergencySettings>) => {
    const newSettings = { ...settings, healthEmergency: { ...settings.healthEmergency, ...updates } };
    dispatch({ type: 'UPDATE_HEALTH_EMERGENCY', payload: updates });
    await saveSettings(newSettings);
  };

  const updateTravelSettings = async (updates: Partial<TravelSettings>) => {
    const newSettings = { ...settings, travel: { ...settings.travel, ...updates } };
    dispatch({ type: 'UPDATE_TRAVEL', payload: updates });
    await saveSettings(newSettings);
  };

  const updateAccessibilitySettings = async (updates: Partial<AccessibilitySettings>) => {
    const newSettings = { ...settings, accessibility: { ...settings.accessibility, ...updates } };
    dispatch({ type: 'UPDATE_ACCESSIBILITY', payload: updates });
    await saveSettings(newSettings);
  };

  const updateLifestyleSettings = async (updates: Partial<LifestyleSettings>) => {
    const newSettings = { ...settings, lifestyle: { ...settings.lifestyle, ...updates } };
    dispatch({ type: 'UPDATE_LIFESTYLE', payload: updates });
    await saveSettings(newSettings);
  };

  const updateBiomarkerSettings = async (updates: Partial<BiomarkerSettings>) => {
    const newSettings = { ...settings, biomarkers: { ...settings.biomarkers, ...updates } };
    dispatch({ type: 'UPDATE_BIOMARKERS', payload: updates });
    await saveSettings(newSettings);
  };

  const updateAppSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, app: { ...settings.app, ...updates } };
    dispatch({ type: 'UPDATE_APP', payload: updates });
    await saveSettings(newSettings);
  };

  const updateSettings = async (category: keyof UserSettings, updates: any) => {
    const newSettings = { ...settings, [category]: { ...settings[category], ...updates } };
    dispatch({ type: `UPDATE_${category.toUpperCase()}` as any, payload: updates });
    await saveSettings(newSettings);
  };

  const resetSettings = async () => {
    dispatch({ type: 'RESET_SETTINGS' });
    await saveSettings(defaultSettings);
  };

  const exportSettings = async (): Promise<string> => JSON.stringify(settings, null, 2);

  const importSettings = async (settingsJson: string): Promise<boolean> => {
    try {
      const importedSettings = JSON.parse(settingsJson);
      const mergedSettings = mergeWithDefaults(importedSettings, defaultSettings);
      dispatch({ type: 'LOAD_SETTINGS', payload: mergedSettings });
      await saveSettings(mergedSettings);
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  };

  const toggleTheme = async () => {
    const newTheme = settings.general.theme === 'light' ? 'dark'
      : settings.general.theme === 'dark' ? 'auto' : 'light';
    await updateGeneralSettings({ theme: newTheme });
  };

  const setupBiometricAuth = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) return false;
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric authentication for TOTO',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use passcode',
      });
      if (result.success) {
        await updatePrivacySettings({ biometricAuth: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting up biometric auth:', error);
      return false;
    }
  };

  const scheduleNotificationPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  const testNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'TOTO Test',
          body: 'Notifications are working correctly!',
          data: { type: 'test' },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const value: SettingsContextType = {
    settings, isLoading,
    updateGeneralSettings, updateNotificationSettings, updatePrivacySettings,
    updateDataSyncSettings, updateHealthEmergencySettings, updateTravelSettings,
    updateAccessibilitySettings, updateLifestyleSettings, updateBiomarkerSettings,
    updateAppSettings, updateSettings, resetSettings, exportSettings, importSettings,
    toggleTheme, setupBiometricAuth, scheduleNotificationPermissions, testNotification,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsProvider;
