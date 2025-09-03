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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Account & Preferences Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>ACCOUNT & PREFERENCES</Text>
          <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('AccountSettings' as any)}>
            <Ionicons name="person-outline" size={22} color="#FF9500" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Account Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('ConnectedDevices' as any)}>
            <Ionicons name="phone-portrait-outline" size={22} color="#4CD964" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Connected Devices & Integrations</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('DisplayFormat' as any)}>
            <Ionicons name="options-outline" size={22} color="#007AFF" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Display & Format</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('Notifications' as any)}>
            <Ionicons name="notifications-outline" size={22} color="#FF3B30" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
        </View>

        {/* Data & Privacy Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>DATA & PRIVACY</Text>
          <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('DataSync' as any)}>
            <Ionicons name="cloud-upload-outline" size={22} color="#5856D6" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Data & Sync</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('PrivacySecurity' as any)}>
            <Ionicons name="lock-closed-outline" size={22} color="#007AFF" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('LegalCompliance' as any)}>
            <Ionicons name="document-text-outline" size={22} color="#007AFF" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Legal & Compliance</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
        </View>

        {/* Support & Help Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>SUPPORT & HELP</Text>
          <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('SupportHelp' as any)}>
            <Ionicons name="help-circle-outline" size={22} color="#4CD964" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Support & Help</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('AppInfo' as any)}>
            <Ionicons name="information-circle-outline" size={22} color="#8E8E93" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>App Info</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#000000',
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
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
  chevron: {
    marginLeft: 'auto',
  },
});

export default SettingsScreen; 