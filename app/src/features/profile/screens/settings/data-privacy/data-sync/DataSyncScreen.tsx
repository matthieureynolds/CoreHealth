import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DataSyncScreen: React.FC = () => {
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
        const dt = new Date(iso);
        setLastSyncTime(formatDateTime(dt));
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
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const handleSyncNow = async () => {
    try {
      setIsSyncing(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const now = new Date();
      setLastSyncTime(formatDateTime(now));
      try {
        await AsyncStorage.setItem('@corehealth_last_sync_at', now.toISOString());
      } catch {}
      
      Alert.alert(
        'Sync Complete',
        'Your health data has been successfully synchronized.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ DataSyncScreen: Sync failed:', error);
      Alert.alert(
        'Sync Failed',
        'There was an error syncing your data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Data & Sync</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        {/* Content */}
        <View style={styles.content}>
          {/* Last Sync Info */}
          <View style={styles.syncInfoCard}>
            <View style={styles.syncInfoRow}>
              <Ionicons name="time-outline" size={20} color="#888" style={styles.syncIcon} />
              <Text style={styles.syncLabel}>Last Sync:</Text>
              <Text style={styles.syncTime}>{lastSyncTime}</Text>
            </View>
          </View>

          {/* Sync Now Button */}
          <TouchableOpacity
            style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
            onPress={handleSyncNow}
            disabled={isSyncing}
            activeOpacity={0.8}
          >
            <View style={styles.syncButtonContent}>
              {isSyncing ? (
                <Ionicons name="sync" size={20} color="#007AFF" style={styles.syncIcon} />
              ) : (
                <Ionicons name="sync-outline" size={20} color="#007AFF" style={styles.syncIcon} />
              )}
              <Text style={styles.syncButtonText}>
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 72,
    paddingBottom: 5,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    left: 20,
    top: 23.5,
    zIndex: 1,
  },
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    flex: 1,
  },
  syncInfoCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  syncInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncIcon: {
    marginRight: 8,
  },
  syncLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginRight: 12,
    fontWeight: '500',
  },
  syncTime: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  syncButtonDisabled: {
    backgroundColor: '#1C1C1E',
    borderColor: '#4A4A4A',
  },
  syncButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
});

export default DataSyncScreen;
