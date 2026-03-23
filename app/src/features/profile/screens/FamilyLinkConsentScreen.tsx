import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import familyService from '../../../shared/services/familyService';

type Toggle = {
  key: string;
  label: string;
  onset: string;
  enabled: boolean;
};

const defaultToggles: Toggle[] = [
  { key: 'prostate_cancer', label: 'Prostate cancer', onset: '50–59', enabled: false },
  { key: 'breast_cancer', label: 'Breast cancer', onset: '40–49', enabled: false },
  { key: 'ovarian_cancer', label: 'Ovarian cancer', onset: '40–49', enabled: false },
  { key: 't2d', label: 'Type 2 Diabetes', onset: '40–49', enabled: false },
  { key: 'cad', label: 'Coronary artery disease', onset: '50–59', enabled: false },
  { key: 'colorectal_cancer', label: 'Colorectal cancer', onset: '40–49', enabled: false },
  { key: 'glaucoma', label: 'Glaucoma', onset: '50–59', enabled: false },
];

const FamilyLinkConsentScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [toggles, setToggles] = useState<Toggle[]>(defaultToggles);

  const toggle = (key: string, value: boolean) => {
    setToggles((prev) => prev.map((t) => t.key === key ? { ...t, enabled: value } : t));
  };

  const broadcast = async () => {
    try {
      setIsLoading(true);
      // In a real flow, choose recipient from active links; here, this is a placeholder to be wired later
      Alert.alert('Setup Required', 'Select a recipient from your links to broadcast.');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to broadcast');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consent & Broadcast</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>WHAT IS SHARED</Text>
          <Text style={styles.body}>
            Share only family-history facts as anonymous signals. No names, no metrics, no timestamps. You can revoke anytime.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>BROADCAST SIGNALS</Text>
          {toggles.map((t) => (
            <View key={t.key} style={styles.row}>
              <Ionicons name="radio-button-off" size={18} color={t.enabled ? '#34C759' : '#666'} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t.label}</Text>
                <Text style={styles.sub}>Onset {t.onset}</Text>
              </View>
              <Switch
                value={t.enabled}
                onValueChange={(v) => toggle(t.key, v)}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
          <TouchableOpacity style={styles.primaryButton} onPress={broadcast} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Broadcast Updates</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    paddingTop: 72,
    paddingBottom: 5,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    justifyContent: 'space-between',
  },
  backButton: { padding: 8, position: 'absolute', left: 20, top: 23.5, zIndex: 1 },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 32.2,
    paddingBottom: 8,
  },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  card: { backgroundColor: '#181818', borderRadius: 12, marginBottom: 20, paddingVertical: 16, paddingHorizontal: 16 },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 12, letterSpacing: 0.5 },
  body: { color: '#fff', fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  label: { color: '#fff', fontSize: 15, fontWeight: '600' },
  sub: { color: '#8E8E93', fontSize: 12 },
  primaryButton: { backgroundColor: '#007AFF', paddingVertical: 12, alignItems: 'center', borderRadius: 10, marginTop: 12 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
});

export default FamilyLinkConsentScreen;


