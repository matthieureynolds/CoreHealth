import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '../TravelScreen.styles';

interface TravelTabBarProps {
  activeTab: 'health' | 'trips';
  onTabPress: (tab: 'health' | 'trips', pageIndex: number) => void;
}

const TravelTabBar: React.FC<TravelTabBarProps> = ({ activeTab, onTabPress }) => (
  <View style={styles.tabContainer}>
    <View style={styles.tabScrollContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'health' && styles.activeTab]}
        onPress={() => onTabPress('health', 0)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, activeTab === 'health' && styles.activeTabText]}>
          Search
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'trips' && styles.activeTab]}
        onPress={() => onTabPress('trips', 1)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, activeTab === 'trips' && styles.activeTabText]}>
          Trip Planning
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default TravelTabBar;
