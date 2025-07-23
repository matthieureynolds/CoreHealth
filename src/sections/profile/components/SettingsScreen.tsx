import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<ProfileTabParamList>>();
  const { signOut, user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#101014' : '#F7F8FA',
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 40,
      paddingBottom: 16,
      backgroundColor: isDark ? '#18181C' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#23232A' : '#E5E5EA',
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: isDark ? '#FFF' : '#18181C',
      marginBottom: 4,
    },
    section: {
      backgroundColor: isDark ? '#18181C' : '#FFFFFF',
      borderRadius: 18,
      marginHorizontal: 16,
      marginTop: 24,
      paddingVertical: 8,
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionHeader: {
      fontSize: 15,
      fontWeight: '700',
      color: isDark ? '#8E8E93' : '#6C757D',
      marginLeft: 24,
      marginTop: 16,
      marginBottom: 8,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 18,
      paddingHorizontal: 24,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#23232A' : '#F2F2F7',
    },
    lastItem: {
      borderBottomWidth: 0,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? '#23232A' : '#F2F2F7',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    itemText: {
      fontSize: 17,
      color: isDark ? '#FFF' : '#18181C',
      fontWeight: '500',
      flex: 1,
    },
    chevron: {
      marginLeft: 8,
      color: isDark ? '#8E8E93' : '#C7C7CC',
    },
    signOut: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      marginHorizontal: 16,
      marginTop: 32,
      backgroundColor: isDark ? '#23232A' : '#FFF0F0',
      borderRadius: 14,
    },
    signOutText: {
      color: '#FF3B30',
      fontWeight: '700',
      fontSize: 17,
      marginLeft: 8,
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#23232A' : '#F2F2F7',
      borderRadius: 16,
      marginHorizontal: 16,
      marginTop: 24,
      padding: 18,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#007AFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    avatarText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFF',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 19,
      fontWeight: '700',
      color: isDark ? '#FFF' : '#18181C',
    },
    profileEmail: {
      fontSize: 15,
      color: isDark ? '#8E8E93' : '#6C757D',
      marginTop: 2,
    },
  });

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{title}</Text>
      {children}
    </View>
  );

  const Item = ({ icon, label, onPress, last }: { icon: string; label: string; onPress: () => void; last?: boolean }) => (
    <TouchableOpacity style={[styles.item, last && styles.lastItem]} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={20} color="#007AFF" />
      </View>
      <Text style={styles.itemText}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} style={styles.chevron} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <TouchableOpacity style={styles.profileCard} onPress={() => navigation.navigate('EditProfile')}>
              <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.displayName?.charAt(0) || 'U'}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
              </View>
          <Ionicons name="chevron-forward" size={20} style={styles.chevron} />
          </TouchableOpacity>

        {/* Account Section */}
        <Section title="Account">
          <Item icon="person-outline" label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
          <Item icon="key-outline" label="Change Password" onPress={() => navigation.navigate('ForgotPassword')} last />
        </Section>

        {/* App Section */}
        <Section title="App">
          <Item icon="color-palette-outline" label="Theme & Appearance" onPress={() => navigation.navigate('Settings')} />
          <Item icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('NotificationsSettings')} />
          <Item icon="text-outline" label="Accessibility" onPress={() => navigation.navigate('AccessibilitySettings')} last />
        </Section>

        {/* Health Section */}
        <Section title="Health">
          <Item icon="target-outline" label="Health & Biomarkers" onPress={() => navigation.navigate('BiomarkerSettings')} />
          <Item icon="airplane-outline" label="Travel" onPress={() => navigation.navigate('TravelSettings')} last />
        </Section>

        {/* Privacy & Data Section */}
        <Section title="Privacy & Data">
          <Item icon="finger-print-outline" label="Privacy & Security" onPress={() => navigation.navigate('PrivacySettings')} />
          <Item icon="cloud-upload-outline" label="Data & Sync" onPress={() => navigation.navigate('DataSyncSettings')} last />
        </Section>

        {/* Advanced Section */}
        <Section title="Advanced">
          <Item icon="bug-outline" label="Advanced Settings" onPress={() => navigation.navigate('AdvancedSettings')} last />
        </Section>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOut} onPress={signOut}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen; 