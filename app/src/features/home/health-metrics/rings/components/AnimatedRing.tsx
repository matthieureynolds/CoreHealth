import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../../shared/types';

const { width } = Dimensions.get('window');

export interface RingMetric {
  id: string;
  title: string;
  value: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
}

interface AnimatedRingProps {
  metric: RingMetric;
  animatedValue: Animated.Value;
}

const ringSize = (width - 48) / 3 - 16;
const strokeWidth = 6;
const radius = (ringSize - strokeWidth) / 2;
const circumference = radius * 2 * Math.PI;

const AnimatedRing: React.FC<AnimatedRingProps> = ({ metric, animatedValue }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const valuePct = Math.max(0, Math.min(100, metric.value));
  const initialOffset = circumference - (valuePct / 100) * circumference;
  const [displayValue, setDisplayValue] = useState(Math.max(1, metric.value));
  const [strokeDashoffset, setStrokeDashoffset] = useState(initialOffset);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => {
      const roundedValue = Math.round(value);
      setDisplayValue(roundedValue);
      setStrokeDashoffset(circumference - (roundedValue / 100) * circumference);
    });
    return () => {
      animatedValue.removeListener(listener);
    };
  }, []);

  const strokeDasharray = `${circumference} ${circumference}`;

  return (
    <TouchableOpacity
      style={styles.ringContainer}
      onPress={() => navigation.navigate('RingDetail', { id: metric.id as 'recovery' | 'biomarkers' | 'lifestyle' })}
      activeOpacity={0.7}
    >
      <View style={styles.ringContent}>
        <Svg width={ringSize} height={ringSize} style={styles.svg}>
          <Circle
            stroke="#2C2C2E"
            fill="none"
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke={metric.color}
            fill="none"
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Ionicons name={metric.icon} size={20} color={metric.color} />
          <Text style={[styles.ringValue, { color: metric.color }]}>{displayValue}</Text>
        </View>
      </View>
      <View style={styles.ringLabels}>
        <Text style={styles.ringTitle}>{metric.title}</Text>
        {metric.subtitle && (
          <Text style={styles.ringSubtitle}>{metric.subtitle}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  ringContainer: {
    alignItems: 'center',
    maxWidth: (width - 48) / 3,
    marginHorizontal: 0,
  },
  ringContent: {
    position: 'relative',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: ringSize,
    height: ringSize,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ringLabels: {
    alignItems: 'center',
    marginTop: 8,
  },
  ringTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ringSubtitle: {
    fontSize: 9,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default AnimatedRing;
