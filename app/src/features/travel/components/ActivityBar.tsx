import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Action } from '../../../shared/types';
import { INFO_BY_TYPE, BAR_WIDTH } from './TimelineConstants';

interface BarData {
  action: Action;
  top: number;
  height: number;
  left: number;
  color: string;
  style: any;
  icon: { name: string; color: string; crossed?: boolean } | null;
}

interface ActivityBarProps {
  bar: BarData;
  onPress: (info: { title: string; body: string }) => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({ bar, onPress }) => {
  return (
    <Pressable
      onPress={() => {
        const info = INFO_BY_TYPE[bar.action.type];
        if (info) onPress(info);
      }}
    >
      <View
        style={[
          styles.activityBar,
          {
            top: bar.top,
            height: Math.max(bar.height, 6),
            left: bar.left,
            width: BAR_WIDTH,
            borderRadius: BAR_WIDTH / 2,
          },
          bar.style,
        ]}
      >
        {bar.icon && !bar.icon.crossed && (
          <Ionicons
            name={bar.icon.name as any}
            size={12}
            color={bar.icon.color}
            style={styles.barIcon}
          />
        )}
        {bar.icon && bar.icon.crossed && (
          <View style={styles.crossedIconWrap}>
            <Ionicons name={bar.icon.name as any} size={12} color={bar.icon.color} />
            <View style={styles.iconStrike} />
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  activityBar: {
    position: 'absolute',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 6,
    zIndex: 1,
    overflow: 'hidden',
  },
  barIcon: {
    marginTop: 2,
  },
  crossedIconWrap: {
    marginTop: 2,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStrike: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: '#8B5E3C',
    transform: [{ rotate: '-35deg' }],
  },
});
