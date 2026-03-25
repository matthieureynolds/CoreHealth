import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Device, renderDeviceLogo } from './ConnectedDeviceItem';

interface AvailableDeviceItemProps {
  device: Device;
  isLast: boolean;
  onConnect: (device: Device) => void;
}

const AvailableDeviceItem: React.FC<AvailableDeviceItemProps> = ({ device, isLast, onConnect }) => (
  <View style={[styles.deviceCard, isLast && styles.lastDeviceCard]}>
    <View style={styles.deviceInfo}>
      <View style={[styles.deviceLogo, { backgroundColor: device.color + '20' }]}>
        {renderDeviceLogo(device)}
      </View>
      <View style={styles.deviceDetails}>
        <Text style={styles.deviceName}>{device.name}</Text>
        {device.description && (
          <Text style={styles.deviceDescription}>{device.description}</Text>
        )}
      </View>
    </View>
    <TouchableOpacity
      style={styles.connectButtonSmall}
      onPress={() => onConnect(device)}
    >
      <Text style={styles.connectButtonSmallText}>Connect</Text>
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
  lastDeviceCard: {
    marginBottom: 20,
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
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  deviceDescription: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  connectButtonSmall: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  connectButtonSmallText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AvailableDeviceItem;
