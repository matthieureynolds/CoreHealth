import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Device, renderDeviceLogo } from "./ConnectedDeviceItem";

interface AvailableDeviceItemProps {
  device: Device;
  isLast: boolean;
  onConnect: (device: Device) => void;
}

const AvailableDeviceItem: React.FC<AvailableDeviceItemProps> = ({
  device,
  isLast,
  onConnect,
}) => (
  <View style={[styles.deviceRow, isLast && styles.lastDeviceRow]}>
    <View style={styles.deviceInfo}>
      {renderDeviceLogo(device)}
      <View style={styles.deviceDetails}>
        <Text style={styles.deviceName}>{device.name}</Text>
      </View>
    </View>
    <TouchableOpacity
      style={styles.connectButton}
      onPress={() => onConnect(device)}
    >
      <Text style={styles.connectButtonText}>Connect</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  lastDeviceRow: {
    borderBottomWidth: 0,
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 3,
  },
  deviceDescription: {
    fontSize: 13,
    color: "#555",
  },
  connectButton: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 18,
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default AvailableDeviceItem;
