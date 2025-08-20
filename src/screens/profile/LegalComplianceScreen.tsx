import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const LegalComplianceScreen: React.FC = () => {
  const navigation = useNavigation();
  const openMail = async (to: string, subject: string) => {
    const url = `mailto:${to}?subject=${encodeURIComponent(subject)}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) return Linking.openURL(url);
    Alert.alert('Email not configured', 'Please set up a mail app.');
  };

  const openPlaceholder = (title: string) => Alert.alert(title, 'This will open the document in a web view or PDF viewer.');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Legal Documents */}
      <View style={styles.header}> 
        <TouchableOpacity onPress={() => (navigation as any).goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal & Compliance</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>LEGAL DOCUMENTS</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => (navigation as any).navigate('TermsOfService')}>
          <Ionicons name="document-text-outline" size={22} color="#007AFF" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Terms & Conditions</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => (navigation as any).navigate('PrivacyPolicy')}>
          <Ionicons name="shield-outline" size={22} color="#34C759" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => (navigation as any).navigate('ConsentForms')}>
          <Ionicons name="checkbox-outline" size={22} color="#FF9500" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Consent Forms</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => (navigation as any).navigate('ComplianceNotices')}>
          <Ionicons name="globe-outline" size={22} color="#5856D6" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>HIPAA / GDPR Region-Based Notices</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Compliance & Requests */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>COMPLIANCE & REQUESTS</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => (navigation as any).navigate('DataProcessingAgreement')}>
          <Ionicons name="settings-outline" size={22} color="#007AFF" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Data Processing Agreement</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => (navigation as any).navigate('DataRetentionPolicy')}>
          <Ionicons name="time-outline" size={22} color="#8E8E93" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Data Retention Policy</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => openMail('legal@corehealth.com', 'Contact Legal Team')}>
          <Ionicons name="mail-outline" size={22} color="#FF3B30" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Contact Legal Team</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => openMail('privacy@corehealth.com', 'Request My Data')}>
          <Ionicons name="document-text-outline" size={22} color="#34C759" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Request Data</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
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
  chevron: {
    marginLeft: 'auto',
  },
});

export default LegalComplianceScreen;