import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import SettingsHeader from '../../components/SettingsHeader';
import { SETTINGS_SCROLL_PT } from '../../components/settingsLayout';
import ConnectedDeviceItem, { Device } from './components/ConnectedDeviceItem';
import AvailableDeviceItem from './components/AvailableDeviceItem';
import { DataService } from '../../../../../../shared/services/data/dataService';
import { useAuth } from '../../../../../../shared/context/AuthContext';
import { initHealthKit, fetchHealthSnapshot } from '../../../../../../shared/services/device/healthKitService';

const AVAILABLE_DEVICES: Device[] = [
  { id: 'whoop',           name: 'WHOOP',           logo: require('../../../../../../../assets/device-logos/WHOOP.webp'),            color: '#000000', description: 'Activity & recovery tracking' },
  { id: 'apple-health',    name: 'Apple Health',    logo: require('../../../../../../../assets/device-logos/Apple-Health.webp'),     color: '#FF2D55', description: 'iOS aggregator' },
  { id: 'dexcom',          name: 'Dexcom',          logo: require('../../../../../../../assets/device-logos/DEXCOM.webp'),           color: '#FF9500', description: 'Continuous glucose monitoring' },
  { id: 'eight-sleep',     name: 'Eight Sleep',     logo: require('../../../../../../../assets/device-logos/EIGHT-SLEEP.webp'),      color: '#000000', description: 'Smart mattress & sleep tracking' },
  { id: 'fitbit',          name: 'Fitbit',          logo: require('../../../../../../../assets/device-logos/FITBIT.webp'),           color: '#00B0B9', description: 'Activity & health tracking' },
  { id: 'freestyle-libre', name: 'FreeStyle Libre', logo: require('../../../../../../../assets/device-logos/FREESTYLELIBRE-3.webp'),color: '#3AABF0', description: 'Glucose monitoring system' },
  { id: 'garmin',          name: 'Garmin Connect',  logo: require('../../../../../../../assets/device-logos/GARMIN.webp'),           color: '#1A1A2E', description: 'Fitness devices & wearables' },
  { id: 'oura',            name: 'Oura Ring',       logo: require('../../../../../../../assets/device-logos/OURA.webp'),             color: '#1A2B5E', description: 'Sleep & recovery tracking' },
  { id: 'withings',        name: 'Withings',        logo: require('../../../../../../../assets/device-logos/WITHINGS.webp'),         color: '#3AABF0', description: 'Health monitoring devices' },
  { id: 'zoe',             name: 'ZOE',             logo: require('../../../../../../../assets/device-logos/ZOE.webp'),              color: '#000000', description: 'Nutrition & gut health insights' },
];

const DEFAULT_CONNECTED: Device[] = [
  { id: '2', name: 'Apple Health', logo: require('../../../../../../../assets/device-logos/Apple-Health.webp'), color: '#FF2D55', status: 'Connected', lastSync: '1 hour ago' },
  { id: '1', name: 'WHOOP',        logo: require('../../../../../../../assets/device-logos/WHOOP.webp'),        color: '#000000', status: 'Connected', lastSync: '2 hours ago' },
];

const sortAlpha = (devices: Device[]) =>
  [...devices].sort((a, b) => a.name.localeCompare(b.name));

