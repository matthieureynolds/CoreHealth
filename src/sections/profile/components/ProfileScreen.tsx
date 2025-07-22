import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { ProfileTabParamList } from '../../types';
import { useSettings } from '../../context/SettingsContext';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, signOut } = useAuth();
  const { profile } = useHealthData();
  const { settings } = useSettings();
  const colorScheme = useColorScheme();
  const isDark = (settings.general.theme === 'dark') || (settings.general.theme === 'auto' && colorScheme === 'dark');

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const ProfileItem = ({ icon, title, value, onPress }: any) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        <Ionicons name={icon} size={24} color="#007AFF" />
        <Text style={styles.profileItemTitle}>{title}</Text>
      </View>
      <View style={styles.profileItemRight}>
        {value && <Text style={styles.profileItemValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#F8F9FA',
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 32, // Match Dashboard
      paddingBottom: 12,
      backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
      justifyContent: 'flex-start',
      alignItems: 'flex-start', // Left align
    },
    headerTitle: {
      fontSize: 28, // Match Dashboard
      fontWeight: 'bold',
      color: isDark ? '#FFF' : '#1C1C1E',
      marginBottom: 0,
      marginTop: 0,
      textAlign: 'left',
    },
    profileHeader: {
      alignItems: 'center',
      paddingTop: 20,
      paddingHorizontal: 20,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatarText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#fff',
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#FFF' : '#1C1C1E',
      marginBottom: 4,
    },
    email: {
      fontSize: 16,
      color: isDark ? '#8E8E93' : '#666',
    },
    section: {
      backgroundColor: isDark ? '#1C1C1E' : '#fff',
      marginTop: 20,
      paddingHorizontal: 20,
      borderRadius: 16,
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFF' : '#666',
      marginTop: 20,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    profileItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? '#2C2C2E' : '#E5E5EA',
    },
    profileItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    profileItemTitle: {
      fontSize: 16,
      color: isDark ? '#FFF' : '#1C1C1E',
      marginLeft: 16,
    },
    profileItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    profileItemValue: {
      fontSize: 16,
      color: isDark ? '#8E8E93' : '#666',
      marginRight: 8,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      marginTop: 20,
      marginBottom: 20,
      backgroundColor: isDark ? '#1C1C1E' : 'transparent',
      borderRadius: 12,
    },
    signOutText: {
      fontSize: 16,
      color: '#FF3B30',
      fontWeight: '500',
      marginLeft: 8,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    quickActionCard: {
      width: '48%',
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      alignItems: 'center',
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    quickActionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    quickActionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#FFF' : '#1C1C1E',
      textAlign: 'center',
      marginBottom: 4,
    },
    quickActionSubtitle: {
      fontSize: 12,
      color: isDark ? '#8E8E93' : '#8E8E93',
      textAlign: 'center',
      lineHeight: 16,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.displayName || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Profile</Text>
        <ProfileItem
          icon="person-outline"
          title="Personal Information"
          value={profile ? `${profile.age} years old` : 'Not set'}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <ProfileItem
          icon="medical-outline"
          title="Medical History"
          value={
            profile?.medicalHistory.length
              ? `${profile.medicalHistory.length} conditions`
              : 'Not set'
          }
          onPress={() => navigation.navigate('MedicalHistory')}
        />
        <ProfileItem
          icon="shield-checkmark-outline"
          title="Vaccinations"
          value={
            profile?.vaccinations.length
              ? `${profile.vaccinations.length} vaccines`
              : 'Not set'
          }
          onPress={() => navigation.navigate('MedicalHistory')}
        />
        <ProfileItem
          icon="people-outline"
          title="Family History"
          value={
            profile?.familyHistory.length
              ? `${profile.familyHistory.length} conditions`
              : 'Not set'
          }
          onPress={() => navigation.navigate('MedicalHistory')}
        />
        <ProfileItem
          icon="call-outline"
          title="Emergency Contacts"
          value="Manage contacts"
          onPress={() => navigation.navigate('EmergencyContacts')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionCard} onPress={() => {}}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FF6B6B' }]}>
              <Ionicons name="document-text" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.quickActionTitle}>Add Medical Record</Text>
            <Text style={styles.quickActionSubtitle}>Scan or upload documents</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard} onPress={() => {}}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#4ECDC4' }]}>
              <Ionicons name="analytics" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.quickActionTitle}>Generate Health Report</Text>
            <Text style={styles.quickActionSubtitle}>Create specialist reports</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard} onPress={() => {}}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#45B7D1' }]}>
              <Ionicons name="share" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.quickActionTitle}>Share with Doctor</Text>
            <Text style={styles.quickActionSubtitle}>Send health data securely</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard} onPress={() => {}}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#96CEB4' }]}>
              <Ionicons name="watch" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.quickActionTitle}>Connected Devices</Text>
            <Text style={styles.quickActionSubtitle}>Manage health devices</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        <ProfileItem
          icon="document-text-outline"
          title="Export Health Data"
          onPress={() => {}}
        />
        <ProfileItem
          icon="cloud-upload-outline"
          title="Data Sync Settings"
          onPress={() => {}}
        />
        <ProfileItem
          icon="lock-closed-outline"
          title="Privacy Settings"
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <ProfileItem
          icon="notifications-outline"
          title="Notifications"
          onPress={() => {}}
        />
        <ProfileItem
          icon="help-circle-outline"
          title="Help & Support"
          onPress={() => {}}
        />
        <ProfileItem
          icon="information-circle-outline"
          title="About CoreHealth"
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
