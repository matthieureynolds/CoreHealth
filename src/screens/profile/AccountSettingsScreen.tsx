import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const AccountSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const accountItems = [
    {
      title: 'Email & Password',
      subtitle: 'Change your email and password',
      icon: 'mail-outline',
      onPress: () => navigation.navigate('EmailPassword'),
    },
    {
      title: 'Google/Apple Login',
      subtitle: 'Manage connected accounts',
      icon: 'logo-google',
      onPress: () => navigation.navigate('ConnectedAccounts'),
    },
    {
      title: 'Two-Factor Authentication',
      subtitle: 'Add an extra layer of security',
      icon: 'shield-checkmark-outline',
      onPress: () => navigation.navigate('TwoFactorAuth'),
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
          <Text style={styles.headerTitle}>Account Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Account Info */}
          <View style={styles.accountInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color="#007AFF" />
            </View>
            <View style={styles.accountDetails}>
              <Text style={styles.accountName}>{user?.displayName || 'User'}</Text>
              <Text style={styles.accountEmail}>{user?.email}</Text>
            </View>
          </View>

          {/* Account Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Security</Text>
            {accountItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.settingsItem}
                onPress={item.onPress}
              >
                <Ionicons name={item.icon as any} size={22} color="#007AFF" style={styles.itemIcon} />
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Account Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Actions</Text>
            <TouchableOpacity style={styles.dangerItem}>
              <Ionicons name="trash-outline" size={22} color="#FF3B30" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.dangerTitle}>Delete Account</Text>
                <Text style={styles.itemSubtitle}>Permanently delete your account and data</Text>
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
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
    color: '#888',
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
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
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
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B3010',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FF3B3020',
  },
  dangerTitle: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 2,
  },
});

export default AccountSettingsScreen; 