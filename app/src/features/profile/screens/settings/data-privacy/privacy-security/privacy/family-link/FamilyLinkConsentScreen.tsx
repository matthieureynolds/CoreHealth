import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SettingsHeader from '../../../../components/SettingsHeader';
import { SETTINGS_SCROLL_PT } from '../../../../components/settingsLayout';

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
  const [isLoading, setIsLoading] = useState(false);
  const [toggles, setToggles] = useState<Toggle[]>(defaultToggles);

  const toggle = (key: string, value: boolean) => {
    setToggles((prev) => prev.map((t) => t.key === key ? { ...t, enabled: value } : t));
  };

  const broadcast = async () => {
    try {
      setIsLoading(true);
      Alert.alert('Setup Required', 'Select a recipient from your links to broadcast.');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to broadcast');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SettingsHeader title="Consent & Broadcast" />

      <View style={[styles.content, { paddingTop: SETTINGS_SCROLL_PT }]}>
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
                trackColor={{ false: '#333', true: '#3AABF0' }}
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
  content: { paddingHorizontal: 20, paddingTop: 20 },
  card: { backgroundColor: '#181818', borderRadius: 12, marginBottom: 20, paddingVertical: 16, paddingHorizontal: 16 },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 12, letterSpacing: 0.5 },
  body: { color: '#fff', fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  label: { color: '#fff', fontSize: 15, fontWeight: '600' },
  sub: { color: '#8E8E93', fontSize: 12 },
  primaryButton: { backgroundColor: '#3AABF0', paddingVertical: 12, alignItems: 'center', borderRadius: 10, marginTop: 12 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
});

export default FamilyLinkConsentScreen;
