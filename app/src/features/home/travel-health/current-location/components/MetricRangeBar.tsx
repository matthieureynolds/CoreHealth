import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Rect, Polygon, Text as SvgText, G } from 'react-native-svg';

interface Segment {
  label: string;
  color: string;
  range: string;
  isBold?: boolean;
}

interface MetricRangeBarProps {
  segments: Segment[];
  currentValue: number;
  currentLabel: string;
  divisor: number;
}

const MetricRangeBar: React.FC<MetricRangeBarProps> = ({ segments, currentValue, currentLabel, divisor }) => {
  const { width } = useWindowDimensions();
  const barWidth = Math.min(320, Math.max(240, width - 64));
  const barHeight = 18;
  const pointerPosition = Math.min((currentValue / divisor) * barWidth, barWidth - 10);

  return (
    <View style={styles.rangeIndicatorContainer}>
      <Svg width={barWidth} height={45}>
        {segments.map((segment, index) => {
          const gap = 2;
          const totalGaps = (segments.length - 1) * gap;
          const availableWidth = barWidth - totalGaps;
          const segmentW = availableWidth / segments.length;
          const x = index * (segmentW + gap);
          return (
            <Rect
              key={index}
              x={x}
              y={2}
              width={segmentW}
              height={barHeight}
              fill={segment.color}
              rx={index === 0 ? 8 : index === segments.length - 1 ? 8 : 0}
              ry={index === 0 ? 8 : index === segments.length - 1 ? 8 : 0}
            />
          );
        })}

        <Polygon
          points={`${Math.min(Math.max(pointerPosition, 10), barWidth - 10)},0 ${Math.min(Math.max(pointerPosition - 6, 4), barWidth - 16)},15 ${Math.min(Math.max(pointerPosition + 6, 16), barWidth - 4)},15`}
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="1"
        />

        {segments.map((segment, index) => {
          const gap = 2;
          const totalGaps = (segments.length - 1) * gap;
          const availableWidth = barWidth - totalGaps;
          const segmentW = availableWidth / segments.length;
          const x = index * (segmentW + gap);
          const centerX = x + segmentW / 2;
          return (
            <G key={index}>
              <SvgText x={centerX} y={32} fontSize="10" fill="#FFFFFF" fontWeight={segment.isBold ? 'bold' : '600'} textAnchor="middle">
                {segment.label}
              </SvgText>
              <SvgText x={centerX} y={42} fontSize="10" fill="#8E8E93" textAnchor="middle">
                {segment.range}
              </SvgText>
            </G>
          );
        })}
      </Svg>
      <View style={styles.currentScoreContainer}>
        <Text style={styles.currentScoreText}>
          Your score is in the {currentLabel} range ({currentValue}).
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rangeIndicatorContainer: {
    alignItems: 'center',
    marginTop: 6,
  },
  currentScoreContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  currentScoreText: {
    color: '#E5E5EA',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default MetricRangeBar;
