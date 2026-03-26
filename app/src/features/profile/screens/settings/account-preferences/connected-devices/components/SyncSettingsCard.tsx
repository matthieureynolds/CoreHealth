import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SyncSettingsCardProps {
  autoSync: boolean;
  backgroundSync: boolean;
  onAutoSyncChange: (value: boolean) => void;
  onBackgroundSyncChange: (value: boolean) => void;
}

const SyncSettingsCard: React.FC<SyncSettingsCardProps> = ({
  autoSync,
  backgroundSync,
  onAutoSyncChange,
  onBackgroundSyncChange,
}) => (
  <View style={styles.settingsCard}>
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Ionicons name="sync" size={20} color="#3AABF0" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>Auto Sync</Text>
          <Text style={styles.settingDescription}>
            Automatically sync data when devices are connected
          </Text>
        </View>
      </View>
      <Switch
        value={autoSync}
        onValueChange={onAutoSyncChange}
        trackColor={{ false: '#E5E5EA', true: '#3AABF0' }}
        thumbColor="#fff"
        ios_backgroundColor="#E5E5EA"
      />
    </View>

    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Ionicons name="cloud-upload" size={20} color="#3AABF0" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>Background Sync</Text>
          <Text style={styles.settingDescription}>
            Sync data even when app is in background
          </Text>
        </View>
      </View>
      <Switch
        value={backgroundSync}
        onValueChange={onBackgroundSyncChange}
        trackColor={{ false: '#E5E5EA', true: '#3AABF0' }}
        thumbColor="#fff"
        ios_backgroundColor="#E5E5EA"
      />
    </View>

    <TouchableOpacity style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Ionicons name="time" size={20} color="#3AABF0" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>Sync Frequency</Text>
          <Text style={styles.settingDescription}>How often to sync your data</Text>
        </View>
      </View>
      <View style={styles.settingValue}>
        <Text style={styles.settingValueText}>Every 15 minutes</Text>
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </View>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 16,
    color: '#8E8E93',
    marginRight: 4,
  },
});

export default SyncSettingsCard;
