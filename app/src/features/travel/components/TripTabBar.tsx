import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TripTabBarProps {
  activeTab: 'manual' | 'flight';
  onSelect: (tab: 'manual' | 'flight') => void;
}

const TripTabBar: React.FC<TripTabBarProps> = ({ activeTab, onSelect }) => (
  <View style={styles.tabContainer}>
    <TouchableOpacity
      style={[styles.tab, activeTab === 'manual' && styles.activeTab]}
      onPress={() => onSelect('manual')}
    >
      <Text style={[styles.tabText, activeTab === 'manual' && styles.activeTabText]}>
        Manual Entry
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.tab, activeTab === 'flight' && styles.activeTab]}
      onPress={() => onSelect('flight')}
    >
      <Text style={[styles.tabText, activeTab === 'flight' && styles.activeTabText]}>
        Flight Lookup
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#059669',
  },
  tabText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#059669',
    fontWeight: '600',
  },
});

export default TripTabBar;
