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
  SettingsAction,
  defaultSettings,
  GeneralSettings,
  NotificationSettings,
  PrivacySecuritySettings,
  DataSyncSettings,
  HealthEmergencySettings,
  TravelSettings,
  AccessibilitySettings,
  BiomarkerSettings,
  AppSettings,
} from '../types/settings';

interface SettingsContextType {
  settings: UserSettings;
  isLoading: boolean;
  
  // General actions
  updateGeneralSettings: (updates: Partial<GeneralSettings>) => Promise<void>;
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => Promise<void>;
  updatePrivacySettings: (updates: Partial<PrivacySecuritySettings>) => Promise<void>;
  updateDataSyncSettings: (updates: Partial<DataSyncSettings>) => Promise<void>;
  updateHealthEmergencySettings: (updates: Partial<HealthEmergencySettings>) => Promise<void>;
  updateTravelSettings: (updates: Partial<TravelSettings>) => Promise<void>;
  updateAccessibilitySettings: (updates: Partial<AccessibilitySettings>) => Promise<void>;
  updateBiomarkerSettings: (updates: Partial<BiomarkerSettings>) => Promise<void>;
  updateAppSettings: (updates: Partial<AppSettings>) => Promise<void>;
  
  // Utility actions
  resetSettings: () => Promise<void>;
  exportSettings: () => Promise<string>;
  importSettings: (settingsJson: string) => Promise<boolean>;
  
  // Specific functionality
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

// Settings reducer
function settingsReducer(state: UserSettings, action: SettingsAction): UserSettings {
  switch (action.type) {
    case 'UPDATE_GENERAL':
      return {
        ...state,
        general: { ...state.general, ...action.payload },
      };
    case 'UPDATE_NOTIFICATIONS':
      return {
        ...state,
        notifications: { ...state.notifications, ...action.payload },
      };
    case 'UPDATE_PRIVACY':
      return {
        ...state,
        privacy: { ...state.privacy, ...action.payload },
      };
    case 'UPDATE_DATA_SYNC':
      return {
        ...state,
        dataSync: { ...state.dataSync, ...action.payload },
      };
    case 'UPDATE_HEALTH_EMERGENCY':
      return {
        ...state,
        healthEmergency: { ...state.healthEmergency, ...action.payload },
      };
    case 'UPDATE_TRAVEL':
      return {
        ...state,
        travel: { ...state.travel, ...action.payload },
      };
    case 'UPDATE_ACCESSIBILITY':
      return {
        ...state,
        accessibility: { ...state.accessibility, ...action.payload },
      };
    case 'UPDATE_BIOMARKERS':
      return {
        ...state,
        biomarkers: { ...state.biomarkers, ...action.payload },
      };
    case 'UPDATE_APP':
      return {
        ...state,
        app: { ...state.app, ...action.payload },
      };
    case 'RESET_SETTINGS':
      return defaultSettings;
    case 'LOAD_SETTINGS':
      return action.payload;
    default:
      return state;
  }
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, dispatch] = useReducer(settingsReducer, defaultSettings);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load settings on app start
  useEffect(() => {
    loadSettings();
  }, []);

  // Apply settings when they change
  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  const loadSettings = async () => {
    try {
      console.log('⚙️ Loading user settings...');
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        
        // Merge with default settings to handle new settings added in updates
        const mergedSettings = mergeWithDefaults(parsedSettings, defaultSettings);
        
        dispatch({ type: 'LOAD_SETTINGS', payload: mergedSettings });
        console.log('✅ Settings loaded successfully');
      } else {
        console.log('📱 Using default settings (first launch)');
      }
    } catch (error) {
      console.error('❌ Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      console.log('💾 Settings saved to storage');
    } catch (error) {
      console.error('❌ Error saving settings:', error);
    }
  };

  const applySettings = async (currentSettings: UserSettings) => {
    // Apply theme
    if (currentSettings.general.theme !== 'auto') {
      Appearance.setColorScheme(currentSettings.general.theme as ColorSchemeName);
    }

    // Configure notifications
    if (currentSettings.notifications.enabled) {
      await configureNotifications(currentSettings.notifications);
    }

    // Apply accessibility settings
    applyAccessibilitySettings(currentSettings.accessibility);
  };