const ConnectedDevicesScreen: React.FC = () => {
  const { user } = useAuth();
  const [connectedDevices, setConnectedDevices] = useState<Device[]>(DEFAULT_CONNECTED);
  const [connectingDevice, setConnectingDevice] = useState<string | null>(null);

  const filteredAvailable = sortAlpha(
    AVAILABLE_DEVICES.filter(avail =>
      !connectedDevices.some(conn =>
        conn.name.toLowerCase().includes(avail.name.toLowerCase().replace(/[®™]/g, '').trim())
      )
    )
  );

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('connectedDevices');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setConnectedDevices(sortAlpha(parsed));
        } else {
          await AsyncStorage.setItem('connectedDevices', JSON.stringify(connectedDevices));
        }
      } catch (e) { console.error(e); }
    })();
  }, []);

  const persist = async (list: Device[]) => {
    try { await AsyncStorage.setItem('connectedDevices', JSON.stringify(list)); }
    catch (e) { console.error(e); }
  };

  const connectWithOAuth = async (device: Device, oauthType: 'whoop' | 'oura') => {
    if (!user?.id) { Alert.alert('Error', 'Not signed in.'); return; }
    setConnectingDevice(device.id);
    try {
      const { authUrl, redirectUri } = await DataService.getDeviceAuthUrl(user.id, oauthType);
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      if (result.type === 'success') {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        if (code) {
          await DataService.exchangeDeviceCode(user.id, oauthType, code, redirectUri);
          const newDevice: Device = {
            id: Date.now().toString(),
            name: device.name,
            logo: device.logo,
            color: device.color,
            status: 'Connected',
            lastSync: 'Just now',
          };
          const updated = sortAlpha([...connectedDevices, newDevice]);
          setConnectedDevices(updated);
          await persist(updated);
          Alert.alert('Connected', `${device.name} connected successfully!`);
        }
      }
    } catch (e: any) {
      Alert.alert('Connection Failed', e.message || 'Could not connect. Please try again.');
    } finally {
      setConnectingDevice(null);
    }
  };

  const connectAppleHealth = async (device: Device) => {
    if (!user?.id) { Alert.alert('Error', 'Not signed in.'); return; }
    setConnectingDevice(device.id);
    try {
      const granted = await initHealthKit();
      if (!granted) {
        Alert.alert('Permission Denied', 'Please allow CoreHealth to access Apple Health in Settings.');
        return;
      }
      const snapshot = await fetchHealthSnapshot();
      await DataService.ingestDeviceData(user.id, {
        deviceType: 'apple_health',
        deviceName: 'Apple Health',
        metrics: snapshot,
        timestamp: new Date().toISOString(),
      });
      const newDevice: Device = {
        id: Date.now().toString(),
        name: device.name,
        logo: device.logo,
        color: device.color,
        status: 'Connected',
        lastSync: 'Just now',
      };
      const updated = sortAlpha([...connectedDevices, newDevice]);
      setConnectedDevices(updated);
      await persist(updated);
      Alert.alert('Connected', 'Apple Health data synced successfully!');
    } catch (e: any) {
      Alert.alert('Connection Failed', e.message || 'Could not connect Apple Health.');
    } finally {
      setConnectingDevice(null);
    }
  };

  const handleConnect = (device: Device) => {
    if (device.id === 'whoop') {
      connectWithOAuth(device, 'whoop');
      return;
    }
    if (device.id === 'oura') {
      connectWithOAuth(device, 'oura');
      return;
    }
    if (device.id === 'apple-health') {
      connectAppleHealth(device);
      return;
    }
    Alert.alert(`Connect ${device.name}`, `Would you like to connect your ${device.name} account?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Connect',
        onPress: async () => {
          const newDevice: Device = { id: Date.now().toString(), name: device.name, logo: device.logo, color: device.color, status: 'Connected', lastSync: 'Just now' };
          const updated = sortAlpha([...connectedDevices, newDevice]);
          setConnectedDevices(updated);
          await persist(updated);
          Alert.alert('Success', `${device.name} connected successfully!`);
        },
      },
    ]);
  };

  const handleDisconnect = (deviceId: string, deviceName: string) => {
    Alert.alert(`Disconnect ${deviceName}`, `Are you sure you want to disconnect ${deviceName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: () => {
          const updated = sortAlpha(connectedDevices.filter(d => d.id !== deviceId));
          setConnectedDevices(updated);
          persist(updated);
          Alert.alert('Disconnected', `${deviceName} has been disconnected.`);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <SettingsHeader title="Connected Devices" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: SETTINGS_SCROLL_PT }}>
        <View style={styles.content}>
          {connectedDevices.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Connections</Text>
              {connectedDevices.map(device => (
                <ConnectedDeviceItem key={device.id} device={device} onDisconnect={handleDisconnect} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="phone-portrait-outline" size={48} color="#666" />
              <Text style={styles.emptyStateText}>No devices connected yet</Text>
              <Text style={styles.emptyStateSubtext}>Connect your first device to start syncing health data</Text>
            </View>
          )}

          <View style={[styles.section, styles.lastSection]}>
            <Text style={styles.sectionTitle}>Available to Connect</Text>
            {filteredAvailable.map((device, index) => (
              <AvailableDeviceItem
                key={device.id}
                device={device}
                isLast={index === filteredAvailable.length - 1}
                onConnect={handleConnect}
              />
            ))}
          </View>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 0 },
  section: { marginBottom: 32 },
  lastSection: { marginBottom: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#8E8E93', marginBottom: 8, letterSpacing: 0.5 },
  emptyState: { alignItems: 'center', paddingVertical: 40, marginBottom: 30 },
  emptyStateText: { fontSize: 18, fontWeight: '600', color: '#fff', marginTop: 16, marginBottom: 8 },
  emptyStateSubtext: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 },
  bottomSpacing: { height: 0 },
});

export default ConnectedDevicesScreen;
