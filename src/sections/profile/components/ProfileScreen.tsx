import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => {
        // Assuming signOut is a function from useAuth or similar
        // For now, we'll just alert that it's not implemented
        Alert.alert('Sign Out', 'Sign out functionality is not yet implemented.');
      }},
    ]);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#F7F8FA',
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 48,
      paddingBottom: 8,
      backgroundColor: isDark ? '#000' : '#FFFFFF',
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: isDark ? '#FFF' : '#18181C',
      marginBottom: 0,
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#18181C' : '#FFFFFF',
      borderRadius: 20,
      marginHorizontal: 16,
      marginTop: 24,
      padding: 24,
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: '#007AFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 20,
    },
    avatarText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFF',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 22,
      fontWeight: '700',
      color: isDark ? '#FFF' : '#18181C',
    },
    profileEmail: {
      fontSize: 15,
      color: isDark ? '#8E8E93' : '#6C757D',
      marginTop: 2,
    },
    section: {
      backgroundColor: isDark ? '#18181C' : '#FFFFFF',
      borderRadius: 18,
      marginHorizontal: 16,
      marginTop: 28,
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
    valueText: {
      fontSize: 15,
      color: isDark ? '#8E8E93' : '#6C757D',
      marginRight: 8,
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
  });

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{title}</Text>
      {children}
    </View>
  );

  const Item = ({ icon, label, value, onPress, last }: { icon: string; label: string; value?: string; onPress?: () => void; last?: boolean }) => (
    <TouchableOpacity style={[styles.item, last && styles.lastItem]} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={20} color="#007AFF" />
      </View>
      <Text style={styles.itemText}>{label}</Text>
      {value && <Text style={styles.valueText}>{value}</Text>}
      <Ionicons name="chevron-forward" size={20} style={styles.chevron} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TESTING123</Text>
      </View>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{/* user?.displayName?.charAt(0) || 'U' */}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{/* user?.displayName || 'User' */}</Text>
          <Text style={styles.profileEmail}>{/* user?.email || '' */}</Text>
        </View>
      </View>
      <Section title="Health Profile">
        <Item icon="person-outline" label="Personal Information" value="Not set" onPress={() => navigation.navigate('EditProfile')} />
        <Item icon="medical-outline" label="Medical History" value="Not set" onPress={() => navigation.navigate('MedicalHistory')} />
        <Item icon="shield-checkmark-outline" label="Vaccinations" value="Not set" onPress={() => navigation.navigate('MedicalHistory')} />
        <Item icon="people-outline" label="Family History" value="Not set" onPress={() => navigation.navigate('MedicalHistory')} />
        <Item icon="call-outline" label="Emergency Contacts" value="Manage contacts" onPress={() => navigation.navigate('EmergencyContacts')} last />
      </Section>
      <Section title="Quick Actions">
        <Item icon="document-text" label="Add Medical Record" onPress={() => {}} />
        <Item icon="analytics" label="Generate Health Report" onPress={() => {}} />
        <Item icon="share" label="Share with Doctor" onPress={() => {}} />
        <Item icon="watch" label="Connected Devices" onPress={() => {}} last />
      </Section>
      <Section title="Data & Privacy">
        <Item icon="document-text-outline" label="Export Health Data" onPress={() => {}} />
        <Item icon="cloud-upload-outline" label="Data Sync Settings" onPress={() => {}} />
        <Item icon="lock-closed-outline" label="Privacy Settings" onPress={() => {}} last />
      </Section>
      <Section title="App Settings">
        <Item icon="notifications-outline" label="Notifications" onPress={() => {}} />
        <Item icon="help-circle-outline" label="Help & Support" onPress={() => {}} />
        <Item icon="information-circle-outline" label="About CoreHealth" onPress={() => {}} last />
      </Section>
      <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;
