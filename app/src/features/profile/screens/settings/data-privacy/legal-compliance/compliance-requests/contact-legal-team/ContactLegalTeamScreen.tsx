import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ContactLegalTeamScreen: React.FC = () => {
  const navigation = useNavigation();

  const openMail = async (to: string, subject: string) => {
    const url = `mailto:${to}?subject=${encodeURIComponent(subject)}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert('Email not configured', `Please email ${to} directly.`);
    }
  };

  const contactOptions = [
    {
      title: 'General Legal Enquiry',
      subtitle: 'Questions about Terms, policies, or legal matters',
      icon: 'document-text-outline' as const,
      iconColor: '#3AABF0',
      email: 'legal@corehealth.com',
      subject: 'Legal Enquiry',
    },
    {
      title: 'Data Protection Officer',
      subtitle: 'GDPR rights, data protection, or DPA matters',
      icon: 'shield-checkmark-outline' as const,
      iconColor: '#34C759',
      email: 'dpo@corehealth.com',
      subject: 'Data Protection Enquiry',
    },
    {
      title: 'Privacy Concerns',
      subtitle: 'Privacy policy questions or concerns',
      icon: 'lock-closed-outline' as const,
      iconColor: '#5856D6',
      email: 'privacy@corehealth.com',
      subject: 'Privacy Concern',
    },
    {
      title: 'Compliance & Regulatory',
      subtitle: 'HIPAA, GDPR, or regulatory compliance matters',
      icon: 'clipboard-outline' as const,
      iconColor: '#FF9500',
      email: 'compliance@corehealth.com',
      subject: 'Compliance Enquiry',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Contact Legal Team</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardHeader}>GET IN TOUCH</Text>
            {contactOptions.map((option, index) => (
              <TouchableOpacity
                key={option.email}
                style={[styles.cardRow, index === contactOptions.length - 1 && styles.lastRow]}
                onPress={() => openMail(option.email, option.subject)}
                activeOpacity={0.7}
              >
                <Ionicons name={option.icon} size={22} color={option.iconColor} style={styles.cardIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardLabel}>{option.title}</Text>
                  <Text style={styles.cardSub}>{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>RESPONSE TIMES</Text>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#3AABF0" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>General Enquiries</Text>
                <Text style={styles.infoText}>We aim to respond within 5 business days.</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="alert-circle-outline" size={20} color="#FF9500" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Data Subject Rights Requests</Text>
                <Text style={styles.infoText}>Responded to within 30 days as required by UK GDPR.</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="flash-outline" size={20} color="#FF3B30" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Data Breach Notifications</Text>
                <Text style={styles.infoText}>Handled within 72 hours of discovery per regulatory requirements.</Text>
              </View>
            </View>
          </View>
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
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  card: { backgroundColor: '#181818', borderRadius: 12, marginBottom: 20, paddingVertical: 16 },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 16, marginHorizontal: 20, letterSpacing: 0.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  lastRow: { borderBottomWidth: 0 },
  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 16, fontWeight: '500', color: '#FFFFFF' },
  cardSub: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, paddingHorizontal: 20 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#8E8E93', lineHeight: 18 },
});

export default ContactLegalTeamScreen;
