import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StateOfMindChartData } from '../../types/symptoms';

interface StateOfMindChartProps {
  data: StateOfMindChartData;
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 80;
const CHART_HEIGHT = 200;

const StateOfMindChart: React.FC<StateOfMindChartProps> = ({ data }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | '6months' | 'yearly'>('weekly');

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return '#4CD964'; // Green for very pleasant
    if (mood >= 6) return '#FFD93D'; // Yellow for pleasant
    if (mood >= 4) return '#FF9500'; // Orange for neutral
    if (mood >= 2) return '#FF6B6B'; // Red for unpleasant
    return '#FF3B30'; // Dark red for very unpleasant
  };

  const getMoodLabel = (mood: number) => {
    if (mood >= 8) return 'Very Pleasant';
    if (mood >= 6) return 'Pleasant';
    if (mood >= 4) return 'Neutral';
    if (mood >= 2) return 'Unpleasant';
    return 'Very Unpleasant';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (selectedPeriod === 'weekly') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (selectedPeriod === 'monthly') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short' });
    }
  };

  const renderChart = () => {
    if (!data.data || data.data.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Ionicons name="trending-up-outline" size={48} color="#8E8E93" />
          <Text style={styles.emptyChartText}>No data available</Text>
          <Text style={styles.emptyChartSubtext}>
            Log symptoms to see your state of mind chart
          </Text>
        </View>
      );
    }

    const maxMood = Math.max(...data.data.map(d => d.mood));
    const minMood = Math.min(...data.data.map(d => d.mood));
    const moodRange = maxMood - minMood || 1;

    return (
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>Very Pleasant</Text>
          <Text style={styles.yAxisLabel}>Neutral</Text>
          <Text style={styles.yAxisLabel}>Very Unpleasant</Text>
        </View>

        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Grid lines */}
          <View style={styles.gridLines}>
            {[0, 0.25, 0.5, 0.75, 1].map((position, index) => (
              <View
                key={index}
                style={[
                  styles.gridLine,
                  { top: position * CHART_HEIGHT }
                ]}
              />
            ))}
          </View>

          {/* Data points and lines */}
          <View style={styles.dataContainer}>
            {data.data.map((point, index) => {
              const x = (index / (data.data.length - 1)) * CHART_WIDTH;
              const y = ((maxMood - point.mood) / moodRange) * CHART_HEIGHT;
              const nextPoint = data.data[index + 1];
              
              return (
                <View key={index}>
                  {/* Data point */}
                  <TouchableOpacity
                    style={[
                      styles.dataPoint,
                      {
                        left: x - 6,
                        top: y - 6,
                        backgroundColor: getMoodColor(point.mood),
                      }
                    ]}
                  >
                    <View style={styles.dataPointInner} />
                  </TouchableOpacity>

                  {/* Connecting line */}
                  {nextPoint && (
                    <View
                      style={[
                        styles.connectingLine,
                        {
                          left: x,
                          top: y,
                          width: Math.sqrt(
                            Math.pow((nextPoint.mood - point.mood) / moodRange * CHART_HEIGHT, 2) +
                            Math.pow(CHART_WIDTH / (data.data.length - 1), 2)
                          ),
                          transform: [{
                            rotate: `${Math.atan2(
                              (nextPoint.mood - point.mood) / moodRange * CHART_HEIGHT,
                              CHART_WIDTH / (data.data.length - 1)
                            )}rad`
                          }],
                          backgroundColor: getMoodColor((point.mood + nextPoint.mood) / 2),
                        }
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* X-axis labels */}
        <View style={styles.xAxis}>
          {data.data.map((point, index) => (
            <Text key={index} style={styles.xAxisLabel}>
              {formatDate(point.date)}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Period selector */}
      <View style={styles.periodSelector}>
        {(['weekly', 'monthly', '6months', 'yearly'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextActive
            ]}>
              {period === 'weekly' ? 'W' : 
               period === 'monthly' ? 'M' :
               period === '6months' ? '6M' : 'Y'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      {renderChart()}

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Average Mood</Text>
          <Text style={[styles.summaryValue, { color: getMoodColor(data.averageMood) }]}>
            {data.averageMood.toFixed(1)}/10
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Trend</Text>
          <View style={styles.trendContainer}>
            <Ionicons
              name={data.trend === 'up' ? 'trending-up' : data.trend === 'down' ? 'trending-down' : 'remove'}
              size={16}
              color={data.trend === 'up' ? '#4CD964' : data.trend === 'down' ? '#FF3B30' : '#8E8E93'}
            />
            <Text style={[
              styles.trendText,
              { color: data.trend === 'up' ? '#4CD964' : data.trend === 'down' ? '#FF3B30' : '#8E8E93' }
            ]}>
              {data.trend === 'up' ? 'Improving' : data.trend === 'down' ? 'Declining' : 'Stable'}
            </Text>
          </View>
        </View>
      </View>

      {/* Insights */}
      {data.insights.length > 0 && (
        <View style={styles.insights}>
          <Text style={styles.insightsTitle}>Insights</Text>
          {data.insights.map((insight, index) => (
            <Text key={index} style={styles.insightText}>
              • {insight}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    height: CHART_HEIGHT + 40,
    marginBottom: 20,
  },
  yAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: CHART_HEIGHT,
    width: 60,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  yAxisLabel: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'right',
  },
  chartArea: {
    marginLeft: 70,
    height: CHART_HEIGHT,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CHART_HEIGHT,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#3A3A3C',
  },
  dataContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CHART_HEIGHT,
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataPointInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  connectingLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 70,
    marginTop: 10,
  },
  xAxisLabel: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
  },
  emptyChart: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyChartSubtext: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  insights: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 12,
  },
  insightsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  insightText: {
    color: '#8E8E93',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
});

export default StateOfMindChart;