  const configureNotifications = async (notifSettings: NotificationSettings) => {
    try {
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: notifSettings.enabled,
          shouldPlaySound: notifSettings.enabled,
          shouldSetBadge: notifSettings.enabled,
        }),
      });
    } catch (error) {
      console.error('Error configuring notifications:', error);
    }
  };

  const applyAccessibilitySettings = (accessibilitySettings: AccessibilitySettings) => {
    // Apply font scaling, contrast, etc.
    // This would require additional implementation based on React Native accessibility APIs
    console.log('🎯 Applying accessibility settings:', accessibilitySettings);
  };

  // Settings update functions
  const updateGeneralSettings = async (updates: Partial<GeneralSettings>) => {
    const newSettings = { ...settings };
    newSettings.general = { ...newSettings.general, ...updates };
    
    dispatch({ type: 'UPDATE_GENERAL', payload: updates });
    await saveSettings(newSettings);
  };

  const updateNotificationSettings = async (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings };
    newSettings.notifications = { ...newSettings.notifications, ...updates };
    
    dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: updates });
    await saveSettings(newSettings);
  };

  const updatePrivacySettings = async (updates: Partial<PrivacySecuritySettings>) => {
    const newSettings = { ...settings };
    newSettings.privacy = { ...newSettings.privacy, ...updates };
    
    dispatch({ type: 'UPDATE_PRIVACY', payload: updates });
    await saveSettings(newSettings);
  };

  const updateDataSyncSettings = async (updates: Partial<DataSyncSettings>) => {
    const newSettings = { ...settings };
    newSettings.dataSync = { ...newSettings.dataSync, ...updates };
    
    dispatch({ type: 'UPDATE_DATA_SYNC', payload: updates });
    await saveSettings(newSettings);
  };

  const updateHealthEmergencySettings = async (updates: Partial<HealthEmergencySettings>) => {
    const newSettings = { ...settings };
    newSettings.healthEmergency = { ...newSettings.healthEmergency, ...updates };
    
    dispatch({ type: 'UPDATE_HEALTH_EMERGENCY', payload: updates });
    await saveSettings(newSettings);
  };

  const updateTravelSettings = async (updates: Partial<TravelSettings>) => {
    const newSettings = { ...settings };
    newSettings.travel = { ...newSettings.travel, ...updates };
    
    dispatch({ type: 'UPDATE_TRAVEL', payload: updates });
    await saveSettings(newSettings);
  };

  const updateAccessibilitySettings = async (updates: Partial<AccessibilitySettings>) => {
    const newSettings = { ...settings };
    newSettings.accessibility = { ...newSettings.accessibility, ...updates };
    
    dispatch({ type: 'UPDATE_ACCESSIBILITY', payload: updates });
    await saveSettings(newSettings);
  };

  const updateBiomarkerSettings = async (updates: Partial<BiomarkerSettings>) => {
    const newSettings = { ...settings };
    newSettings.biomarkers = { ...newSettings.biomarkers, ...updates };
    
    dispatch({ type: 'UPDATE_BIOMARKERS', payload: updates });
    await saveSettings(newSettings);
  };

  const updateAppSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings };
    newSettings.app = { ...newSettings.app, ...updates };
    
    dispatch({ type: 'UPDATE_APP', payload: updates });
    await saveSettings(newSettings);
  };

  // Utility functions
  const resetSettings = async () => {
    dispatch({ type: 'RESET_SETTINGS' });
    await saveSettings(defaultSettings);
  };

  const exportSettings = async (): Promise<string> => {
    return JSON.stringify(settings, null, 2);
  };

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
    const newTheme = settings.general.theme === 'light' ? 'dark' : 
                     settings.general.theme === 'dark' ? 'auto' : 'light';
    
    await updateGeneralSettings({ theme: newTheme });
  };

  const setupBiometricAuth = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware || !isEnrolled) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric authentication for CoreHealth',
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
          title: 'CoreHealth Test',
          body: 'Notifications are working correctly!',
          data: { type: 'test' },
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const value: SettingsContextType = {
    settings,
    isLoading,
    updateGeneralSettings,
    updateNotificationSettings,
    updatePrivacySettings,
    updateDataSyncSettings,
    updateHealthEmergencySettings,
    updateTravelSettings,
    updateAccessibilitySettings,
    updateBiomarkerSettings,
    updateAppSettings,
    resetSettings,
    exportSettings,
    importSettings,
    toggleTheme,
    setupBiometricAuth,
    scheduleNotificationPermissions,
    testNotification,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Utility function to merge imported settings with defaults
function mergeWithDefaults(imported: any, defaults: UserSettings): UserSettings {
  const merged = { ...defaults };
  
  Object.keys(defaults).forEach(category => {
    if (imported[category] && typeof imported[category] === 'object') {
      merged[category as keyof UserSettings] = {
        ...defaults[category as keyof UserSettings],
        ...imported[category],
      };
    }
  });
  
  return merged;
}

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsProvider; 