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

const DataSyncScreen: React.FC = () => {
  const navigation = useNavigation();
  const [lastSyncTime, setLastSyncTime] = useState<string>('Never');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Load last sync time from storage or set default
    loadLastSyncTime();
  }, []);

  const loadLastSyncTime = () => {
    // In a real app, this would load from AsyncStorage or database
    // For now, we'll use a mock time
    const mockLastSync = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    setLastSyncTime(formatDateTime(mockLastSync));
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
      console.log('🔄 DataSyncScreen: Starting sync...');
      
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update last sync time
      const now = new Date();
      setLastSyncTime(formatDateTime(now));
      
      console.log('✅ DataSyncScreen: Sync completed successfully');
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Data & Sync</Text>
          <View style={{ width: 24 }} />
        </View>

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
          >
            <View style={styles.syncButtonContent}>
              {isSyncing ? (
                <Ionicons name="sync" size={24} color="#fff" style={styles.syncSpinner} />
              ) : (
                <Ionicons name="sync-outline" size={24} color="#fff" style={styles.syncIcon} />
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
    backgroundColor: '#111',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#111',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  syncInfoCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
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
    color: '#888',
    marginRight: 8,
  },
  syncTime: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    backgroundColor: '#666',
  },
  syncButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  syncSpinner: {
    // Add rotation animation for the spinner
  },
});

export default DataSyncScreen; 