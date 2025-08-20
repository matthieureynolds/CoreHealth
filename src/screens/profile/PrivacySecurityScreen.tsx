import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../context/SettingsContext';
import biometricService from '../../services/biometricService';
import locationService from '../../services/locationService';

const PrivacySecurityScreen: React.FC = () => {
  const { settings, updatePrivacySettings } = useSettings();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [locationAccess, setLocationAccess] = useState(false);
  const [dataConsent, setDataConsent] = useState(settings.privacy.dataSharing.analytics);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [locationPermission, setLocationPermission] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      setIsLoading(true);
      
      // Initialize biometric service
      await biometricService.initialize();
      setBiometricAvailable(biometricService.isBiometricAvailable());
      setBiometricEnabled(biometricService.isBiometricEnabled());
      
      // Initialize location service
      await locationService.initialize();
      setLocationPermission(locationService.getPermissionStatus());
      setLocationAccess(locationService.isLocationEnabled());
      
      // Load other settings
      await loadSettings();
    } catch (error) {
      console.error('Error initializing services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      // Load data consent setting (you might want to move this to a separate service)
      // For now, we'll keep it simple
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    try {
      setIsLoading(true);
      
      if (value) {
        // Enable biometric authentication
        const success = await biometricService.enableBiometric();
        if (success) {
          setBiometricEnabled(true);
          Alert.alert(
            'Biometric Lock Enabled',
            `Your health data is now protected with ${await biometricService.getPrimaryAuthenticationMethod()}. You'll need to authenticate to access the app.`,
            [{ text: 'OK' }]
          );
        }
      } else {
        // Disable biometric authentication
        const success = await biometricService.disableBiometric();
        if (success) {
          setBiometricEnabled(false);
          Alert.alert(
            'Biometric Lock Disabled',
            'Biometric authentication has been disabled. Your health data is no longer protected with biometric authentication.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Biometric toggle error:', error);
      Alert.alert('Error', 'Failed to update biometric settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationToggle = async (value: boolean) => {
    try {
      console.log('🔧 PrivacySecurityScreen: Location toggle pressed, value:', value);
      setIsLoading(true);
      
      if (value) {
        console.log('🔧 PrivacySecurityScreen: Attempting to enable location...');
        // Enable location access
        const success = await locationService.enableLocation();
        console.log('🔧 PrivacySecurityScreen: enableLocation result:', success);
        
        if (success) {
          setLocationAccess(true);
          setLocationPermission(locationService.getPermissionStatus());
          
          Alert.alert(
            'Location Access Granted',
            'Location access enabled for travel health features, emergency services, and location-specific health insights.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Location Permission Denied',
            'Location access is required for travel health features, emergency services, and location-specific health insights. You can enable this in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
        }
      } else {
        console.log('🔧 PrivacySecurityScreen: Disabling location...');
        // Disable location access
        await locationService.disableLocation();
        setLocationAccess(false);
        setLocationPermission(locationService.getPermissionStatus());
        
        Alert.alert(
          'Location Access Disabled',
          'Location access has been disabled. Travel health features and location-specific health insights will not be available.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ PrivacySecurityScreen: Location toggle error:', error);
      Alert.alert('Error', 'Failed to update location settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataConsentToggle = async (value: boolean) => {
    try {
      console.log('🔧 PrivacySecurityScreen: Data consent toggle pressed, value:', value);
      setIsLoading(true);
      
      // Update the setting in SettingsContext - dataSharing is an object with multiple properties
      await updatePrivacySettings({
        biometricAuth: settings.privacy.biometricAuth,
        locationServices: settings.privacy.locationServices,
        dataSharing: {
          analytics: value,
          anonymizedData: value,
          thirdPartyApps: false // Always keep this false for security
        }
      });
      
      setDataConsent(value);
      
      // Show appropriate alert based on the setting
      if (value) {
        Alert.alert(
          'Data Sharing Enabled',
          'You have consented to share anonymized health data for research and app improvement. Your personal information remains private and secure.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Data Sharing Disabled',
          'You have opted out of data sharing. Your health data will remain completely private and will not be used for research or app improvement.',
          [{ text: 'OK' }]
        );
      }
      
      console.log('✅ PrivacySecurityScreen: Data consent updated successfully');
    } catch (error) {
      console.error('❌ PrivacySecurityScreen: Data consent toggle error:', error);
      Alert.alert('Error', 'Failed to update data consent settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openMail = async (to: string, subject: string) => {
    const url = `mailto:${to}?subject=${encodeURIComponent(subject)}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) return Linking.openURL(url);
    Alert.alert('Email not configured', 'Please set up a mail app.');
  };

  const handleDataSharing = () => Alert.alert('Data Sharing Settings', 'This will open sharing controls.');
  const handleDownload = () => Alert.alert('Health Data Download', 'Preparing your data for download...');

  const toggleItems = [
    {
      title: 'Biometric Lock / Face ID',
      subtitle: biometricEnabled 
        ? 'Protecting your health data with biometric authentication'
        : 'Use fingerprint or face recognition to secure your health data',
      icon: 'finger-print-outline',
      value: biometricEnabled,
      onToggle: handleBiometricToggle,
      disabled: !biometricAvailable || isLoading,
      disabledReason: !biometricAvailable ? 'Biometric authentication not available on this device' : undefined,
    },
    {
      title: 'Location Access',
      subtitle: locationAccess 
        ? 'Enabled for travel health features and emergency services'
        : 'Allow location for travel features, emergency services, and health insights',
      icon: 'location-outline',
      value: locationAccess,
      onToggle: handleLocationToggle,
      disabled: isLoading,
    },
    {
      title: 'Data Consent',
      subtitle: dataConsent 
        ? 'Sharing anonymized data for research and app improvement'
        : 'Opted out of data sharing - your data remains private',
      icon: 'shield-checkmark-outline',
      value: dataConsent,
      onToggle: handleDataConsentToggle,
      disabled: isLoading,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Security Toggles */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>SECURITY</Text>
        {toggleItems.map((item, index) => (
          <View key={index} style={[styles.cardRow, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons 
                name={item.icon as any} 
                size={22} 
                color={item.disabled ? '#666' : '#007AFF'} 
                style={styles.cardIcon} 
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardLabel, item.disabled && styles.disabledText]}>
                  {item.title}
                </Text>
                <Text style={[styles.cardSub, item.disabled && styles.disabledText]}>
                  {item.disabledReason || item.subtitle}
                </Text>
              </View>
            </View>
            <Switch 
              value={item.value} 
              onValueChange={item.onToggle} 
              trackColor={{ false: '#333', true: '#007AFF' }} 
              thumbColor="#FFFFFF"
              disabled={item.disabled}
            />
          </View>
        ))}
      </View>

      {/* Security Information */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>SECURITY INFORMATION</Text>
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark" size={20} color="#34C759" style={styles.cardIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Biometric Protection</Text>
            <Text style={styles.infoText}>
              When enabled, Face ID or Touch ID will be required to access your health data, providing enterprise-grade security for your sensitive medical information.
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color="#007AFF" style={styles.cardIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Location Services</Text>
            <Text style={styles.infoText}>
              Location access enables travel health alerts, emergency services location, and location-specific health recommendations while maintaining your privacy.
            </Text>
          </View>
        </View>
      </View>

      {/* Privacy Actions */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>PRIVACY</Text>
        <TouchableOpacity style={styles.cardRow} onPress={handleDataSharing}>
          <Ionicons name="people-outline" size={22} color="#34C759" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Data Sharing Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={handleDownload}>
          <Ionicons name="download-outline" size={22} color="#5856D6" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Health Data Download</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => openMail('privacy@corehealth.com', 'Data Deletion Request')}>
          <Ionicons name="trash-outline" size={22} color="#FF3B30" style={styles.cardIcon} />
          <Text style={[styles.cardLabel, { color: '#FF3B30' }]}>Delete Account & Data</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 16,
    marginHorizontal: 20,
    letterSpacing: 0.5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  cardSub: {
    fontSize: 13,
    color: '#8E8E93',
  },
  disabledText: {
    color: '#666',
  },
  chevron: {
    marginLeft: 'auto',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
  },
});

export default PrivacySecurityScreen;