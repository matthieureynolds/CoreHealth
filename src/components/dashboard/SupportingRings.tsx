import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface RingMetric {
  id: string;
  title: string;
  value: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
}

interface SupportingRingsProps {
  recovery: number;
  biomarkers: number;
  lifestyle: number;
  onRingPress?: (ringId: string) => void;
}

const SupportingRings: React.FC<SupportingRingsProps> = ({ 
  recovery, 
  biomarkers, 
  lifestyle, 
  onRingPress 
}) => {
  const ringSize = (width - 48) / 3 - 16; // Responsive sizing
  const strokeWidth = 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const metrics: RingMetric[] = [
    {
      id: 'recovery',
      title: 'RECOVERY',
      value: recovery,
      color: '#30D158',
      icon: 'refresh',
      subtitle: 'Sleep & HRV'
    },
    {
      id: 'biomarkers',
      title: 'BIOMARKERS',
      value: biomarkers,
      color: '#007AFF',
      icon: 'water',
      subtitle: 'Lab Results'
    },
    {
      id: 'lifestyle',
      title: 'LIFESTYLE',
      value: lifestyle,
      color: '#FF9F0A',
      icon: 'fitness',
      subtitle: 'Activity & Habits'
    }
  ];

  const renderRing = (metric: RingMetric) => {
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (metric.value / 100) * circumference;

    return (
      <TouchableOpacity
        key={metric.id}
        style={styles.ringContainer}
        onPress={() => onRingPress?.(metric.id)}
        activeOpacity={0.8}
      >
        <View style={styles.ringContent}>
          <Svg width={ringSize} height={ringSize} style={styles.svg}>
            {/* Background circle */}
            <Circle
              stroke="#2C2C2E"
              fill="none"
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
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
            <View style={[styles.iconContainer, { backgroundColor: `${metric.color}20` }]}>
              <Ionicons 
                name={metric.icon} 
                size={20} 
                color={metric.color} 
              />
            </View>
            <Text style={[styles.ringValue, { color: metric.color }]}>
              {metric.value}%
            </Text>
          </View>
        </View>
        
        <Text style={styles.ringTitle}>{metric.title}</Text>
        {metric.subtitle && (
          <Text style={styles.ringSubtitle}>{metric.subtitle}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Health Metrics</Text>
      <View style={styles.ringsRow}>
        {metrics.map(renderRing)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Evenly distribute circles
    alignItems: 'flex-start',
    paddingHorizontal: 0, // Remove side padding
  },
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
    width: (width - 48) / 3 - 16,
    height: (width - 48) / 3 - 16,
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
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  ringValue: {
    fontSize: 16,
    fontWeight: 'bold',
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

export default SupportingRings; 