import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface HeroHealthScoreProps {
  score: number;
  onPress?: () => void;
}

const HeroHealthScore: React.FC<HeroHealthScoreProps> = ({ 
  score, 
  onPress 
}) => {
  // Use consistent, responsive sizing
  const circleSize = Math.min(width * 0.45, 180); // Max 180px, responsive to screen
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(score, 100)) / 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#30D158'; // Green - Excellent
    if (score >= 65) return '#32D74B'; // Light Green - Good  
    if (score >= 50) return '#FF9F0A'; // Orange - Fair
    if (score >= 35) return '#FF6B35'; // Red Orange - Poor
    return '#FF3B30'; // Red - Critical
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'EXCELLENT';
    if (score >= 65) return 'GOOD';
    if (score >= 50) return 'FAIR';
    if (score >= 35) return 'POOR';
    return 'CRITICAL';
  };

  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.scoreContainer}>
        <View style={[styles.circleWrapper, { width: circleSize, height: circleSize }]}>
          <Svg 
            width={circleSize} 
            height={circleSize} 
            style={styles.svg}
          >
            {/* Background circle */}
            <Circle
              stroke="#2C2C2E"
              fill="none"
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <Circle
              stroke={scoreColor}
              fill="none"
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
            />
          </Svg>
          
          <View style={styles.scoreContent}>
            <Text style={styles.brandText}>COREHEALTH</Text>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>{score}</Text>
            <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
            <Text style={styles.scoreSubtitle}>HEALTH SCORE</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  circleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  scoreContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 48,
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  scoreSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
});

export default HeroHealthScore; 