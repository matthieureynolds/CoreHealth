import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface BiomarkerHistoryGraphProps {
  historyData?: number[];
}

const BiomarkerHistoryGraph: React.FC<BiomarkerHistoryGraphProps> = ({ historyData }) => {
  const data = historyData || [0.8, 0.85, 0.9, 0.88, 0.93, 0.95, 0.92, 0.89, 0.91, 0.93, 0.94, 0.93];
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;
  const graphWidth = width - 80;
  const graphHeight = 80;

  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * graphWidth,
    y: graphHeight - ((value - minValue) / range) * graphHeight,
  }));

  const pathData = points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  const yLabels: number[] = [];
  const numYLabels = 3;
  for (let i = 0; i <= numYLabels; i++) {
    const value = minValue + (range * i / numYLabels);
    yLabels.push(Math.round(value * 10) / 10);
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const xLabels = months.slice(-data.length);

  return (
    <View style={styles.historyGraph}>
      <View style={styles.graphHeader}>
        <Text style={styles.graphTitle}>12-Month Trend</Text>
        <TouchableOpacity style={styles.fullHistoryButton}>
          <Text style={styles.fullHistoryText}>Full History</Text>
          <Ionicons name="chevron-forward" size={16} color="#3AABF0" />
        </TouchableOpacity>
      </View>
      <View style={styles.graphContainer}>
        <View style={styles.yAxisContainer}>
          {yLabels.map((label, index) => (
            <Text key={index} style={styles.yAxisLabel}>{label}</Text>
          ))}
        </View>
        <View style={styles.graphWrapper}>
          <Svg width={graphWidth} height={graphHeight} style={styles.graph}>
            <Path
              d={`M 0 ${graphHeight * 0.3} L ${graphWidth} ${graphHeight * 0.3} L ${graphWidth} ${graphHeight * 0.7} L 0 ${graphHeight * 0.7} Z`}
              fill="#1C3A1C"
            />
            <Path d={pathData} stroke="#3AABF0" strokeWidth="2" fill="none" />
            <Circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="4"
              fill="#3AABF0"
            />
          </Svg>
          <View style={styles.xAxisContainer}>
            {xLabels.map((label, index) => (
              <Text key={index} style={styles.xAxisLabel}>{label}</Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  historyGraph: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fullHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullHistoryText: {
    fontSize: 14,
    color: '#3AABF0',
    fontWeight: '500',
    marginRight: 4,
  },
  graphContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  yAxisContainer: {
    width: 30,
    justifyContent: 'space-between',
    height: 80,
    paddingVertical: 4,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'right',
  },
  graphWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  graph: {
    marginVertical: 4,
  },
  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'center',
    flex: 1,
  },
});

export default BiomarkerHistoryGraph;
