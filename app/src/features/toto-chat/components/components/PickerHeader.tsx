import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface PickerHeaderProps {
  onClose: () => void;
  panHandlers: object;
}

const PickerHeader: React.FC<PickerHeaderProps> = ({ onClose, panHandlers }) => (
  <View style={styles.header} {...panHandlers}>
    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
      <Text style={styles.closeButtonText}>Close</Text>
    </TouchableOpacity>
    <View style={styles.headerCenter}>
      <Text style={styles.headerTitle}>Recents</Text>
    </View>
    <View style={styles.rightSpacer} />
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#3AABF0',
    fontSize: 16,
    fontWeight: '500',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  rightSpacer: { width: 52 },
});

export default PickerHeader;
