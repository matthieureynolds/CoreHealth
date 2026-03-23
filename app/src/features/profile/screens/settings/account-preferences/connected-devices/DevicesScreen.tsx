import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DevicesScreen: React.FC = () => {
  const [devices, setDevices] = useState([
          {
        id: '1',
        name: 'WHOOP 4.0',
        type: 'whoop',
        connected: true,
        lastSync: '2 hours ago',
        battery: 85,
        image: null,
      },
      {
        id: '2',
        name: 'Apple Watch Series 9',
        type: 'apple_watch',
        connected: true,
        lastSync: '1 hour ago',
        battery: 92,
        image: null,
      },
      {
        id: '3',
        name: 'Eight Sleep Pod',
        type: 'eight_sleep',
        connected: false,
        lastSync: 'Never',
        battery: 0,
        image: null,
      },
      {
        id: '4',
        name: 'Oral-B Smart Toothbrush',
        type: 'smart_toothbrush',
        connected: false,
        lastSync: 'Never',
        battery: 0,
        image: null,
      },
      {
        id: '5',
        name: 'Oura Ring',
        type: 'oura_ring',
        connected: false,
        lastSync: 'Never',
        battery: 0,
        image: null,
      },
      {
        id: '6',
        name: 'Fitbit Sense',
        type: 'fitbit',
        connected: false,
        lastSync: 'Never',
        battery: 0,
        image: null,
      },
  ]);

  const [autoSync, setAutoSync] = useState(true);
  const [backgroundSync, setBackgroundSync] = useState(true);

  const toggleDeviceConnection = (deviceId: string) => {
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.id === deviceId
          ? { ...device, connected: !device.connected }
          : device
      )
    );
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'whoop':
        return 'fitness';
      case 'apple_watch':
        return 'watch';
      case 'eight_sleep':
        return 'bed';
      case 'smart_toothbrush':
        return 'medical';
      case 'oura_ring':
        return 'ellipse';
      case 'fitbit':
        return 'pulse';
      default:
        return 'hardware-chip';
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return '#30D158';
    if (battery > 20) return '#FF9500';
    return '#FF3B30';
  };

  const getBatteryIcon = (battery: number) => {
    if (battery > 80) return 'battery-full';
    if (battery > 60) return 'battery-three-quarters';
    if (battery > 40) return 'battery-half';
    if (battery > 20) return 'battery-quarter';
    return 'battery-dead';
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
          <View key={device.id} style={styles.deviceCard}>
            <View style={styles.deviceInfo}>
              <View style={styles.deviceImageContainer}>
                {device.image ? (
                  <Image source={device.image} style={styles.deviceImage} />
                ) : (
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
                )}
                {device.connected && (
                  <View style={styles.connectionIndicator}>
                    <View style={styles.connectionDot} />
                  </View>
                )}
              </View>
              
              <View style={styles.deviceDetails}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <View style={styles.deviceStatus}>
                  <Text style={[
                    styles.deviceStatusText,
                    { color: device.connected ? '#30D158' : '#8E8E93' }
                  ]}>
                    {device.connected ? 'Connected' : 'Not connected'}
                  </Text>
                  {device.connected && (
                    <Text style={styles.lastSyncText}>
                      Last sync: {device.lastSync}
                    </Text>
                  )}
                </View>
                
                {device.connected && device.battery > 0 && (
                  <View style={styles.batteryInfo}>
                    <Ionicons 
                      name={getBatteryIcon(device.battery) as any} 
                      size={16} 
                      color={getBatteryColor(device.battery)} 
                    />
                    <Text style={[
                      styles.batteryText,
                      { color: getBatteryColor(device.battery) }
                    ]}>
                      {device.battery}%
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.deviceActions}>
              <Switch
                value={device.connected}
                onValueChange={() => toggleDeviceConnection(device.id)}
                trackColor={{ false: '#E5E5EA', true: '#30D158' }}
                thumbColor="#fff"
                ios_backgroundColor="#E5E5EA"
              />
            </View>
          </View>
        ))}
      </View>

      {/* Add New Device */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add New Device</Text>
        <TouchableOpacity style={styles.addDeviceCard}>
          <View style={styles.addDeviceIcon}>
            <Ionicons name="add-circle" size={32} color="#007AFF" />
          </View>
          <View style={styles.addDeviceContent}>
            <Text style={styles.addDeviceText}>Connect New Device</Text>
            <Text style={styles.addDeviceSubtext}>
              Scan for nearby devices or manually add a device
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      {/* Sync Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Settings</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="sync" size={20} color="#007AFF" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Auto Sync</Text>
                <Text style={styles.settingDescription}>
                  Automatically sync data when devices are connected
                </Text>
              </View>
            </View>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor="#fff"
              ios_backgroundColor="#E5E5EA"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="cloud-upload" size={20} color="#007AFF" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Background Sync</Text>
                <Text style={styles.settingDescription}>
                  Sync data even when app is in background
                </Text>
              </View>
            </View>
            <Switch
              value={backgroundSync}
              onValueChange={setBackgroundSync}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor="#fff"
              ios_backgroundColor="#E5E5EA"
            />
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="time" size={20} color="#007AFF" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Sync Frequency</Text>
                <Text style={styles.settingDescription}>
                  How often to sync your data
                </Text>
              </View>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>Every 15 minutes</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sync All Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.syncAllButton}>
          <Ionicons name="sync" size={24} color="#fff" />
          <Text style={styles.syncAllText}>Sync All Devices Now</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
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
  deviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  deviceImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#30D158',
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  deviceStatus: {
    marginBottom: 4,
  },
  deviceStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  batteryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deviceActions: {
    marginLeft: 12,
  },
  addDeviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addDeviceIcon: {
    marginRight: 12,
  },
  addDeviceContent: {
    flex: 1,
  },
  addDeviceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  addDeviceSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
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
