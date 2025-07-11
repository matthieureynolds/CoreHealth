import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LabResult {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  status: 'optimal' | 'normal' | 'borderline' | 'high' | 'low';
  lastUpdated: string;
}

interface LabInsightsCardProps {
  onViewAllPress?: () => void;
  onLabResultPress?: (labResult: LabResult) => void;
}

const LabInsightsCard: React.FC<LabInsightsCardProps> = ({ 
  onViewAllPress, 
  onLabResultPress 
}) => {
  // Mock data - in real app this would come from props or context
  const recentLabResults: LabResult[] = [
    {
      id: 'total_cholesterol',
      name: 'Total Cholesterol',
      value: 180,
      unit: 'mg/dL',
      trend: 'down',
      trendPercent: 12,
      status: 'optimal',
      lastUpdated: '3 days ago'
    },
    {
      id: 'ldl_cholesterol',
      name: 'LDL Cholesterol',
      value: 95,
      unit: 'mg/dL',
      trend: 'down',
      trendPercent: 8,
      status: 'normal',
      lastUpdated: '3 days ago'
    },
    {
      id: 'glucose',
      name: 'Fasting Glucose',
      value: 88,
      unit: 'mg/dL',
      trend: 'stable',
      trendPercent: 2,
      status: 'optimal',
      lastUpdated: '1 week ago'
    },
    {
      id: 'creatinine',
      name: 'Creatinine',
      value: 0.9,
      unit: 'mg/dL',
      trend: 'up',
      trendPercent: 5,
      status: 'normal',
      lastUpdated: '3 days ago'
    }
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'optimal': return '#30D158';
      case 'normal': return '#32D74B';
      case 'borderline': return '#FF9F0A';
      case 'high': return '#FF6B35';
      case 'low': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getTrendIcon = (trend: string): keyof typeof Ionicons.glyphMap => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'stable': return 'remove';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: string, isGoodTrend: boolean): string => {
    if (trend === 'stable') return '#8E8E93';
    return isGoodTrend ? '#30D158' : '#FF3B30';
  };

  const [showMore, setShowMore] = useState(false);

  // Only show the first 3 results, rest go in 'More'
  const mainResults = recentLabResults.slice(0, 3);
  const moreResults = recentLabResults.slice(3);

  const renderLabResult = (result: LabResult) => {
    // Determine if trend is good based on biomarker
    const isGoodTrend = () => {
      const lowerIsBetter = ['total_cholesterol', 'ldl_cholesterol', 'glucose', 'creatinine'];
      if (lowerIsBetter.includes(result.id)) {
        return result.trend === 'down';
      }
      return result.trend === 'up';
    };

    const trendColor = getTrendColor(result.trend, isGoodTrend());
    const statusColor = getStatusColor(result.status);
    const trendLabel = result.trend === 'stable' ? 'Stable' : isGoodTrend() ? 'Improving' : 'Worsening';

    return (
      <TouchableOpacity
        key={result.id}
        style={styles.labResultItem}
        onPress={() => onLabResultPress?.(result)}
        activeOpacity={0.7}
      >
        <View style={styles.labResultLeft}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <View style={styles.labResultContent}>
            <Text style={styles.labResultName}>{result.name}</Text>
            <Text style={styles.labResultDate}>{result.lastUpdated}</Text>
          </View>
        </View>
        <View style={styles.labResultRight}>
          <View style={styles.labResultValueContainer}>
            <Text style={styles.labResultValue}>
              {result.value} {result.unit}
            </Text>
            <View style={styles.trendContainer}>
              <Ionicons 
                name={getTrendIcon(result.trend)} 
                size={12} 
                color={trendColor} 
              />
              {result.trend !== 'stable' && (
                <Text style={[styles.trendPercent, { color: trendColor }]}> {result.trendPercent}% </Text>
              )}
              <Text style={[styles.trendLabel, { color: trendColor, marginLeft: 4 }]}> {trendLabel} </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="flask" size={20} color="#007AFF" />
          <Text style={styles.title}>Recent Lab Results</Text>
        </View>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.labResultsList} showsVerticalScrollIndicator={false}>
        {mainResults.map(renderLabResult)}
        {moreResults.length > 0 && !showMore && (
          <TouchableOpacity onPress={() => setShowMore(true)} style={styles.moreTab}>
            <Text style={styles.moreTabText}>+ More</Text>
          </TouchableOpacity>
        )}
        {showMore && moreResults.map(renderLabResult)}
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Next lab work recommended in 3 months
        </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  labResultsList: {
    maxHeight: 200,
  },
  labResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginBottom: 8,
    minHeight: 60,
  },
  labResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    alignSelf: 'center',
  },
  labResultContent: {
    flex: 1,
    justifyContent: 'center',
  },
  labResultName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  labResultDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  labResultRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labResultValueContainer: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  labResultValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendPercent: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },
  trendLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  moreTab: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  moreTabText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default LabInsightsCard; 