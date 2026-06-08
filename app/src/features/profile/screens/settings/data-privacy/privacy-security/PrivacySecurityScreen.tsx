import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import SettingsHeader from '../../components/SettingsHeader';
import { SETTINGS_SCROLL_PT } from '../../components/settingsLayout';

type NavItem = {
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  route: string;
};

const PRIVACY_ITEMS: NavItem[] = [
  {
    title: 'Family Link',
    subtitle: 'Anonymous family history links for risk-only insights',
    icon: 'link-outline',
    iconColor: '#3AABF0',
    route: '',
  },
  {
    title: 'Delete Account & Data',
    subtitle: 'Permanently remove your account and all health data',
    icon: 'trash-outline',
    iconColor: '#FF3B30',
    route: '__delete__',
  },
];

const PrivacySecurityScreen: React.FC = () => {
  const navigation = useNavigation();
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account & Data',
      'Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'This will permanently delete',
              '• Your account and profile\n• All health records and biomarkers\n• Wearable sync history\n• AI insights and recommendations\n• All app data\n\nThis action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Account Deleted', 'Your account and all data have been permanently deleted.') },
              ]
            );
          },
        },
      ]
    );
  };

  const [biometric, setBiometric] = useState(false);
  const [locationAccess, setLocationAccess] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);

  const renderNavItem = (item: NavItem) => (
    <TouchableOpacity
      key={item.route}
      style={styles.cardRow}
      onPress={() => {
        if (item.route === '__delete__') handleDeleteAccount();
        else if (item.route) (navigation as any).navigate(item.route);
        else Alert.alert('Coming Soon', 'This feature is coming soon.');
      }}
      activeOpacity={0.7}
    >
      <Ionicons name={item.icon as any} size={22} color={item.iconColor} style={styles.cardIcon} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardLabel, item.iconColor === '#FF3B30' && { color: '#FF3B30' }]}>
          {item.title}
        </Text>
        <Text style={styles.cardSub}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SettingsHeader title="Privacy & Security" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: SETTINGS_SCROLL_PT }}>
        <View style={styles.content}>
          {/* Security toggles */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>SECURITY</Text>

            <View style={styles.toggleRow}>
              <Ionicons name="finger-print-outline" size={22} color="#3AABF0" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>Biometric Lock / Face ID</Text>
                <Text style={styles.cardSub}>Protect your health data with fingerprint or face recognition</Text>
              </View>
              <Switch value={biometric} onValueChange={setBiometric} trackColor={{ false: '#3A3A3C', true: '#3AABF0' }} thumbColor="#FFFFFF" />
            </View>

            <View style={styles.toggleRow}>
              <Ionicons name="location-outline" size={22} color="#34C759" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>Location Access</Text>
                <Text style={styles.cardSub}>Manage location permissions for travel and health features</Text>
              </View>
              <Switch value={locationAccess} onValueChange={setLocationAccess} trackColor={{ false: '#3A3A3C', true: '#34C759' }} thumbColor="#FFFFFF" />
            </View>

            <View style={styles.toggleRow}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#FF9500" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>Data Consent</Text>
                <Text style={styles.cardSub}>Sharing anonymised data for research and app improvement</Text>
              </View>
              <Switch value={dataConsent} onValueChange={setDataConsent} trackColor={{ false: '#3A3A3C', true: '#FF9500' }} thumbColor="#FFFFFF" />
            </View>
          </View>

          {/* Privacy nav items */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>PRIVACY</Text>
            {PRIVACY_ITEMS.map(renderNavItem)}
          </View>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 0 },
  card: { backgroundColor: '#181818', borderRadius: 12, marginBottom: 20, paddingVertical: 16 },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 16, marginHorizontal: 20, letterSpacing: 0.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 16, fontWeight: '500', color: '#FFFFFF' },
  cardSub: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  bottomSpacing: { height: 20 },
});

export default PrivacySecurityScreen;
