import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Device {
  id: string;
  name: string;
  logo: number | string;
  color: string;
  status?: string;
  lastSync?: string;
  description?: string;
}

interface ConnectedDeviceItemProps {
  device: Device;
  onDisconnect: (id: string, name: string) => void;
}

const getLogoStyle = (_deviceName: string) => styles.deviceLogoImage;

const getLogoBg = (_deviceName: string): string => 'transparent';

export const renderDeviceLogo = (device: Device) => {
  if (typeof device.logo === 'string') {
    return <Ionicons name={device.logo as any} size={28} color={device.color} />;
  }
  return (
    <View style={[styles.deviceLogoContainer, { backgroundColor: getLogoBg(device.name) }]}>
      <Image
        source={device.logo}
        style={getLogoStyle(device.name)}
        resizeMode={device.name === 'ZOE™' ? 'cover' : 'contain'}
      />
    </View>
  );
};

const ConnectedDeviceItem: React.FC<ConnectedDeviceItemProps> = ({ device, onDisconnect }) => (
  <View style={styles.deviceRow}>
    <View style={styles.deviceInfo}>
      {renderDeviceLogo(device)}
      <View style={styles.deviceDetails}>
        <Text style={styles.deviceName}>{device.name}</Text>
        {device.lastSync && (
          <Text style={styles.deviceLastSync}>Last sync: {device.lastSync}</Text>
        )}
      </View>
    </View>
    <TouchableOpacity style={styles.disconnectButton} onPress={() => onDisconnect(device.id, device.name)}>
      <Text style={styles.disconnectButtonText}>Disconnect</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  deviceLogoContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 16,
  },
  deviceLogoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  deviceLogoImageZoe: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    transform: [{ scale: 1.25 }],
  },
  deviceLogoImageApple: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    transform: [{ scale: 1.4 }],
  },
  deviceLogoImageUScan: {
    width: '75%',
    height: '75%',
    alignSelf: 'center',
  },
  deviceLogoImageThermo: {
    width: '80%',
    height: '80%',
    alignSelf: 'center',
  },
  deviceLogoImageBodyPlus: {
    width: '70%',
    height: '70%',
    alignSelf: 'center',
  },
  deviceLogoImageBPMConnect: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    transform: [{ scale: 1.6 }],
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  deviceStatus: {
    fontSize: 13,
    color: '#34C759',
    fontWeight: '500',
    marginBottom: 2,
  },
  deviceLastSync: {
    fontSize: 12,
    color: '#555',
  },
  disconnectButton: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  disconnectButtonText: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default ConnectedDeviceItem;
