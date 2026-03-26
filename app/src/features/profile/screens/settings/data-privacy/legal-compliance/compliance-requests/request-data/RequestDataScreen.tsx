import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const RequestDataScreen: React.FC = () => {
  const navigation = useNavigation();
  const [requestSent, setRequestSent] = useState(false);

  const openMail = async (subject: string, body: string) => {
    const url = `mailto:privacy@corehealth.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      setRequestSent(true);
    } else {
      Alert.alert('Email not configured', 'Please email privacy@corehealth.com directly.');
    }
  };

  const requestOptions = [
    {
      title: 'Request a Copy of My Data',
      subtitle: 'Receive all personal data we hold about you (Right of Access)',
      icon: 'download-outline' as const,
      iconColor: '#3AABF0',
      subject: 'Data Access Request (Subject Access Request)',
      body: 'I am submitting a Subject Access Request under UK GDPR / GDPR. Please provide a copy of all personal data you hold about me.\n\nAccount email: [your email]\nDate of request: ' + new Date().toLocaleDateString(),
    },
    {
      title: 'Request Data Correction',
      subtitle: 'Correct inaccurate or incomplete personal data',
      icon: 'create-outline' as const,
      iconColor: '#34C759',
      subject: 'Data Rectification Request',
      body: 'I am requesting rectification of inaccurate or incomplete personal data held about me under UK GDPR / GDPR Article 16.\n\nData to be corrected:\n[Please describe]\n\nAccount email: [your email]',
    },
    {
      title: 'Request Data Portability',
      subtitle: 'Receive your data in a machine-readable format',
      icon: 'share-outline' as const,
      iconColor: '#5856D6',
      subject: 'Data Portability Request',
      body: 'I am exercising my right to data portability under UK GDPR / GDPR Article 20. Please provide my personal data in a structured, commonly used, machine-readable format.\n\nAccount email: [your email]',
    },
    {
      title: 'Object to Data Processing',
      subtitle: 'Object to how your data is being processed',
      icon: 'hand-left-outline' as const,
      iconColor: '#FF9500',
      subject: 'Objection to Data Processing',
      body: 'I am exercising my right to object to processing under UK GDPR / GDPR Article 21.\n\nProcessing activity I am objecting to:\n[Please describe]\n\nAccount email: [your email]',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Request Data</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        <View style={styles.content}>
          {requestSent && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" style={{ marginRight: 10 }} />
              <Text style={styles.successText}>Request sent! We will respond within 30 days.</Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardHeader}>YOUR DATA RIGHTS</Text>
            {requestOptions.map((option, index) => (
              <TouchableOpacity
                key={option.subject}
                style={[styles.cardRow, index === requestOptions.length - 1 && styles.lastRow]}
                onPress={() => openMail(option.subject, option.body)}
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
            <Text style={styles.cardHeader}>HOW IT WORKS</Text>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#3AABF0" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Submit Your Request</Text>
                <Text style={styles.infoText}>Select the type of request above. An email will open pre-filled with the required information.</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#FF9500" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Identity Verification</Text>
                <Text style={styles.infoText}>We may ask for identity verification to protect your account before fulfilling the request.</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#34C759" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Response Within 30 Days</Text>
                <Text style={styles.infoText}>We will respond to all data rights requests within 30 days as required by UK GDPR.</Text>
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
  successBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(52,199,89,0.1)',
    borderWidth: 1, borderColor: 'rgba(52,199,89,0.3)', borderRadius: 12,
    padding: 14, marginBottom: 20,
  },
  successText: { flex: 1, color: '#34C759', fontSize: 14 },
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

export default RequestDataScreen;
