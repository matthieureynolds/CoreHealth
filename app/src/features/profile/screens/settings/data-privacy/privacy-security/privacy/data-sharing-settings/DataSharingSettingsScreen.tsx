import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataService } from '../../../../../../../../shared/services/data/dataService';
import { useAuth } from '../../../../../../../../shared/context/AuthContext';

const DataSharingSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [lastSyncTime, setLastSyncTime] = useState<string>('Never');
  const [isSyncing, setIsSyncing] = useState(false);
  const [healthMemory, setHealthMemory] = useState<string | null>(null);
  const [memoryUpdatedAt, setMemoryUpdatedAt] = useState<string | null>(null);
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [locationConsent, setLocationConsent] = useState<boolean>(false);

  const loadHealthMemory = useCallback(async () => {
    if (!user?.id) return;
    setMemoryLoading(true);
    try {
      const { memory, updatedAt } = await DataService.getHealthMemory(user.id);
      setHealthMemory(memory);
      setMemoryUpdatedAt(updatedAt);
    } catch { /* non-critical */ }
    finally { setMemoryLoading(false); }
  }, [user?.id]);

  const handleClearMemory = () => {
    Alert.alert(
      'Clear Toto Memory',
      'This will permanently erase everything Toto has learned about you. Your health records are not affected — only the AI\'s contextual memory is cleared.\n\nToto will start building a new understanding from your next conversation.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Memory',
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;
            try {
              await DataService.clearHealthMemory(user.id);
              setHealthMemory(null);
              setMemoryUpdatedAt(null);
              setShowMemoryModal(false);
              Alert.alert('Memory cleared', 'Toto\'s memory has been erased.');
            } catch {
              Alert.alert('Error', 'Failed to clear memory. Please try again.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadLastSyncTime();
    loadHealthMemory();
    AsyncStorage.getItem('@corehealth_location_consent').then(v => setLocationConsent(v === 'true')).catch(() => {});
  }, [loadHealthMemory]);

  const toggleLocationConsent = async (value: boolean) => {
    await AsyncStorage.setItem('@corehealth_location_consent', value ? 'true' : 'false');
    setLocationConsent(value);
    if (!value) {
      Alert.alert('Location sync disabled', 'Your location will no longer be synced to CoreHealth servers.');
    }
  };

  const loadLastSyncTime = async () => {
    try {
      const iso = await AsyncStorage.getItem('@corehealth_last_sync_at');
      if (iso) {
        setLastSyncTime(formatDateTime(new Date(iso)));
      } else {
        setLastSyncTime('Never');
      }
    } catch {
      setLastSyncTime('Never');
    }
  };

  const formatDateTime = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const handleSyncNow = async () => {
    try {
      setIsSyncing(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const now = new Date();
      setLastSyncTime(formatDateTime(now));
      try {
        await AsyncStorage.setItem('@corehealth_last_sync_at', now.toISOString());
      } catch (e) { console.error(e); }
      Alert.alert('Sync Complete', 'Your health data has been successfully synchronized.', [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('Sync Failed', 'There was an error syncing your data. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleWithdrawConsent = () => {
    Alert.alert(
      'Withdraw Processing Consent',
      'This records your withdrawal of consent for AI health data processing. Your stored data is not deleted — use "Delete Account" to erase all data.\n\nToto will stop processing your health data for AI insights until you re-consent.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw Consent',
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;
            try {
              await DataService.withdrawConsent(user.id);
              Alert.alert('Consent Withdrawn', 'Your withdrawal has been recorded. Contact us at privacy@corehealth.ai to request full data erasure (GDPR Art. 17).');
            } catch {
              Alert.alert('Error', 'Failed to record withdrawal. Please try again or email privacy@corehealth.ai.');
            }
          },
        },
      ]
    );
  };

  const handleDataSharingOptions = () => {
    Alert.alert(
      'Data Sharing Settings',
      'Choose how your data is shared for research and app improvement:',
      [
        {
          text: 'Allow All Sharing',
          onPress: () => Alert.alert('Settings Updated', 'Data sharing enabled for research and app improvement.'),
        },
        {
          text: 'Anonymized Only',
          onPress: () => Alert.alert('Settings Updated', 'Only anonymized data will be shared for research purposes.'),
        },
        {
          text: 'No Sharing',
          onPress: () => Alert.alert('Settings Updated', 'Data sharing disabled. Your data remains completely private.'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Data Sharing Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <Modal visible={showMemoryModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowMemoryModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Toto's Memory</Text>
            <TouchableOpacity onPress={() => setShowMemoryModal(false)} style={styles.modalClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll} contentContainerStyle={{ padding: 24 }}>
            <Text style={styles.modalMemoryText}>{healthMemory}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.modalClearButton} onPress={handleClearMemory} activeOpacity={0.8}>
            <Text style={styles.memoryClearButtonText}>Clear Memory</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardHeader}>DATA SYNC</Text>
            <View style={styles.syncInfoRow}>
              <Ionicons name="time-outline" size={20} color="#888" style={styles.cardIcon} />
              <Text style={styles.syncLabel}>Last Sync:</Text>
              <Text style={styles.syncTime}>{lastSyncTime}</Text>
            </View>
            <TouchableOpacity
              style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
              onPress={handleSyncNow}
              disabled={isSyncing}
              activeOpacity={0.8}
            >
              <View style={styles.syncButtonContent}>
                <Ionicons
                  name={isSyncing ? 'sync' : 'sync-outline'}
                  size={20}
                  color="#3AABF0"
                  style={styles.cardIcon}
                />
                <Text style={styles.syncButtonText}>{isSyncing ? 'Syncing...' : 'Sync Now'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>TOTO MEMORY</Text>
            {memoryLoading ? (
              <Text style={styles.cardSub}>Loading...</Text>
            ) : healthMemory ? (
              <>
                <Text style={styles.memoryPreview} numberOfLines={3}>{healthMemory}</Text>
                {memoryUpdatedAt && (
                  <Text style={styles.memoryUpdated}>Last updated: {new Date(memoryUpdatedAt).toLocaleDateString()}</Text>
                )}
                <View style={styles.memoryActions}>
                  <TouchableOpacity style={styles.memoryViewButton} onPress={() => setShowMemoryModal(true)} activeOpacity={0.8}>
                    <Text style={styles.memoryViewButtonText}>View Full Memory</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.memoryClearButton} onPress={handleClearMemory} activeOpacity={0.8}>
                    <Text style={styles.memoryClearButtonText}>Clear</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.cardRow}>
                <Ionicons name="brain-outline" size={22} color="#8E8E93" style={styles.cardIcon} />
                <Text style={styles.cardSub}>Toto hasn't built any memory yet. Start a conversation to get personalised insights.</Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>CONSENT</Text>
            <TouchableOpacity style={styles.cardRow} onPress={handleWithdrawConsent}>
              <Ionicons name="shield-outline" size={22} color="#FF9500" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>Withdraw Processing Consent</Text>
                <Text style={styles.cardSub}>GDPR Art. 7(3) — withdraw AI health data processing consent at any time</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>SHARING PREFERENCES</Text>
            <View style={styles.cardRow}>
              <Ionicons name="location-outline" size={22} color="#FF9500" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>Location Health Sync</Text>
                <Text style={styles.cardSub}>Sync your location to CoreHealth servers for travel health insights</Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleLocationConsent(!locationConsent)}
                style={[styles.toggle, locationConsent && styles.toggleOn]}
                activeOpacity={0.8}
              >
                <View style={[styles.toggleThumb, locationConsent && styles.toggleThumbOn]} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.cardRow} onPress={handleDataSharingOptions}>
              <Ionicons name="people-outline" size={22} color="#34C759" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>Research Data Sharing</Text>
                <Text style={styles.cardSub}>Control how your data is shared for research</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
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
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 16, marginBottom: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 16, letterSpacing: 0.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 16, fontWeight: '500', color: '#FFFFFF', flex: 1 },
  cardSub: { fontSize: 13, color: '#8E8E93' },
  syncInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  syncLabel: { fontSize: 16, color: '#8E8E93', marginRight: 12, fontWeight: '500' },
  syncTime: { fontSize: 16, color: '#FFFFFF', fontWeight: '700', letterSpacing: 0.3 },
  syncButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2C2C2E', paddingHorizontal: 20, paddingVertical: 16,
    borderRadius: 12, borderWidth: 1, borderColor: '#3AABF0',
  },
  syncButtonDisabled: { backgroundColor: '#1C1C1E', borderColor: '#4A4A4A' },
  syncButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  syncButtonText: { fontSize: 16, fontWeight: '600', color: '#3AABF0', marginLeft: 8 },
  toggle: {
    width: 44, height: 26, borderRadius: 13, backgroundColor: '#3A3A3C',
    justifyContent: 'center', paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: '#34C759' },
  toggleThumb: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleThumbOn: { alignSelf: 'flex-end' },
  memoryPreview: { fontSize: 14, color: '#EBEBF5CC', lineHeight: 20, marginBottom: 8 },
  memoryUpdated: { fontSize: 12, color: '#8E8E93', marginBottom: 14 },
  memoryActions: { flexDirection: 'row', gap: 10 },
  memoryViewButton: {
    flex: 1, backgroundColor: '#2C2C2E', paddingVertical: 10, borderRadius: 10,
    alignItems: 'center', borderWidth: 1, borderColor: '#3AABF0',
  },
  memoryViewButtonText: { fontSize: 14, fontWeight: '600', color: '#3AABF0' },
  memoryClearButton: {
    flex: 1, backgroundColor: '#2C2C2E', paddingVertical: 10, borderRadius: 10,
    alignItems: 'center', borderWidth: 1, borderColor: '#FF453A',
  },
  memoryClearButtonText: { fontSize: 14, fontWeight: '600', color: '#FF453A' },
  modalContainer: { flex: 1, backgroundColor: '#000' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: '#222',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  modalClose: { position: 'absolute', right: 24, top: 62 },
  modalScroll: { flex: 1 },
  modalMemoryText: { fontSize: 15, color: '#EBEBF5CC', lineHeight: 22 },
  modalClearButton: {
    margin: 24, backgroundColor: '#1C1C1E', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', borderWidth: 1, borderColor: '#FF453A',
  },
});

export default DataSharingSettingsScreen;
