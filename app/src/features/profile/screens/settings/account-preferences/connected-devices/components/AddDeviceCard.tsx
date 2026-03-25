import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddDeviceCard: React.FC = () => (
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
);

const styles = StyleSheet.create({
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
});

export default AddDeviceCard;
