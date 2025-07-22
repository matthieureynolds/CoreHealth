import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../context/SettingsContext';

const PrivacySettingsScreen: React.FC = () => {
  const { settings, updatePrivacySettings, setupBiometricAuth } = useSettings();
  const isDark = (settings.general.theme === 'dark');

  const handleBiometricSetup = async () => {
    const success = await setupBiometricAuth();
    if (success) {
      Alert.alert('Success', 'Biometric authentication has been enabled!');
    } else {
      Alert.alert('Error', 'Could not set up biometric authentication. Please check your device settings.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#F8F9FA',
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 32,
      paddingBottom: 12,
      backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#FFF' : '#1A1A1A',
      marginBottom: 0,
      marginTop: 0,
      textAlign: 'left',
    },
    section: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      marginTop: 20,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
      borderRadius: 16,
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    settingsItem: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 12,
      marginBottom: 8,
      shadowColor: isDark ? '#000' : '#000',
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
      color: isDark ? '#FFF' : '#1A1A1A',
      marginLeft: 12,
    },
    settingsItemValue: {
      fontSize: 14,
      color: isDark ? '#8E8E93' : '#6C757D',
      marginRight: 8,
    },
  });

  const SettingsItem = ({ icon, title, value, onPress, rightElement }: any) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingsItemLeft}>
        <Ionicons name={icon} size={24} color="#007AFF" />
        <Text style={styles.settingsItemTitle}>{title}</Text>
      </View>
      {rightElement || (value !== undefined && <Text style={styles.settingsItemValue}>{value}</Text>)}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
      </View>
      <View style={styles.section}>
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
          onPress={null}
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
    </ScrollView>
  );
};

export default PrivacySettingsScreen; 