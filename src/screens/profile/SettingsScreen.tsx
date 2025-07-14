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
  const themeOptions = [
    { value: 'light', label: 'Light', description: 'Use light theme always' },
    { value: 'dark', label: 'Dark', description: 'Use dark theme always' },
    { value: 'auto', label: 'Automatic', description: 'Match system setting' },
  ];
  
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
  
  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'extra-large', label: 'Extra Large' },
  ];

  const healthGoalOptions = [
    { value: 'general_wellness', label: 'General Wellness', description: 'Balanced health monitoring for everyday life' },
    { value: 'longevity', label: 'Longevity', description: 'Focus on long-term health optimization' },
    { value: 'athletic', label: 'Athletic Performance', description: 'Optimized for athletes and active individuals' },
    { value: 'disease_monitoring', label: 'Disease Monitoring', description: 'Enhanced tracking for specific health conditions' },
    { value: 'custom', label: 'Custom Goals', description: 'Create your own personalized health targets' },
  ];

  const biomarkerUnitsOptions = {
    glucose: [
      { value: 'mg/dL', label: 'mg/dL (US standard)' },
      { value: 'mmol/L', label: 'mmol/L (International)' },
    ],
    cholesterol: [
      { value: 'mg/dL', label: 'mg/dL (US standard)' },
      { value: 'mmol/L', label: 'mmol/L (International)' },
    ],
    creatinine: [
      { value: 'mg/dL', label: 'mg/dL (US standard)' },
      { value: 'µmol/L', label: 'µmol/L (International)' },
    ],
  };

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
    // In a real app, you'd copy to clipboard or share
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
      case 'theme':
        updateGeneralSettings({ theme: value as any });
        break;
      case 'units':
        updateGeneralSettings({ units: value as any });
        break;
      case 'dateFormat':
        updateGeneralSettings({ dateFormat: value as any });
        break;
      case 'timeFormat':
        updateGeneralSettings({ timeFormat: value as any });
        break;
      case 'sessionTimeout':
        updatePrivacySettings({ sessionTimeout: value as any });
        break;
      case 'syncFrequency':
        updateDataSyncSettings({ syncFrequency: value as any });
        break;
      case 'fontSize':
        updateAccessibilitySettings({ fontSize: value as any });
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
      case 'glucoseUnits':
        updateBiomarkerSettings({
          units: { ...settings.biomarkers.units, glucose: value as any }
        });
        break;
      case 'cholesterolUnits':
        updateBiomarkerSettings({
          units: { ...settings.biomarkers.units, cholesterol: value as any }
        });
        break;
      case 'creatinineUnits':
        updateBiomarkerSettings({
          units: { ...settings.biomarkers.units, creatinine: value as any }
        });
        break;
    }
    setActivePicker(null);
  };

  const getCurrentPickerOptions = () => {
    switch (activePicker) {
      case 'theme': return themeOptions;
      case 'units': return unitsOptions;
      case 'dateFormat': return dateFormatOptions;
      case 'timeFormat': return timeFormatOptions;
      case 'sessionTimeout': return sessionTimeoutOptions;
      case 'syncFrequency': return syncFrequencyOptions;
      case 'fontSize': return fontSizeOptions;
      case 'healthGoalPreset': return healthGoalOptions;
      case 'biomarkerSort': return biomarkerSortOptions;
      case 'glucoseUnits': return biomarkerUnitsOptions.glucose;
      case 'cholesterolUnits': return biomarkerUnitsOptions.cholesterol;
      case 'creatinineUnits': return biomarkerUnitsOptions.creatinine;
      default: return [];
    }
  };

  const getCurrentPickerValue = () => {
    switch (activePicker) {
      case 'theme': return settings.general.theme;
      case 'units': return settings.general.units;
      case 'dateFormat': return settings.general.dateFormat;
      case 'timeFormat': return settings.general.timeFormat;
      case 'sessionTimeout': return settings.privacy.sessionTimeout;
      case 'syncFrequency': return settings.dataSync.syncFrequency;
      case 'fontSize': return settings.accessibility.fontSize;
      case 'healthGoalPreset': return settings.biomarkers.healthGoalPreset;
      case 'biomarkerSort': return settings.biomarkers.displaySettings.sortBy;
      case 'glucoseUnits': return settings.biomarkers.units.glucose;
      case 'cholesterolUnits': return settings.biomarkers.units.cholesterol;
      case 'creatinineUnits': return settings.biomarkers.units.creatinine;
      default: return '';
    }
  };

  const getCurrentPickerTitle = () => {
    switch (activePicker) {
      case 'theme': return 'Theme';
      case 'units': return 'Units';
      case 'dateFormat': return 'Date Format';
      case 'timeFormat': return 'Time Format';
      case 'sessionTimeout': return 'Session Timeout';
      case 'syncFrequency': return 'Sync Frequency';
      case 'fontSize': return 'Font Size';
      case 'healthGoalPreset': return 'Health Goal Preset';
      case 'biomarkerSort': return 'Biomarker Sort Order';
      case 'glucoseUnits': return 'Glucose Units';
      case 'cholesterolUnits': return 'Cholesterol Units';
      case 'creatinineUnits': return 'Creatinine Units';
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
  }: any) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <Ionicons name={icon} size={24} color="#007AFF" />
        <View>
          <Text style={styles.settingsItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {rightElement || (
          <>
            {value && <Text style={styles.settingsItemValue}>{value}</Text>}
            {showChevron && <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />}
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
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
      {/* Modern iOS-style header with proper spacing */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section - Modern Apple-style */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.profileSection}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.displayName?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
                <Text style={styles.profileUsername}>@{user?.email?.split('@')[0] || 'user'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <SectionHeader title="General" />
          <SettingsItem
            icon="color-palette-outline"
            title="Appearance"
            value={settings.general.theme === 'auto' ? 'Automatic' : settings.general.theme === 'light' ? 'Light' : 'Dark'}
            onPress={() => setActivePicker('theme')}
          />
          <SettingsItem
            icon="scale-outline"
            title="Units"
            value={settings.general.units === 'metric' ? 'Metric' : 'Imperial'}
            onPress={() => setActivePicker('units')}
          />
          <SettingsItem
            icon="calendar-outline"
            title="Date Format"
            value={settings.general.dateFormat}
            onPress={() => setActivePicker('dateFormat')}
          />
          <SettingsItem
            icon="time-outline"
            title="Time Format"
            value={settings.general.timeFormat === '12h' ? '12-Hour' : '24-Hour'}
            onPress={() => setActivePicker('timeFormat')}
          />
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <SectionHeader title="Notifications" />
          <SettingsItem
            icon="notifications-outline"
            title="Push Notifications"
            rightElement={
              <Switch
                value={settings.notifications.enabled}
                onValueChange={(value) => updateNotificationSettings({ enabled: value })}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingsItem
            icon="medical-outline"
            title="Health Alerts"
            rightElement={
              <Switch
                value={settings.notifications.biomarkerAlerts}
                onValueChange={(value) => updateNotificationSettings({ biomarkerAlerts: value })}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingsItem
            icon="airplane-outline"
            title="Travel Reminders"
            rightElement={
              <Switch
                value={settings.notifications.travelWarnings}
                onValueChange={(value) => updateNotificationSettings({ travelWarnings: value })}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingsItem
            icon="test-tube-outline"
            title="Lab Results"
            rightElement={
              <Switch
                value={settings.notifications.healthSummaries}
                onValueChange={(value) => updateNotificationSettings({ healthSummaries: value })}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <SectionHeader title="Privacy & Security" />
          <SettingsItem
            icon="finger-print-outline"
            title="Biometric Authentication"
            value={settings.privacy.biometricAuth ? 'Enabled' : 'Disabled'}
            onPress={handleBiometricSetup}
          />
          <SettingsItem
            icon="lock-closed-outline"
            title="Session Timeout"
            value={settings.privacy.sessionTimeout}
            onPress={() => setActivePicker('sessionTimeout')}
          />
          <SettingsItem
            icon="eye-outline"
            title="Data Sharing"
            value={settings.privacy.dataSharing.analytics ? 'Enabled' : 'Disabled'}
            onPress={() => updatePrivacySettings({ 
              dataSharing: { 
                ...settings.privacy.dataSharing, 
                analytics: !settings.privacy.dataSharing.analytics 
              } 
            })}
          />
        </View>

        {/* Data & Sync */}
        <View style={styles.section}>
          <SectionHeader title="Data & Sync" />
          <SettingsItem
            icon="cloud-upload-outline"
            title="Sync Frequency"
            value={settings.dataSync.syncFrequency}
            onPress={() => setActivePicker('syncFrequency')}
          />
          <SettingsItem
            icon="wifi-outline"
            title="Wi-Fi Only Sync"
            rightElement={
              <Switch
                value={settings.dataSync.wifiOnly}
                onValueChange={(value) => updateDataSyncSettings({ wifiOnly: value })}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingsItem
            icon="download-outline"
            title="Export Data"
            onPress={handleExportSettings}
          />
        </View>

        {/* Accessibility */}
        <View style={styles.section}>
          <SectionHeader title="Accessibility" />
          <SettingsItem
            icon="text-outline"
            title="Font Size"
            value={settings.accessibility.fontSize}
            onPress={() => setActivePicker('fontSize')}
          />
          <SettingsItem
            icon="hand-left-outline"
            title="Haptic Feedback"
            rightElement={
              <Switch
                value={settings.accessibility.hapticFeedback}
                onValueChange={(value) => updateAccessibilitySettings({ hapticFeedback: value })}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingsItem
            icon="contrast-outline"
            title="High Contrast"
            rightElement={
              <Switch
                value={settings.accessibility.highContrast}
                onValueChange={(value) => updateAccessibilitySettings({ highContrast: value })}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingsItem
            icon="eye-off-outline"
            title="Reduce Motion"
            rightElement={
              <Switch
                value={settings.accessibility.reducedMotion}
                onValueChange={(value) => updateAccessibilitySettings({ reducedMotion: value })}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* Health & Biomarkers */}
        <View style={styles.section}>
          <SectionHeader title="Health & Biomarkers" />
          <SettingsItem
            icon="target-outline"
            title="Health Goals"
            value={settings.biomarkers.healthGoalPreset}
            onPress={() => setActivePicker('healthGoalPreset')}
          />
          <SettingsItem
            icon="list-outline"
            title="Display Order"
            value={settings.biomarkers.displaySettings.sortBy}
            onPress={() => setActivePicker('biomarkerSort')}
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
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* Travel Settings */}
        <View style={styles.section}>
          <SectionHeader title="Travel" />
          <SettingsItem
            icon="airplane-outline"
            title="Auto-detect Location"
            rightElement={
              <Switch
                value={settings.travel.autoLocationDetection}
                onValueChange={(value) => updateTravelSettings({ autoLocationDetection: value })}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingsItem
            icon="notifications-outline"
            title="Travel Health Alerts"
            rightElement={
              <Switch
                value={settings.travel.autoEnableTravelHealth}
                onValueChange={(value) => updateTravelSettings({ autoEnableTravelHealth: value })}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* Advanced Settings */}
        {showAdvanced && (
          <View style={styles.section}>
            <SectionHeader title="Advanced" />
            <SettingsItem
              icon="bug-outline"
              title="Test Notification"
              onPress={handleTestNotification}
            />
            <SettingsItem
              icon="refresh-outline"
              title="Reset All Settings"
              onPress={handleResetSettings}
            />
          </View>
        )}

        {/* Show Advanced Toggle */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.showAdvancedButton}
            onPress={() => setShowAdvanced(!showAdvanced)}
          >
            <Text style={styles.showAdvancedText}>
              {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
            </Text>
            <Ionicons 
              name={showAdvanced ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#007AFF" 
            />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#F2F2F7',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '400',
    lineHeight: 20,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingsItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginLeft: 12,
  },
  settingsItemSubtitle: {
    fontSize: 13,
    color: '#6C757D',
    marginLeft: 12,
    marginTop: 2,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemValue: {
    fontSize: 14,
    color: '#6C757D',
    marginRight: 8,
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  signOutText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 8,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 50,
  },
  profileSection: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  profileUsername: {
    fontSize: 16,
    color: '#8E8E93',
  },
  showAdvancedButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  showAdvancedText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default SettingsScreen; 