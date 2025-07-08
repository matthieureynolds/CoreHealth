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
    <ScrollView style={styles.container}>
      {/* General Settings */}
      <View style={styles.section}>
        <SectionHeader title="General Settings" />
        
        <SettingsItem
          icon="language-outline"
          title="Language"
          value={settings.general.language}
          onPress={() => {
            Alert.alert('Language', 'Language selection coming soon!');
          }}
        />
        
        <SettingsItem
          icon="contrast-outline"
          title="Theme"
          value={settings.general.theme === 'auto' ? 'Automatic' : 
                 settings.general.theme === 'light' ? 'Light' : 'Dark'}
          onPress={() => setActivePicker('theme')}
        />
        
        <SettingsItem
          icon="resize-outline"
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
          value={settings.general.timeFormat === '24h' ? '24-Hour' : '12-Hour'}
          onPress={() => setActivePicker('timeFormat')}
        />
      </View>

      {/* Contact & Account */}
      <View style={styles.section}>
        <SectionHeader title="Contact & Account" />
        
        <SettingsItem
          icon="mail-outline"
          title="Email Address"
          value={user?.email || 'Not set'}
          onPress={() => {
            Alert.alert('Email Address', 'Email management coming soon!');
          }}
        />
        
        <SettingsItem
          icon="call-outline"
          title="Phone Number"
          value="Not set"
          onPress={() => {
            Alert.alert('Phone Number', 'Phone number management coming soon!');
          }}
        />
        
        <SettingsItem
          icon="key-outline"
          title="Change Password"
          onPress={() => {
            Alert.alert('Change Password', 'Password change coming soon!');
          }}
        />
        
        <SettingsItem
          icon="logo-google"
          title="Linked Accounts"
          value="Google, Apple"
          subtitle="Manage connected login providers"
          onPress={() => {
            Alert.alert('Linked Accounts', 'Account linking management coming soon!');
          }}
        />
        
        <SettingsItem
          icon="shield-checkmark-outline"
          title="Two-Factor Authentication"
          subtitle={settings.privacy.twoFactorAuth ? 'Enabled for enhanced security' : 'Recommended for health data protection'}
          showChevron={false}
          rightElement={
            <Switch
              value={settings.privacy.twoFactorAuth}
              onValueChange={(value) => updatePrivacySettings({ twoFactorAuth: value })}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
      </View>

      {/* Biomarker Preferences */}
      <View style={styles.section}>
        <SectionHeader title="Biomarker Preferences" />
        
        <SettingsItem
          icon="analytics-outline"
          title="Health Goal Preset"
          value={healthGoalOptions.find(opt => opt.value === settings.biomarkers.healthGoalPreset)?.label || 'General Wellness'}
          subtitle="Optimizes biomarker tracking for your health goals"
          onPress={() => setActivePicker('healthGoalPreset')}
        />
        
        <SettingsItem
          icon="list-outline"
          title="Display Order"
          value={biomarkerSortOptions.find(opt => opt.value === settings.biomarkers.displaySettings.sortBy)?.label || 'By Category'}
          subtitle="How biomarkers are organized in your dashboard"
          onPress={() => setActivePicker('biomarkerSort')}
        />
        
        <SettingsItem
          icon="eye-outline"
          title="Biomarker Visibility"
          subtitle="Choose which biomarkers to track or hide"
          onPress={() => navigation.navigate('BiomarkerVisibility')}
        />
        
        <SettingsItem
          icon="trending-up-outline"
          title="Show Trends"
          subtitle="Display trend arrows and historical data"
          showChevron={false}
          rightElement={
            <Switch
              value={settings.biomarkers.displaySettings.showTrends}
              onValueChange={(value) => updateBiomarkerSettings({ 
                displaySettings: { 
                  ...settings.biomarkers.displaySettings, 
                  showTrends: value 
                } 
              })}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
        
        <SettingsItem
          icon="stats-chart-outline"
          title="Show Percentiles"
          subtitle="Compare your values to population ranges"
          showChevron={false}
          rightElement={
            <Switch
              value={settings.biomarkers.displaySettings.showPercentiles}
              onValueChange={(value) => updateBiomarkerSettings({ 
                displaySettings: { 
                  ...settings.biomarkers.displaySettings, 
                  showPercentiles: value 
                } 
              })}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
        
        <SettingsItem
          icon="folder-outline"
          title="Group by Category"
          subtitle="Organize biomarkers by health system"
          showChevron={false}
          rightElement={
            <Switch
              value={settings.biomarkers.displaySettings.groupByCategory}
              onValueChange={(value) => updateBiomarkerSettings({ 
                displaySettings: { 
                  ...settings.biomarkers.displaySettings, 
                  groupByCategory: value 
                } 
              })}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
      </View>

      {/* Biomarker Units */}
      <View style={styles.section}>
        <SectionHeader title="Biomarker Units" />
        
        <SettingsItem
          icon="water-outline"
          title="Glucose"
          value={settings.biomarkers.units.glucose}
          subtitle="Blood sugar measurement units"
          onPress={() => setActivePicker('glucoseUnits')}
        />
        
        <SettingsItem
          icon="heart-circle-outline"
          title="Cholesterol"
          value={settings.biomarkers.units.cholesterol}
          subtitle="Cholesterol and lipid measurement units"
          onPress={() => setActivePicker('cholesterolUnits')}
        />
        
        <SettingsItem
          icon="fitness-outline"
          title="Creatinine"
          value={settings.biomarkers.units.creatinine}
          subtitle="Kidney function measurement units"
          onPress={() => setActivePicker('creatinineUnits')}
        />
        
        <SettingsItem
          icon="thermometer-outline"
          title="Blood Pressure"
          value={settings.biomarkers.units.bloodPressure}
          subtitle="Currently using mmHg (standard)"
          showChevron={false}
        />
        
        <SettingsItem
          icon="scale-outline"
          title="Weight"
          value={settings.biomarkers.units.weight}
          subtitle="Body weight measurement units"
          showChevron={false}
        />
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <SectionHeader title="Notifications & Alerts" />
        
        <SettingsItem
          icon="notifications-outline"
          title="Enable Notifications"
          showChevron={false}
          rightElement={
            <Switch
              value={settings.notifications.enabled}
              onValueChange={async (value) => {
                if (value) {
                  const granted = await scheduleNotificationPermissions();
                  if (granted) {
                    updateNotificationSettings({ enabled: value });
                  } else {
                    Alert.alert('Permission Denied', 'Please enable notifications in device settings.');
                  }
                } else {
                  updateNotificationSettings({ enabled: value });
                }
              }}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
        
        {settings.notifications.enabled && (
          <>
            <SettingsItem
              icon="newspaper-outline"
              title="Daily Health Summaries"
              showChevron={false}
              rightElement={
                <Switch
                  value={settings.notifications.healthSummaries}
                  onValueChange={(value) => updateNotificationSettings({ healthSummaries: value })}
                  trackColor={{ false: '#E5E5EA', true: '#30D158' }}
                  thumbColor="#fff"
                />
              }
            />
            
            <SettingsItem
              icon="warning-outline"
              title="Abnormal Biomarker Alerts"
              showChevron={false}
              rightElement={
                <Switch
                  value={settings.notifications.biomarkerAlerts}
                  onValueChange={(value) => updateNotificationSettings({ biomarkerAlerts: value })}
                  trackColor={{ false: '#E5E5EA', true: '#30D158' }}
                  thumbColor="#fff"
                />
              }
            />
            
            <SettingsItem
              icon="medical-outline"
              title="Vaccination Reminders"
              showChevron={false}
              rightElement={
                <Switch
                  value={settings.notifications.vaccinationReminders}
                  onValueChange={(value) => updateNotificationSettings({ vaccinationReminders: value })}
                  trackColor={{ false: '#E5E5EA', true: '#30D158' }}
                  thumbColor="#fff"
                />
              }
            />
            
            <SettingsItem
              icon="airplane-outline"
              title="Travel Health Warnings"
              showChevron={false}
              rightElement={
                <Switch
                  value={settings.notifications.travelWarnings}
                  onValueChange={(value) => updateNotificationSettings({ travelWarnings: value })}
                  trackColor={{ false: '#E5E5EA', true: '#30D158' }}
                  thumbColor="#fff"
                />
              }
            />
            
            <SettingsItem
              icon="sync-outline"
              title="Data Sync Issues"
              showChevron={false}
              rightElement={
                <Switch
                  value={settings.notifications.syncIssues}
                  onValueChange={(value) => updateNotificationSettings({ syncIssues: value })}
                  trackColor={{ false: '#E5E5EA', true: '#30D158' }}
                  thumbColor="#fff"
                />
              }
            />
            
            <SettingsItem
              icon="alert-circle-outline"
              title="Emergency Alerts"
              showChevron={false}
              rightElement={
                <Switch
                  value={settings.notifications.emergencyAlerts}
                  onValueChange={(value) => updateNotificationSettings({ emergencyAlerts: value })}
                  trackColor={{ false: '#E5E5EA', true: '#30D158' }}
                  thumbColor="#fff"
                />
              }
            />
            
            <SettingsItem
              icon="notifications-circle-outline"
              title="Test Notification"
              onPress={handleTestNotification}
              showChevron={false}
            />
          </>
        )}
      </View>

      {/* Privacy & Security */}
      <View style={styles.section}>
        <SectionHeader title="Privacy & Security" />
        
        <SettingsItem
          icon="finger-print-outline"
          title="Biometric Authentication"
          subtitle={settings.privacy.biometricAuth ? 'Enabled' : 'Tap to enable'}
          showChevron={false}
          rightElement={
            <Switch
              value={settings.privacy.biometricAuth}
              onValueChange={(value) => {
                if (value) {
                  handleBiometricSetup();
                } else {
                  updatePrivacySettings({ biometricAuth: false });
                }
              }}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
        
        <SettingsItem
          icon="time-outline"
          title="Session Timeout"
          value={sessionTimeoutOptions.find(opt => opt.value === settings.privacy.sessionTimeout)?.label || settings.privacy.sessionTimeout}
          onPress={() => setActivePicker('sessionTimeout')}
        />
        
        <SettingsItem
          icon="location-outline"
          title="Location Services"
          showChevron={false}
          rightElement={
            <Switch
              value={settings.privacy.locationServices}
              onValueChange={(value) => updatePrivacySettings({ locationServices: value })}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
        
        <SettingsItem
          icon="people-outline"
          title="Contacts Access"
          showChevron={false}
          rightElement={
            <Switch
              value={settings.privacy.contactsAccess}
              onValueChange={(value) => updatePrivacySettings({ contactsAccess: value })}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
      </View>

      {/* Data & Sync */}
      <View style={styles.section}>
        <SectionHeader title="Data & Sync Management" />
        
        <SettingsItem
          icon="sync-outline"
          title="Auto Sync"
          showChevron={false}
          rightElement={
            <Switch
              value={settings.dataSync.autoSync}
              onValueChange={(value) => updateDataSyncSettings({ autoSync: value })}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
        
        <SettingsItem
          icon="refresh-outline"
          title="Background Sync"
          showChevron={false}
          rightElement={
            <Switch
              value={settings.dataSync.backgroundSync}
              onValueChange={(value) => updateDataSyncSettings({ backgroundSync: value })}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
        
        <SettingsItem
          icon="time-outline"
          title="Sync Frequency"
          value={syncFrequencyOptions.find(opt => opt.value === settings.dataSync.syncFrequency)?.label || settings.dataSync.syncFrequency}
          onPress={() => setActivePicker('syncFrequency')}
        />
        
        <SettingsItem
          icon="wifi-outline"
          title="WiFi Only Sync"
          showChevron={false}
          rightElement={
            <Switch
              value={settings.dataSync.wifiOnly}
              onValueChange={(value) => updateDataSyncSettings({ wifiOnly: value })}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
      </View>

      {/* Travel Settings */}
      <View style={styles.section}>
        <SectionHeader title="Travel Settings" />
        
        <SettingsItem
          icon="airplane-outline"
          title="Auto-Enable Travel Health"
          showChevron={false}
          rightElement={
            <Switch
              value={settings.travel.autoEnableTravelHealth}
              onValueChange={(value) => updateTravelSettings({ autoEnableTravelHealth: value })}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
        
        <SettingsItem
          icon="alarm-outline"
          title="Medication Timezone Alerts"
          showChevron={false}
          rightElement={
            <Switch
              value={settings.travel.medicationTimezoneAlerts}
              onValueChange={(value) => updateTravelSettings({ medicationTimezoneAlerts: value })}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
        
        <SettingsItem
          icon="location-outline"
          title="Auto Location Detection"
          showChevron={false}
          rightElement={
            <Switch
              value={settings.travel.autoLocationDetection}
              onValueChange={(value) => updateTravelSettings({ autoLocationDetection: value })}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
      </View>

      {/* Accessibility */}
      <View style={styles.section}>
        <SectionHeader title="Accessibility" />
        
        <SettingsItem
          icon="text-outline"
          title="Font Size"
          value={fontSizeOptions.find(opt => opt.value === settings.accessibility.fontSize)?.label || settings.accessibility.fontSize}
          onPress={() => setActivePicker('fontSize')}
        />
        
        <SettingsItem
          icon="contrast-outline"
          title="High Contrast"
          showChevron={false}
          rightElement={
            <Switch
              value={settings.accessibility.highContrast}
              onValueChange={(value) => updateAccessibilitySettings({ highContrast: value })}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
        
        <SettingsItem
          icon="phone-portrait-outline"
          title="Reduced Motion"
          showChevron={false}
          rightElement={
            <Switch
              value={settings.accessibility.reducedMotion}
              onValueChange={(value) => updateAccessibilitySettings({ reducedMotion: value })}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
        
        <SettingsItem
          icon="chatbox-outline"
          title="Voice Features"
          showChevron={false}
          rightElement={
            <Switch
              value={settings.accessibility.voiceFeatures}
              onValueChange={(value) => updateAccessibilitySettings({ voiceFeatures: value })}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          }
        />
      </View>

      {/* Advanced Settings */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Text style={styles.sectionTitle}>Advanced Settings</Text>
          <Ionicons 
            name={showAdvanced ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#007AFF" 
          />
        </TouchableOpacity>
        
        {showAdvanced && (
          <>
            <SettingsItem
              icon="download-outline"
              title="Export Settings"
              onPress={handleExportSettings}
            />
            
            <SettingsItem
              icon="refresh-circle-outline"
              title="Reset All Settings"
              onPress={handleResetSettings}
            />
            
            <SettingsItem
              icon="bug-outline"
              title="Crash Reporting"
              showChevron={false}
              rightElement={
                <Switch
                  value={settings.app.crashReporting}
                  onValueChange={(value) => updateAppSettings({ crashReporting: value })}
                  trackColor={{ false: '#E5E5EA', true: '#30D158' }}
                  thumbColor="#fff"
                />
              }
            />
          </>
        )}
      </View>

      {/* Support & About */}
      <View style={styles.section}>
        <SectionHeader title="Support & About" />
        
        <SettingsItem
          icon="help-circle-outline"
          title="Help & Support"
          onPress={() => navigation.navigate('HelpSupport')}
        />
        
        <SettingsItem
          icon="document-text-outline"
          title="Privacy Policy"
          onPress={() => navigation.navigate('PrivacyPolicy')}
        />
        
        <SettingsItem
          icon="document-outline"
          title="Terms of Service"
          onPress={() => navigation.navigate('TermsOfService')}
        />
        
        <SettingsItem
          icon="information-circle-outline"
          title="About CoreHealth"
          value="Version 1.0.0"
          onPress={() => navigation.navigate('About')}
        />
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
      
      {/* Settings Picker Modal */}
      <SettingsPicker
        visible={activePicker !== null}
        title={getCurrentPickerTitle()}
        options={getCurrentPickerOptions()}
        selectedValue={getCurrentPickerValue()}
        onSelect={(value) => handlePickerSelect(activePicker!, value)}
        onClose={() => setActivePicker(null)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
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
  section: {
    marginTop: 35,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6D6D72',
    textTransform: 'uppercase',
    marginLeft: 16,
    marginBottom: 6,
    letterSpacing: -0.08,
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 6,
  },
  settingsItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 17,
    color: '#000000',
    marginLeft: 12,
  },
  settingsItemSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 12,
    marginTop: 2,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemValue: {
    fontSize: 17,
    color: '#8E8E93',
    marginRight: 8,
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  signOutText: {
    fontSize: 17,
    color: '#FF3B30',
    marginLeft: 8,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 50,
  },
});

export default SettingsScreen; 