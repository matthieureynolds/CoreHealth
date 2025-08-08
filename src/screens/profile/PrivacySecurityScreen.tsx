import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PrivacySecurityScreen: React.FC = () => {
  const navigation = useNavigation();
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [locationAccess, setLocationAccess] = useState(true);
  const [dataConsent, setDataConsent] = useState(true);

  const securityItems = [
    {
      title: 'Biometric Lock / Face ID',
      subtitle: 'Use fingerprint or face recognition',
      icon: 'finger-print-outline',
      value: biometricEnabled,
      onToggle: setBiometricEnabled,
    },
    {
      title: 'Location Access',
      subtitle: 'Allow location for travel features',
      icon: 'location-outline',
      value: locationAccess,
      onToggle: setLocationAccess,
    },
    {
      title: 'Data Consent',
      subtitle: 'Manage your data sharing preferences',
      icon: 'shield-checkmark-outline',
      value: dataConsent,
      onToggle: setDataConsent,
    },
  ];

  const privacyItems = [
    {
      title: 'Data Sharing Settings',
      subtitle: 'Control who can access your health data',
      icon: 'people-outline',
      onPress: () => Alert.alert('Data Sharing', 'Configure data sharing settings...'),
    },
    {
      title: 'Health Data Download',
      subtitle: 'Download a copy of your health data',
      icon: 'download-outline',
      onPress: () => Alert.alert('Download', 'Preparing your health data for download...'),
    },
    {
      title: 'Delete Account & Data',
      subtitle: 'Permanently delete your account',
      icon: 'trash-outline',
      onPress: () => Alert.alert('Delete Account', 'This action cannot be undone.'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Security Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>
            {securityItems.map((item, index) => (
              <View key={index} style={styles.securityItem}>
                <View style={styles.securityInfo}>
                  <Ionicons name={item.icon as any} size={22} color="#007AFF" style={styles.itemIcon} />
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: '#333', true: '#007AFF' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>

          {/* Privacy Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            {privacyItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.privacyItem}
                onPress={item.onPress}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={22} 
                  color={item.title.includes('Delete') ? '#FF3B30' : '#007AFF'} 
                  style={styles.itemIcon} 
                />
                <View style={styles.itemContent}>
                  <Text style={[
                    styles.itemTitle,
                    item.title.includes('Delete') && styles.dangerTitle
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Data Protection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Protection</Text>
            <View style={styles.protectionCard}>
              <View style={styles.protectionItem}>
                <Ionicons name="shield-checkmark" size={20} color="#4CD964" />
                <Text style={styles.protectionText}>End-to-end encryption</Text>
              </View>
              <View style={styles.protectionItem}>
                <Ionicons name="lock-closed" size={20} color="#4CD964" />
                <Text style={styles.protectionText}>HIPAA compliant</Text>
              </View>
              <View style={styles.protectionItem}>
                <Ionicons name="cloud-checkmark" size={20} color="#4CD964" />
                <Text style={styles.protectionText}>Secure cloud storage</Text>
              </View>
            </View>
          </View>

          {/* Advanced Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Advanced Security</Text>
            <TouchableOpacity style={styles.advancedItem}>
              <Ionicons name="key-outline" size={22} color="#007AFF" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Change Password</Text>
                <Text style={styles.itemSubtitle}>Update your account password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.advancedItem}>
              <Ionicons name="shield-outline" size={22} color="#007AFF" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Two-Factor Authentication</Text>
                <Text style={styles.itemSubtitle}>Add an extra layer of security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.advancedItem}>
              <Ionicons name="eye-outline" size={22} color="#007AFF" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Activity Log</Text>
                <Text style={styles.itemSubtitle}>View recent account activity</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#111',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  chevron: {
    marginLeft: 'auto',
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  dangerTitle: {
    color: '#FF3B30',
  },
  protectionCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 20,
  },
  protectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  protectionText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 12,
  },
  advancedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
});

export default PrivacySecurityScreen; 