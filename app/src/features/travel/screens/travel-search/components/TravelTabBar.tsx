import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface TravelTabBarProps {
  activeTab: 'health' | 'trips';
  onTabPress: (tab: 'health' | 'trips', pageIndex: number) => void;
  onAddTrip?: () => void;
}

const TravelTabBar: React.FC<TravelTabBarProps> = ({ activeTab, onTabPress, onAddTrip }) => (
  <View style={s.wrapper}>
    <View style={s.island}>
      {/* Glass material */}
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

      {/* Top highlight — liquid glass refraction */}
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'transparent']}
        style={s.topHighlight}
      />

      {/* Prismatic edge shimmer */}
      <LinearGradient
        colors={[
          'rgba(125,249,255,0.12)',
          'rgba(196,181,253,0.08)',
          'rgba(244,114,182,0.06)',
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.prismaticEdge}
      />

      {/* Tabs */}
      <View style={s.tabRow}>
        <TouchableOpacity
          style={[s.tab, activeTab === 'health' && s.activeTab]}
          onPress={() => onTabPress('health', 0)}
          activeOpacity={0.7}
        >
          {activeTab === 'health' && (
            <>
              <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
              <LinearGradient
                colors={['rgba(255,255,255,0.06)', 'transparent']}
                style={s.activeTabHighlight}
              />
            </>
          )}
          <View style={s.tabContent}>
            <View style={[s.dot, activeTab === 'health' && s.dotActive]} />
            <Text style={[s.tabText, activeTab === 'health' && s.activeTabText]}>
              Search
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.tab, activeTab === 'trips' && s.activeTab]}
          onPress={() => onTabPress('trips', 1)}
          activeOpacity={0.7}
        >
          {activeTab === 'trips' && (
            <>
              <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
              <LinearGradient
                colors={['rgba(255,255,255,0.06)', 'transparent']}
                style={s.activeTabHighlight}
              />
            </>
          )}
          <View style={s.tabContent}>
            <View style={[s.dot, activeTab === 'trips' && s.dotActive]} />
            <Text style={[s.tabText, activeTab === 'trips' && s.activeTabText]}>
              Trip Planning
            </Text>
          </View>
        </TouchableOpacity>

        {onAddTrip && (
          <TouchableOpacity
            style={s.addButton}
            onPress={onAddTrip}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add" size={20} color="rgba(255,255,255,0.50)" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  </View>
);

const s = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
  },
  island: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    // Depth shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  prismaticEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  tabRow: {
    flexDirection: 'row',
    padding: 4,
    gap: 2,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  activeTab: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  activeTabHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'transparent',
  },
  dotActive: {
    backgroundColor: '#7DF9FF',
    shadowColor: '#7DF9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.40)',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
});

export default TravelTabBar;
