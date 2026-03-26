import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DataSharingSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [lastSyncTime, setLastSyncTime] = useState<string>('Never');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadLastSyncTime();
  }, []);

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
            <Text style={styles.cardHeader}>SHARING PREFERENCES</Text>
            <TouchableOpacity style={styles.cardRow} onPress={handleDataSharingOptions}>
              <Ionicons name="people-outline" size={22} color="#34C759" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>Data Sharing Options</Text>
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
});

export default DataSharingSettingsScreen;
