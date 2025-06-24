import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DevicesScreen: React.FC = () => {
  const mockDevices = [
    { id: '1', name: 'WHOOP 4.0', type: 'whoop', connected: true, lastSync: '2 hours ago' },
    { id: '2', name: 'Apple Watch Series 9', type: 'apple_watch', connected: true, lastSync: '1 hour ago' },
    { id: '3', name: 'Eight Sleep Pod', type: 'eight_sleep', connected: false, lastSync: 'Never' },
    { id: '4', name: 'Oral-B Smart Toothbrush', type: 'smart_toothbrush', connected: false, lastSync: 'Never' },
  ];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'whoop': return 'fitness';
      case 'apple_watch': return 'watch';
      case 'eight_sleep': return 'bed';
      case 'smart_toothbrush': return 'medical';
      default: return 'hardware-chip';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Connected Devices</Text>
        <Text style={styles.subtitle}>
          Manage your health devices and sync your data
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Devices</Text>
        {mockDevices.map((device) => (
          <View key={device.id} style={styles.deviceCard}>
            <View style={styles.deviceInfo}>
              <View style={[
                styles.deviceIcon,
                { backgroundColor: device.connected ? '#30D158' : '#E5E5EA' }
              ]}>
                <Ionicons 
                  name={getDeviceIcon(device.type) as any} 
                  size={24} 
                  color={device.connected ? '#fff' : '#666'} 
                />
              </View>
              <View style={styles.deviceDetails}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceStatus}>
                  {device.connected ? `Last sync: ${device.lastSync}` : 'Not connected'}
                </Text>
              </View>
            </View>
            <View style={styles.deviceActions}>
              <Switch
                value={device.connected}
                onValueChange={() => {}}
                trackColor={{ false: '#E5E5EA', true: '#30D158' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add New Device</Text>
        <TouchableOpacity style={styles.addDeviceCard}>
          <Ionicons name="add-circle" size={32} color="#007AFF" />
          <Text style={styles.addDeviceText}>Connect New Device</Text>
          <Text style={styles.addDeviceSubtext}>
            Scan for nearby devices or manually add a device
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Settings</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <Text style={styles.settingTitle}>Auto Sync</Text>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingTitle}>Background Sync</Text>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: '#E5E5EA', true: '#30D158' }}
              thumbColor="#fff"
            />
          </View>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingTitle}>Sync Frequency</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>Every 15 minutes</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.syncAllButton}>
          <Ionicons name="sync" size={24} color="#fff" />
          <Text style={styles.syncAllText}>Sync All Devices Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    lineHeight: 22,
  },
  section: {
    margin: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  deviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  deviceStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deviceActions: {
    marginLeft: 16,
  },
  addDeviceCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addDeviceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 8,
  },
  addDeviceSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  settingTitle: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  syncAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
  },
  syncAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});

export default DevicesScreen; 