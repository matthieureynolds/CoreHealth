import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DataSyncScreen: React.FC = () => {
  const navigation = useNavigation();
  const [lastSyncTime, setLastSyncTime] = useState<string>('Never');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedRecently, setSyncedRecently] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spinLoop = useRef<Animated.CompositeAnimation | null>(null);

  const startSpin = () => {
    spinAnim.setValue(0);
    spinLoop.current = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 800, useNativeDriver: true })
    );
    spinLoop.current.start();
  };

  const stopSpin = () => {
    spinLoop.current?.stop();
    spinAnim.setValue(0);
  };

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  useEffect(() => {
    loadLastSyncTime();
  }, []);

  const loadLastSyncTime = async () => {
    try {
      const iso = await AsyncStorage.getItem('@corehealth_last_sync_at');
      if (iso) {
        const dt = new Date(iso);
        setLastSyncTime(formatDateTime(dt));
        const hoursSince = (Date.now() - dt.getTime()) / (1000 * 60 * 60);
        setSyncedRecently(hoursSince < 24);
      } else {
        setLastSyncTime('Never');
        setSyncedRecently(false);
      }
    } catch {
      setLastSyncTime('Never');
      setSyncedRecently(false);
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
      startSpin();

      await new Promise(resolve => setTimeout(resolve, 2000));

      const now = new Date();
      setLastSyncTime(formatDateTime(now));
      try {
        await AsyncStorage.setItem('@corehealth_last_sync_at', now.toISOString());
      } catch (e) { console.error(e); }

      stopSpin();
      setIsSyncing(false);
      setSyncedRecently(true);
    } catch (error) {
      console.error('❌ DataSyncScreen: Sync failed:', error);
      stopSpin();
      setIsSyncing(false);
      Alert.alert('Sync Failed', 'There was an error syncing your data. Please try again.', [{ text: 'OK' }]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data & Sync</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 95 }}>
        {/* Content */}
        <View style={styles.content}>
          {/* Last Sync Info */}
          <View style={styles.syncInfoCard}>
            <View style={styles.syncInfoRow}>
              <Ionicons name="time-outline" size={20} color="#888" style={styles.syncIcon} />
              <Text style={styles.syncLabel}>Last Sync:</Text>
              <Text style={styles.syncTime}>{lastSyncTime}</Text>
              <TouchableOpacity onPress={handleSyncNow} disabled={isSyncing} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={{ marginLeft: 'auto' }}>
                <Animated.View style={{ transform: [{ rotate: isSyncing ? spin : '0deg' }] }}>
                  <Ionicons
                    name={isSyncing ? 'sync' : 'sync-outline'}
                    size={22}
                    color={syncedRecently ? '#34C759' : '#FF9F40'}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
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
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  syncButtonDisabled: {
    borderColor: '#4A4A4A',
  },
  syncButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 6,
  },
});

export default DataSyncScreen;
