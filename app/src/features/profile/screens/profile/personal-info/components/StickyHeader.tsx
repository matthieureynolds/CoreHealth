import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface StickyHeaderProps {
  stickyHeaderOpacity: Animated.AnimatedInterpolation<number>;
  stickyHeaderTranslateY: Animated.AnimatedInterpolation<number>;
  headerBgOpacity: Animated.AnimatedInterpolation<number>;
  isHeaderVisible: boolean;
  userName: string;
  onCommunityPress: () => void;
  onSettingsPress: () => void;
}

const StickyHeader: React.FC<StickyHeaderProps> = ({
  stickyHeaderOpacity,
  stickyHeaderTranslateY,
  headerBgOpacity,
  isHeaderVisible,
  userName,
  onCommunityPress,
  onSettingsPress,
}) => (
  <Animated.View
    style={[
      styles.stickyHeader,
      {
        opacity: stickyHeaderOpacity,
        transform: [{ translateY: stickyHeaderTranslateY }],
      },
    ]}
    pointerEvents={isHeaderVisible ? 'auto' : 'none'}
  >
    <Animated.View
      style={[styles.stickyHeaderBackground, { opacity: headerBgOpacity }]}
    >
      <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
    </Animated.View>
    <View style={styles.stickyHeaderContent}>
      <TouchableOpacity onPress={onCommunityPress} style={styles.stickyHeaderCommunityButton}>
        <FontAwesome5 name="users" size={20} color="#0A84FF" solid />
      </TouchableOpacity>
      <View style={styles.stickyHeaderTextContainer}>
        <Text style={styles.stickyHeaderName} numberOfLines={1}>
          {userName}
        </Text>
      </View>
      <TouchableOpacity onPress={onSettingsPress} style={styles.stickyHeaderSettingsButton}>
        <Ionicons name="settings" size={22} color="#0A84FF" />
      </TouchableOpacity>
    </View>
  </Animated.View>
);

const styles = StyleSheet.create({
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 12,
    minHeight: Platform.OS === 'ios' ? 88 : 64,
  },
  stickyHeaderBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    position: 'relative',
  },
  stickyHeaderCommunityButton: {
    marginRight: 12,
    padding: 4,
  },
  stickyHeaderSettingsButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  stickyHeaderTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyHeaderName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default StickyHeader;
