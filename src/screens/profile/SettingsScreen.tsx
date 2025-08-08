import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';

type SettingsScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const settingsSections = [
    {
      title: 'Account Settings',
      icon: 'person-outline',
      color: '#FF9500',
      onPress: () => navigation.navigate('AccountSettings' as any),
    },
    {
      title: 'Connected Devices & Integrations',
      icon: 'phone-portrait-outline',
      color: '#4CD964',
      onPress: () => navigation.navigate('ConnectedDevices' as any),
    },
    {
      title: 'Display & Format',
      icon: 'options-outline',
      color: '#007AFF',
      onPress: () => navigation.navigate('DisplayFormat' as any),
    },
    {
      title: 'Appearance',
      icon: 'color-palette-outline',
      color: '#8E44AD',
      onPress: () => navigation.navigate('Appearance' as any),
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline',
      color: '#FF3B30',
      onPress: () => navigation.navigate('Notifications' as any),
    },
    {
      title: 'Travel Settings',
      icon: 'airplane-outline',
      color: '#34C759',
      onPress: () => navigation.navigate('TravelSettings' as any),
    },
    {
      title: 'Data & Sync',
      icon: 'cloud-upload-outline',
      color: '#5856D6',
      onPress: () => navigation.navigate('DataSync' as any),
    },
    {
      title: 'Privacy & Security',
      icon: 'shield-checkmark-outline',
      color: '#FF9500',
      onPress: () => navigation.navigate('PrivacySecurity' as any),
    },
    {
      title: 'Legal & Compliance',
      icon: 'document-text-outline',
      color: '#007AFF',
      onPress: () => navigation.navigate('LegalCompliance' as any),
    },
    {
      title: 'Support & Help',
      icon: 'help-circle-outline',
      color: '#4CD964',
      onPress: () => navigation.navigate('SupportHelp' as any),
    },
    {
      title: 'App Info',
      icon: 'information-circle-outline',
      color: '#8E8E93',
      onPress: () => navigation.navigate('AppInfo' as any),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Account & Preferences Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>ACCOUNT & PREFERENCES</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('AccountSettings' as any)}>
          <Ionicons name="person-outline" size={22} color="#FF9500" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Account Settings</Text>
          <Text style={styles.cardValue}>Profile, security, privacy</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('ConnectedDevices' as any)}>
          <Ionicons name="phone-portrait-outline" size={22} color="#4CD964" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Connected Devices & Integrations</Text>
          <Text style={styles.cardValue}>Wearables, apps, services</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('DisplayFormat' as any)}>
          <Ionicons name="options-outline" size={22} color="#007AFF" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Display & Format</Text>
          <Text style={styles.cardValue}>Units, language, region</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('Appearance' as any)}>
          <Ionicons name="color-palette-outline" size={22} color="#8E44AD" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Appearance</Text>
          <Text style={styles.cardValue}>Theme, colors, fonts</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Notifications & Communication Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>NOTIFICATIONS & COMMUNICATION</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('Notifications' as any)}>
          <Ionicons name="notifications-outline" size={22} color="#FF3B30" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Notifications</Text>
          <Text style={styles.cardValue}>Alerts, reminders, updates</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('TravelSettings' as any)}>
          <Ionicons name="airplane-outline" size={22} color="#34C759" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Travel Settings</Text>
          <Text style={styles.cardValue}>Health alerts, time zones</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Data & Privacy Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>DATA & PRIVACY</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('DataSync' as any)}>
          <Ionicons name="cloud-upload-outline" size={22} color="#5856D6" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Data & Sync</Text>
          <Text style={styles.cardValue}>Backup, sync, export</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('PrivacySecurity' as any)}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#FF9500" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Privacy & Security</Text>
          <Text style={styles.cardValue}>Passcode, biometrics, encryption</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('LegalCompliance' as any)}>
          <Ionicons name="document-text-outline" size={22} color="#007AFF" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Legal & Compliance</Text>
          <Text style={styles.cardValue}>Terms, privacy policy, GDPR</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Support & Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>SUPPORT & INFORMATION</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('SupportHelp' as any)}>
          <Ionicons name="help-circle-outline" size={22} color="#4CD964" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Support & Help</Text>
          <Text style={styles.cardValue}>FAQ, contact, troubleshooting</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('AppInfo' as any)}>
          <Ionicons name="information-circle-outline" size={22} color="#8E8E93" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>App Info</Text>
          <Text style={styles.cardValue}>Version, credits, acknowledgments</Text>
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
  cardValue: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  chevron: {
    marginLeft: 'auto',
  },
});

export default SettingsScreen; 