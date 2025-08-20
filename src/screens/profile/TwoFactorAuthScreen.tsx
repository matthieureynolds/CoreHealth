import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';
import { useSettings } from '../../context/SettingsContext';

type TwoFactorAuthScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const TwoFactorAuthScreen: React.FC = () => {
  const navigation = useNavigation<TwoFactorAuthScreenNavigationProp>();
  const { settings, updatePrivacySettings } = useSettings();

  const [isEnabled, setIsEnabled] = useState(settings.privacy.twoFactorAuth);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle2FA = async () => {
    if (isEnabled) {
      // Disable 2FA
      Alert.alert(
        'Disable Two-Factor Authentication',
        'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              try {
                await updatePrivacySettings({ twoFactorAuth: false });
                setIsEnabled(false);
                Alert.alert('Success', 'Two-factor authentication has been disabled.');
              } catch (error) {
                Alert.alert('Error', 'Failed to disable two-factor authentication.');
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    } else {
      // Enable 2FA (simplified)
      setIsLoading(true);
      try {
        const codes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 8).toUpperCase());
        setBackupCodes(codes);
        await updatePrivacySettings({ twoFactorAuth: true });
        setIsEnabled(true);
        setShowBackupModal(true);
      } catch (error) {
        Alert.alert('Error', 'Failed to enable two-factor authentication.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const generateNewBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
    Alert.alert('Success', 'New backup codes have been generated. Please save them securely.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Two-Factor Authentication</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>SECURITY</Text>
          <View style={[styles.cardRow, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons name={isEnabled ? 'shield-checkmark' : 'shield-outline'} size={22} color={isEnabled ? '#4CD964' : '#8E8E93'} style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>Two-Factor Authentication</Text>
                <Text style={styles.cardSub}>{isEnabled ? 'Enabled' : 'Disabled'}</Text>
              </View>
            </View>
            <Switch value={isEnabled} onValueChange={handleToggle2FA} trackColor={{ false: '#333', true: '#007AFF' }} thumbColor="#FFFFFF" disabled={isLoading} />
          </View>
          {isEnabled && (
            <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
              <TouchableOpacity onPress={() => setShowBackupModal(true)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>View Backup Codes</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={generateNewBackupCodes} style={[styles.secondaryButton, { marginTop: 8 }]}>
                <Text style={styles.secondaryButtonText}>Generate New Codes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Backup Codes Modal */}
      <Modal visible={showBackupModal} transparent animationType="fade" onRequestClose={() => setShowBackupModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Backup Codes</Text>
              <TouchableOpacity onPress={() => setShowBackupModal(false)}>
                <Ionicons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <View style={{ gap: 8 }}>
              {backupCodes.map((code, idx) => (
                <View key={idx} style={styles.codeItemDark}>
                  <Text style={styles.codeTextDark}>{code}</Text>
                </View>
              ))}
              {backupCodes.length === 0 && (
                <Text style={styles.cardSub}>No codes yet. Toggle 2FA on to create them.</Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#000000' },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  card: { backgroundColor: '#1C1C1E', borderRadius: 12, marginHorizontal: 20, marginTop: 20, paddingVertical: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 16, marginHorizontal: 20, letterSpacing: 0.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 16, fontWeight: '500', color: '#FFFFFF', flex: 1 },
  cardSub: { fontSize: 13, color: '#8E8E93' },
  secondaryButton: { backgroundColor: '#2C2C2E', paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  secondaryButtonText: { color: '#FFFFFF', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  modalContainer: { backgroundColor: '#111', borderRadius: 12, padding: 20, width: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  codeItemDark: { backgroundColor: '#1C1C1E', padding: 12, borderRadius: 8 },
  codeTextDark: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center', fontFamily: 'monospace' },
});

export default TwoFactorAuthScreen; 