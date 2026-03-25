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

const getLogoStyle = (deviceName: string) => {
  switch (deviceName) {
    case 'ZOE™':             return styles.deviceLogoImageZoe;
    case 'Apple Health':     return styles.deviceLogoImageApple;
    case 'Withings® U-Scan': return styles.deviceLogoImageUScan;
    case 'Withings® Thermo': return styles.deviceLogoImageThermo;
    case 'Withings® Body+':  return styles.deviceLogoImageBodyPlus;
    case 'Withings® BPM Connect': return styles.deviceLogoImageBPMConnect;
    default:                 return styles.deviceLogoImage;
  }
};

export const renderDeviceLogo = (device: Device) => {
  if (typeof device.logo === 'string') {
    return <Ionicons name={device.logo as any} size={24} color={device.color} />;
  }
  return (
    <View style={styles.deviceLogoContainer}>
      <Image
        source={device.logo}
        style={getLogoStyle(device.name)}
        resizeMode={device.name === 'ZOE™' ? 'cover' : 'contain'}
      />
    </View>
  );
};

const ConnectedDeviceItem: React.FC<ConnectedDeviceItemProps> = ({ device, onDisconnect }) => (
  <View style={styles.deviceCard}>
    <View style={styles.deviceInfo}>
      <View style={[styles.deviceLogo, { backgroundColor: device.color + '20' }]}>
        {renderDeviceLogo(device)}
      </View>
      <View style={styles.deviceDetails}>
        <Text style={styles.deviceName}>{device.name}</Text>
        <Text style={styles.deviceStatus}>{device.status}</Text>
        <Text style={styles.deviceLastSync}>Last sync: {device.lastSync}</Text>
      </View>
    </View>
    <TouchableOpacity
      style={styles.disconnectButton}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      onPress={() => onDisconnect(device.id, device.name)}
    >
      <Ionicons name="close" size={18} color="#FF3B30" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  deviceLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  deviceLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  deviceLogoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
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
    marginBottom: 4,
  },
  deviceStatus: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
    marginBottom: 2,
  },
  deviceLastSync: {
    fontSize: 12,
    color: '#888',
  },
  disconnectButton: {
    padding: 0,
  },
});

export default ConnectedDeviceItem;
