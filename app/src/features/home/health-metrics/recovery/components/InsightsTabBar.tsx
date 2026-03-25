import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type InsightsTab = 'insights' | 'recommendations' | 'actions';

interface InsightsTabBarProps {
  activeTab: InsightsTab;
  onTabChange: (tab: InsightsTab) => void;
}

interface TabConfig {
  key: InsightsTab;
  icon: string;
  label: string;
}

const TABS: TabConfig[] = [
  { key: 'insights', icon: 'bulb', label: 'Insights' },
  { key: 'recommendations', icon: 'checkmark-circle', label: 'Tips' },
  { key: 'actions', icon: 'flash', label: 'Actions' },
];

const InsightsTabBar: React.FC<InsightsTabBarProps> = ({ activeTab, onTabChange }) => (
  <View style={styles.tabContainer}>
    {TABS.map(({ key, icon, label }) => (
      <TouchableOpacity
        key={key}
        style={[styles.tab, activeTab === key && styles.activeTab]}
        onPress={() => onTabChange(key)}
      >
        <Ionicons
          name={icon as any}
          size={16}
          color={activeTab === key ? '#007AFF' : '#8E8E93'}
        />
        <Text style={[styles.tabText, activeTab === key && styles.activeTabText]}>
          {label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#007AFF',
  },
});

export default InsightsTabBar;
