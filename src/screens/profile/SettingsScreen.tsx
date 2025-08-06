import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import SettingsPicker from '../../components/SettingsPicker';

type SettingsScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { signOut, user } = useAuth();
  const {
    settings,
    isLoading,
    updateGeneralSettings,
    updateNotificationSettings,
    updatePrivacySettings,
    updateDataSyncSettings,
    updateTravelSettings,
    updateAccessibilitySettings,
    updateBiomarkerSettings,
    updateAppSettings,
    toggleTheme,
    setupBiometricAuth,
    scheduleNotificationPermissions,
    testNotification,
    resetSettings,
    exportSettings,
  } = useSettings();

  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Picker states
  const [activePicker, setActivePicker] = useState<string | null>(null);
  
  // Picker options
  const unitsOptions = [
    { value: 'metric', label: 'Metric', description: 'Celsius, kg, cm' },
    { value: 'imperial', label: 'Imperial', description: 'Fahrenheit, lbs, ft' },
  ];
  
  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', description: '31/12/2024' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', description: '12/31/2024' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', description: '2024-12-31' },
  ];
  
  const timeFormatOptions = [
    { value: '12h', label: '12-Hour', description: '1:30 PM' },
    { value: '24h', label: '24-Hour', description: '13:30' },
  ];
  
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
  ];
  
  const themeOptions = [
    { value: 'light', label: 'Light', description: 'Use light theme always' },
    { value: 'dark', label: 'Dark', description: 'Use dark theme always' },
    { value: 'auto', label: 'Automatic', description: 'Match system setting' },
  ];
  
  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'extra-large', label: 'Extra Large' },
  ];
  
  const sessionTimeoutOptions = [
    { value: '15min', label: '15 minutes' },
    { value: '30min', label: '30 minutes' },
    { value: '1hour', label: '1 hour' },
    { value: '4hours', label: '4 hours' },
    { value: 'never', label: 'Never' },
  ];
  
  const syncFrequencyOptions = [
    { value: '5min', label: '5 minutes' },
    { value: '15min', label: '15 minutes' },
    { value: '30min', label: '30 minutes' },
    { value: '1hour', label: '1 hour' },
    { value: '4hours', label: '4 hours' },
    { value: 'manual', label: 'Manual only' },
  ];

  const healthGoalOptions = [
    { value: 'general_wellness', label: 'General Wellness', description: 'Balanced health monitoring for everyday life' },
    { value: 'longevity', label: 'Longevity', description: 'Focus on long-term health optimization' },
    { value: 'athletic', label: 'Athletic Performance', description: 'Optimized for athletes and active individuals' },
    { value: 'disease_monitoring', label: 'Disease Monitoring', description: 'Enhanced tracking for specific health conditions' },
    { value: 'custom', label: 'Custom Goals', description: 'Create your own personalized health targets' },
  ];

  const biomarkerSortOptions = [
    { value: 'category', label: 'By Category', description: 'Group biomarkers by health system' },
    { value: 'alphabetical', label: 'Alphabetical', description: 'Sort A to Z' },
    { value: 'last_updated', label: 'Last Updated', description: 'Most recently updated first' },
    { value: 'risk_level', label: 'Risk Level', description: 'Highest risk first' },
    { value: 'custom', label: 'Custom Order', description: 'Drag to reorder manually' },
  ];

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleBiometricSetup = async () => {
    const success = await setupBiometricAuth();
    if (success) {
      Alert.alert('Success', 'Biometric authentication has been enabled!');
    } else {
      Alert.alert('Error', 'Could not set up biometric authentication. Please check your device settings.');
    }
  };

  const handleTestNotification = async () => {
    await testNotification();
    Alert.alert('Test Sent', 'Check your notifications!');
  };

  const handleExportSettings = async () => {
    const settingsJson = await exportSettings();
    Alert.alert(
      'Export Settings',
      'Settings exported to clipboard!',
      [{ text: 'OK' }]
    );
    console.log('Exported settings:', settingsJson);
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset All Settings',
      'This will reset all settings to their default values. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetSettings },
      ]
    );
  };

  // Picker handlers
  const handlePickerSelect = (pickerType: string, value: string) => {
    switch (pickerType) {
      case 'units':
        updateGeneralSettings({ units: value as any });
        break;
      case 'dateFormat':
        updateGeneralSettings({ dateFormat: value as any });
        break;
      case 'timeFormat':
        updateGeneralSettings({ timeFormat: value as any });
        break;
      case 'language':
        updateGeneralSettings({ language: value as any });
        break;
      case 'theme':
        updateGeneralSettings({ theme: value as any });
        break;
      case 'fontSize':
        updateAccessibilitySettings({ fontSize: value as any });
        break;
      case 'sessionTimeout':
        updatePrivacySettings({ sessionTimeout: value as any });
        break;
      case 'syncFrequency':
        updateDataSyncSettings({ syncFrequency: value as any });
        break;
      case 'healthGoalPreset':
        updateBiomarkerSettings({ healthGoalPreset: value as any });
        break;
      case 'biomarkerSort':
        updateBiomarkerSettings({ 
          displaySettings: { 
            ...settings.biomarkers.displaySettings, 
            sortBy: value as any 
          } 
        });
        break;
    }
    setActivePicker(null);
  };

  const getCurrentPickerOptions = () => {
    switch (activePicker) {
      case 'units': return unitsOptions;
      case 'dateFormat': return dateFormatOptions;
      case 'timeFormat': return timeFormatOptions;
      case 'language': return languageOptions;
      case 'theme': return themeOptions;
      case 'fontSize': return fontSizeOptions;
      case 'sessionTimeout': return sessionTimeoutOptions;
      case 'syncFrequency': return syncFrequencyOptions;
      case 'healthGoalPreset': return healthGoalOptions;
      case 'biomarkerSort': return biomarkerSortOptions;
      default: return [];
    }
  };

  const getCurrentPickerValue = () => {
    switch (activePicker) {
      case 'units': return settings.general.units;
      case 'dateFormat': return settings.general.dateFormat;
      case 'timeFormat': return settings.general.timeFormat;
      case 'language': return settings.general.language;
      case 'theme': return settings.general.theme;
      case 'fontSize': return settings.accessibility.fontSize;
      case 'sessionTimeout': return settings.privacy.sessionTimeout;
      case 'syncFrequency': return settings.dataSync.syncFrequency;
      case 'healthGoalPreset': return settings.biomarkers.healthGoalPreset;
      case 'biomarkerSort': return settings.biomarkers.displaySettings.sortBy;
      default: return '';
    }
  };

  const getCurrentPickerTitle = () => {
    switch (activePicker) {
      case 'units': return 'Units';
      case 'dateFormat': return 'Date Format';
      case 'timeFormat': return 'Time Format';
      case 'language': return 'Language';
      case 'theme': return 'Theme';
      case 'fontSize': return 'Font Size';
      case 'sessionTimeout': return 'Session Timeout';
      case 'syncFrequency': return 'Sync Frequency';
      case 'healthGoalPreset': return 'Health Goal Preset';
      case 'biomarkerSort': return 'Biomarker Sort Order';
      default: return '';
    }
  };

  const SettingsItem = ({ 
    icon, 
    title, 
    value, 
    onPress, 
    showChevron = true,
    rightElement,
    subtitle,
    iconColor = "#007AFF",
  }: any) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <Ionicons name={icon} size={22} color={iconColor} style={styles.settingsIcon} />
        <View>
          <Text style={styles.settingsItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {rightElement || (
          <>
            {value && <Text style={styles.settingsItemValue}>{value}</Text>}
            {showChevron && <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />}
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Settings Header */}
        <View style={styles.settingsHeader}>
          <Text style={styles.settingsTitle}>Settings</Text>
          <Text style={styles.settingsSubtitle}>Customize your CoreHealth experience</Text>
        </View>

        {/* General Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>GENERAL SETTINGS</Text>
          <SettingsItem
            icon="scale-outline"
            title="Units"
            value={settings.general.units === 'metric' ? 'Metric' : 'Imperial'}
            onPress={() => setActivePicker('units')}
            iconColor="#FF9500"
          />
          <SettingsItem
            icon="calendar-outline"
            title="Date Format"
            value={settings.general.dateFormat}
            onPress={() => setActivePicker('dateFormat')}
            iconColor="#4CD964"
          />
          <SettingsItem
            icon="time-outline"
            title="Time Format"
            value={settings.general.timeFormat === '12h' ? '12-Hour' : '24-Hour'}
            onPress={() => setActivePicker('timeFormat')}
            iconColor="#007AFF"
          />
          <SettingsItem
            icon="language-outline"
            title="Language"
            value={settings.general.language || 'English'}
            onPress={() => setActivePicker('language')}
            iconColor="#6BCF7F"
          />
        </View>

        {/* Appearance & Accessibility Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>APPEARANCE & ACCESSIBILITY</Text>
          <SettingsItem
            icon="color-palette-outline"
            title="Theme"
            value={settings.general.theme === 'auto' ? 'Automatic' : settings.general.theme === 'light' ? 'Light' : 'Dark'}
            onPress={() => setActivePicker('theme')}
            iconColor="#FF9500"
          />
          <SettingsItem
            icon="text-outline"
            title="Font Size"
            value={settings.accessibility.fontSize}
            onPress={() => setActivePicker('fontSize')}
            iconColor="#4CD964"
          />
          <SettingsItem
            icon="contrast-outline"
            title="High Contrast"
            rightElement={
              <Switch
                value={settings.accessibility.highContrast}
                onValueChange={(value) => updateAccessibilitySettings({ highContrast: value })}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
            iconColor="#007AFF"
          />
        </View>

        {/* Notifications Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>NOTIFICATIONS</Text>
          <SettingsItem
            icon="medical-outline"
            title="Health Alerts"
            rightElement={
              <Switch
                value={settings.notifications.biomarkerAlerts}
                onValueChange={(value) => updateNotificationSettings({ biomarkerAlerts: value })}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
            iconColor="#FF9500"
          />
          <SettingsItem
            icon="test-tube-outline"
            title="Lab Results"
            rightElement={
              <Switch
                value={settings.notifications.healthSummaries}
                onValueChange={(value) => updateNotificationSettings({ healthSummaries: value })}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
            iconColor="#4CD964"
          />
          <SettingsItem
            icon="airplane-outline"
            title="Travel Alerts"
            rightElement={
              <Switch
                value={settings.notifications.travelWarnings}
                onValueChange={(value) => updateNotificationSettings({ travelWarnings: value })}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
            iconColor="#007AFF"
          />
        </View>

        {/* Health & Biomarkers Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>HEALTH & BIOMARKERS</Text>
          <SettingsItem
            icon="target-outline"
            title="Goal"
            value={settings.biomarkers.healthGoalPreset}
            onPress={() => setActivePicker('healthGoalPreset')}
            iconColor="#FF9500"
          />
          <SettingsItem
            icon="list-outline"
            title="Display Sort"
            value={settings.biomarkers.displaySettings.sortBy}
            onPress={() => setActivePicker('biomarkerSort')}
            iconColor="#4CD964"
          />
          <SettingsItem
            icon="eye-outline"
            title="Show Trends"
            rightElement={
              <Switch
                value={settings.biomarkers.displaySettings.showTrends}
                onValueChange={(value) => updateBiomarkerSettings({ 
                  displaySettings: { 
                    ...settings.biomarkers.displaySettings, 
                    showTrends: value 
                  } 
                })}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
            iconColor="#007AFF"
          />
        </View>

        {/* Travel Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>TRAVEL SETTINGS</Text>
          <SettingsItem
            icon="location-outline"
            title="Auto Location"
            rightElement={
              <Switch
                value={settings.travel.autoLocationDetection}
                onValueChange={(value) => updateTravelSettings({ autoLocationDetection: value })}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
            iconColor="#FF9500"
          />
          <SettingsItem
            icon="time-outline"
            title="Jet Lag"
            rightElement={
              <Switch
                value={settings.travel.autoEnableTravelHealth}
                onValueChange={(value) => updateTravelSettings({ autoEnableTravelHealth: value })}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
            iconColor="#4CD964"
          />
          <SettingsItem
            icon="notifications-outline"
            title="Travel Alerts"
            rightElement={
              <Switch
                value={settings.travel.autoEnableTravelHealth}
                onValueChange={(value) => updateTravelSettings({ autoEnableTravelHealth: value })}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
            iconColor="#007AFF"
          />
        </View>

        {/* Data & Sync Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>DATA & SYNC</Text>
          <SettingsItem
            icon="download-outline"
            title="Export"
            onPress={handleExportSettings}
            iconColor="#FF9500"
          />
          <SettingsItem
            icon="cloud-upload-outline"
            title="Sync Frequency"
            value={settings.dataSync.syncFrequency}
            onPress={() => setActivePicker('syncFrequency')}
            iconColor="#4CD964"
          />
          <SettingsItem
            icon="wifi-outline"
            title="Wi-Fi Only"
            rightElement={
              <Switch
                value={settings.dataSync.wifiOnly}
                onValueChange={(value) => updateDataSyncSettings({ wifiOnly: value })}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
            iconColor="#007AFF"
          />
        </View>

        {/* Privacy & Security Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>PRIVACY & SECURITY</Text>
          <SettingsItem
            icon="finger-print-outline"
            title="Biometrics"
            value={settings.privacy.biometricAuth ? 'Enabled' : 'Disabled'}
            onPress={handleBiometricSetup}
            iconColor="#FF9500"
          />
          <SettingsItem
            icon="trash-outline"
            title="Delete Data"
            onPress={() => Alert.alert('Delete Data', 'This will permanently delete all your data.')}
            iconColor="#FF3B30"
          />
          <SettingsItem
            icon="shield-checkmark-outline"
            title="Consent"
            onPress={() => Alert.alert('Consent', 'Manage your data consent settings.')}
            iconColor="#4CD964"
          />
        </View>

        {/* Legal & Support Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>LEGAL & SUPPORT</Text>
          <SettingsItem
            icon="shield-outline"
            title="Privacy Policy"
            onPress={() => navigation.navigate('PrivacyPolicy')}
            iconColor="#FF9500"
          />
          <SettingsItem
            icon="document-text-outline"
            title="Terms"
            onPress={() => navigation.navigate('TermsOfService')}
            iconColor="#4CD964"
          />
          <SettingsItem
            icon="information-circle-outline"
            title="Disclaimer"
            onPress={() => Alert.alert('Disclaimer', 'Medical information provided by this app is for informational purposes only.')}
            iconColor="#007AFF"
          />
        </View>

        {/* Advanced Tools Card */}
        {showAdvanced && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>ADVANCED TOOLS</Text>
            <SettingsItem
              icon="refresh-outline"
              title="Reset"
              onPress={handleResetSettings}
              iconColor="#FF3B30"
            />
            <SettingsItem
              icon="bug-outline"
              title="Logs"
              onPress={() => Alert.alert('Logs', 'View application logs.')}
              iconColor="#FF9500"
            />
          </View>
        )}

        {/* Show Advanced Toggle */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.showAdvancedButton}
            onPress={() => setShowAdvanced(!showAdvanced)}
          >
            <Ionicons 
              name={showAdvanced ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#007AFF" 
            />
            <Text style={styles.showAdvancedText}>
              {showAdvanced ? 'Hide Advanced Tools' : 'Show Advanced Tools'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Card */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={22} color="#FF3B30" style={styles.signOutIcon} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Settings Picker Modal */}
      <SettingsPicker
        visible={activePicker !== null}
        title={getCurrentPickerTitle()}
        options={getCurrentPickerOptions()}
        selectedValue={getCurrentPickerValue()}
        onSelect={(value) => {
          handlePickerSelect(activePicker!, value);
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  scrollView: {
    flex: 1,
  },
  settingsHeader: {
    alignItems: 'center',
    backgroundColor: '#222',
    paddingVertical: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  settingsTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  settingsSubtitle: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#181818',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    color: '#888',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  settingsIcon: {
    marginRight: 16,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemTitle: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  settingsItemSubtitle: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemValue: {
    color: '#aaa',
    fontSize: 15,
    marginRight: 8,
  },
  chevron: {
    marginLeft: 8,
  },
  showAdvancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  showAdvancedText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  signOutIcon: {
    marginRight: 8,
  },
  signOutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#aaa',
  },
});

export default SettingsScreen; 