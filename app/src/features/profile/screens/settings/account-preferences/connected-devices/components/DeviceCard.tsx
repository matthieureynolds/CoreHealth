import React from "react";
import { View, Text, Switch, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface Device {
  id: string;
  name: string;
  type: string;
  connected: boolean;
  lastSync: string;
  battery: number;
  image: any | null;
}

interface DeviceCardProps {
  device: Device;
  onToggle: (id: string) => void;
}

const getDeviceIcon = (type: string) => {
  switch (type) {
    case "whoop":
      return "fitness";
    case "apple_watch":
      return "watch";
    case "eight_sleep":
      return "bed";
    case "smart_toothbrush":
      return "medical";
    case "oura_ring":
      return "ellipse";
    case "fitbit":
      return "pulse";
    default:
      return "hardware-chip";
  }
};

const getBatteryColor = (battery: number) => {
  if (battery > 50) return "#30D158";
  if (battery > 20) return "#FF9500";
  return "#FF3B30";
};

const getBatteryIcon = (battery: number) => {
  if (battery > 80) return "battery-full";
  if (battery > 60) return "battery-three-quarters";
  if (battery > 40) return "battery-half";
  if (battery > 20) return "battery-quarter";
  return "battery-dead";
};

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onToggle }) => (
  <View style={styles.deviceCard}>
    <View style={styles.deviceInfo}>
      <View style={styles.deviceImageContainer}>
        {device.image ? (
          <Image source={device.image} style={styles.deviceImage} />
        ) : (
          <View
            style={[
              styles.deviceIcon,
              { backgroundColor: device.connected ? "#30D158" : "#E5E5EA" },
            ]}
          >
            <Ionicons
              name={getDeviceIcon(device.type) as any}
              size={24}
              color={device.connected ? "#fff" : "#666"}
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
          <Text
            style={[
              styles.deviceStatusText,
              { color: device.connected ? "#30D158" : "#8E8E93" },
            ]}
          >
            {device.connected ? "Connected" : "Not connected"}
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
            <Text
              style={[
                styles.batteryText,
                { color: getBatteryColor(device.battery) },
              ]}
            >
              {device.battery}%
            </Text>
          </View>
        )}
      </View>
    </View>

    <View style={styles.deviceActions}>
      <Switch
        value={device.connected}
        onValueChange={() => onToggle(device.id)}
        trackColor={{ false: "#E5E5EA", true: "#30D158" }}
        thumbColor="#fff"
        ios_backgroundColor="#E5E5EA"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  deviceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deviceImageContainer: {
    position: "relative",
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
    justifyContent: "center",
    alignItems: "center",
  },
  connectionIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#30D158",
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  deviceStatus: {
    marginBottom: 4,
  },
  deviceStatusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  lastSyncText: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 2,
  },
  batteryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  deviceActions: {
    marginLeft: 12,
  },
});

export default DeviceCard;
