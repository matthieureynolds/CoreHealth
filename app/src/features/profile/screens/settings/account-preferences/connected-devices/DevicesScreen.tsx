import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DeviceCard, { Device } from './components/DeviceCard';
import AddDeviceCard from './components/AddDeviceCard';
import SyncSettingsCard from './components/SyncSettingsCard';

const DevicesScreen: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([
    { id: '1', name: 'WHOOP 4.0', type: 'whoop', connected: true, lastSync: '2 hours ago', battery: 85, image: null },
    { id: '2', name: 'Apple Watch Series 9', type: 'apple_watch', connected: true, lastSync: '1 hour ago', battery: 92, image: null },
    { id: '3', name: 'Eight Sleep Pod', type: 'eight_sleep', connected: false, lastSync: 'Never', battery: 0, image: null },
    { id: '4', name: 'Oral-B Smart Toothbrush', type: 'smart_toothbrush', connected: false, lastSync: 'Never', battery: 0, image: null },
    { id: '5', name: 'Oura Ring', type: 'oura_ring', connected: false, lastSync: 'Never', battery: 0, image: null },
    { id: '6', name: 'Fitbit Sense', type: 'fitbit', connected: false, lastSync: 'Never', battery: 0, image: null },
  ]);

  const [autoSync, setAutoSync] = useState(true);
  const [backgroundSync, setBackgroundSync] = useState(true);

  const toggleDeviceConnection = (deviceId: string) => {
    setDevices(prev =>
      prev.map(device =>
        device.id === deviceId ? { ...device, connected: !device.connected } : device,
      ),
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Connected Devices</Text>
        <Text style={styles.subtitle}>
          Manage your health devices and sync your data
        </Text>
      </View>

      {/* Connected Devices */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Devices</Text>
          <Text style={styles.deviceCount}>
            {devices.filter(d => d.connected).length} connected
          </Text>
        </View>
        {devices.map(device => (
          <DeviceCard key={device.id} device={device} onToggle={toggleDeviceConnection} />
        ))}
      </View>

      {/* Add New Device */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add New Device</Text>
        <AddDeviceCard />
      </View>

      {/* Sync Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Settings</Text>
        <SyncSettingsCard
          autoSync={autoSync}
          backgroundSync={backgroundSync}
          onAutoSyncChange={setAutoSync}
          onBackgroundSyncChange={setBackgroundSync}
        />
      </View>

      {/* Sync All Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.syncAllButton}>
          <Ionicons name="sync" size={24} color="#fff" />
          <Text style={styles.syncAllText}>Sync All Devices Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
    lineHeight: 22,
  },
  section: {
    margin: 20,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  deviceCount: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  syncAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  syncAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default DevicesScreen;
