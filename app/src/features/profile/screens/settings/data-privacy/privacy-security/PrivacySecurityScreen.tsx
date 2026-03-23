import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type NavItem = {
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  route: string;
};

const SECURITY_ITEMS: NavItem[] = [
  {
    title: 'Biometric Lock / Face ID',
    subtitle: 'Protect your health data with fingerprint or face recognition',
    icon: 'finger-print-outline',
    iconColor: '#007AFF',
    route: 'BiometricLock',
  },
  {
    title: 'Location Access',
    subtitle: 'Manage location permissions for travel and health features',
    icon: 'location-outline',
    iconColor: '#34C759',
    route: 'LocationAccess',
  },
  {
    title: 'Data Consent',
    subtitle: 'Control how your anonymized data is used for research',
    icon: 'shield-checkmark-outline',
    iconColor: '#FF9500',
    route: 'DataConsent',
  },
];

const SECURITY_INFO_ITEMS: NavItem[] = [
  {
    title: 'Data Processing Agreement',
    subtitle: 'How CoreHealth processes your personal data',
    icon: 'document-text-outline',
    iconColor: '#5856D6',
    route: 'DataProcessingAgreement',
  },
  {
    title: 'Data Retention Policy',
    subtitle: 'How long we store your data and deletion timelines',
    icon: 'time-outline',
    iconColor: '#007AFF',
    route: 'DataRetentionPolicy',
  },
];

const PRIVACY_ITEMS: NavItem[] = [
  {
    title: 'Family Link',
    subtitle: 'Anonymous family history links for risk-only insights',
    icon: 'link-outline',
    iconColor: '#0A84FF',
    route: 'FamilyLink',
  },
  {
    title: 'Data Sharing Settings',
    subtitle: 'Sync your data and manage sharing preferences',
    icon: 'people-outline',
    iconColor: '#34C759',
    route: 'DataSharingSettings',
  },
  {
    title: 'Health Data Download',
    subtitle: 'Export and download all your health data as a PDF',
    icon: 'download-outline',
    iconColor: '#5856D6',
    route: 'HealthDataDownload',
  },
  {
    title: 'Delete Account & Data',
    subtitle: 'Permanently remove your account and all health data',
    icon: 'trash-outline',
    iconColor: '#FF3B30',
    route: 'DeleteAccount',
  },
];

const PrivacySecurityScreen: React.FC = () => {
  const navigation = useNavigation();

  const renderNavItem = (item: NavItem) => (
    <TouchableOpacity
      key={item.route}
      style={styles.cardRow}
      onPress={() => (navigation as any).navigate(item.route)}
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
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Privacy & Security</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardHeader}>SECURITY</Text>
            {SECURITY_ITEMS.map(renderNavItem)}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>SECURITY INFORMATION</Text>
            {SECURITY_INFO_ITEMS.map(renderNavItem)}
          </View>

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
  header: {
    paddingTop: 72, paddingBottom: 5, backgroundColor: '#181818',
    borderBottomWidth: 1, borderBottomColor: '#222', justifyContent: 'space-between',
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, elevation: 10,
  },
  backButton: { padding: 8, position: 'absolute', left: 20, top: 23.5, zIndex: 1 },
  headerTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center',
    position: 'absolute', left: 0, right: 0, paddingTop: 32.2, paddingBottom: 8,
  },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 0 },
  card: { backgroundColor: '#181818', borderRadius: 12, marginBottom: 20, paddingVertical: 16 },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 16, marginHorizontal: 20, letterSpacing: 0.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 16, fontWeight: '500', color: '#FFFFFF' },
  cardSub: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  bottomSpacing: { height: 20 },
});

export default PrivacySecurityScreen;
