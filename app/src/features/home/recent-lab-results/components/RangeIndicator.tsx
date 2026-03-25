import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Polygon, Text as SvgText, G } from 'react-native-svg';
import { LabResult } from '../results/types';

interface RangeSegment {
  label: string;
  range: string;
  color: string;
  isBold: boolean;
}

interface RangeData {
  segments: RangeSegment[];
  currentValue: number;
  currentLabel: string;
}

const getRangeData = (id: string, value: number): RangeData => {
  switch (id) {
    case 'total_cholesterol':
      return {
        segments: [
          { label: 'Optimal', range: '<180', color: '#30D158', isBold: false },
          { label: 'Normal', range: '180-199', color: '#32D74B', isBold: false },
          { label: 'Borderline', range: '200-239', color: '#FF9F0A', isBold: false },
          { label: 'High', range: '240+', color: '#FF3B30', isBold: false },
        ],
        currentValue: value,
        currentLabel: value < 180 ? 'Optimal' : value < 200 ? 'Normal' : value < 240 ? 'Borderline' : 'High',
      };
    case 'ldl_cholesterol':
      return {
        segments: [
          { label: 'Optimal', range: '<70', color: '#30D158', isBold: false },
          { label: 'Near Optimal', range: '70-99', color: '#32D74B', isBold: false },
          { label: 'Borderline', range: '100-129', color: '#FF9F0A', isBold: false },
          { label: 'High', range: '130+', color: '#FF3B30', isBold: false },
        ],
        currentValue: value,
        currentLabel: value < 70 ? 'Optimal' : value < 100 ? 'Near Optimal' : value < 130 ? 'Borderline' : 'High',
      };
    case 'glucose':
      return {
        segments: [
          { label: 'Normal', range: '70-99', color: '#30D158', isBold: false },
          { label: 'Prediabetes', range: '100-125', color: '#FF9F0A', isBold: false },
          { label: 'Diabetes', range: '126+', color: '#FF3B30', isBold: false },
        ],
        currentValue: value,
        currentLabel: value < 100 ? 'Normal' : value < 126 ? 'Prediabetes' : 'Diabetes',
      };
    case 'creatinine':
      return {
        segments: [
          { label: 'Normal', range: '0.6-1.2', color: '#30D158', isBold: false },
          { label: 'High', range: '1.3+', color: '#FF3B30', isBold: false },
        ],
        currentValue: value,
        currentLabel: value <= 1.2 ? 'Normal' : 'High',
      };
    default:
      return {
        segments: [{ label: 'Normal', range: 'Normal', color: '#30D158', isBold: false }],
        currentValue: value,
        currentLabel: 'Normal',
      };
  }
};

interface RangeIndicatorProps {
  labResult: LabResult;
}

const RangeIndicator: React.FC<RangeIndicatorProps> = ({ labResult }) => {
  const rangeData = getRangeData(labResult.id, labResult.value);
  const barWidth = 280;
  const barHeight = 16;
  const gap = 2;
  const totalGaps = (rangeData.segments.length - 1) * gap;
  const availableWidth = barWidth - totalGaps;
  const segmentWidth = availableWidth / rangeData.segments.length;

  let pointerPosition = 0;
  if (rangeData.segments.length > 1) {
    const currentSegmentIndex = rangeData.segments.findIndex(
      segment => rangeData.currentLabel === segment.label
    );
    if (currentSegmentIndex >= 0) {
      pointerPosition = currentSegmentIndex * (segmentWidth + gap) + segmentWidth / 2;
    }
  }

  return (
    <View style={styles.rangeIndicatorContainer}>
      {Svg ? (
        <Svg width={barWidth} height={50} style={styles.rangeIndicatorSvg}>
          {rangeData.segments.map((segment, index) => {
            const x = index * (segmentWidth + gap);
            return (
              <Rect
                key={index}
                x={x}
                y={2}
                width={segmentWidth}
                height={barHeight}
                fill={segment.color}
                rx={index === 0 ? 8 : index === rangeData.segments.length - 1 ? 8 : 0}
                ry={index === 0 ? 8 : index === rangeData.segments.length - 1 ? 8 : 0}
              />
            );
          })}

          <Polygon
            points={`${Math.min(Math.max(pointerPosition, 10), barWidth - 10)},0 ${Math.min(Math.max(pointerPosition - 6, 4), barWidth - 16)},15 ${Math.min(Math.max(pointerPosition + 6, 16), barWidth - 4)},15`}
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="1"
          />

          {rangeData.segments.map((segment, index) => {
            const x = index * (segmentWidth + gap);
            const centerX = x + segmentWidth / 2;
            return (
              <G key={index}>
                <SvgText
                  x={centerX}
                  y={32}
                  fontSize="10"
                  fill="#FFFFFF"
                  fontWeight={segment.isBold ? 'bold' : '600'}
                  textAnchor="middle"
                >
                  {segment.label}
                </SvgText>
                <SvgText
                  x={centerX}
                  y={42}
                  fontSize="10"
                  fill="#8E8E93"
                  textAnchor="middle"
                >
                  {segment.range}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      ) : (
        <Text style={styles.fallbackText}>Range indicator not available</Text>
      )}

      <View style={styles.currentScoreContainer}>
        <Text style={styles.currentScoreText}>
          Your result is in the {rangeData.currentLabel} range ({rangeData.currentValue} {labResult.unit}).
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rangeIndicatorContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  rangeIndicatorSvg: {
    marginBottom: 16,
  },
  currentScoreContainer: {
    alignItems: 'center',
  },
  currentScoreText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  fallbackText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default RangeIndicator;
