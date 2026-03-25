import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LabResult } from '../results/types';
import { getTrendIcon, getTrendColor, getTrendLabel, isGoodTrend } from '../utils';

interface CurrentResultCardProps {
  labResult: LabResult;
  statusColor: string;
}

const CurrentResultCard: React.FC<CurrentResultCardProps> = ({ labResult, statusColor }) => {
  const good = isGoodTrend(labResult.id, labResult.trend);
  const trendColor = getTrendColor(labResult.trend, good);
  const trendLabel = getTrendLabel(labResult.trend, good);

  return (
    <View style={styles.currentResultCard}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultValue}>
          {labResult.value} {labResult.unit}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {labResult.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.trendContainer}>
        <Ionicons name={getTrendIcon(labResult.trend)} size={16} color={trendColor} />
        {labResult.trend !== 'stable' && (
          <Text style={[styles.trendPercent, { color: trendColor }]}>
            {labResult.trendPercent}%
          </Text>
        )}
        <Text style={[styles.trendLabel, { color: trendColor }]}>{trendLabel}</Text>
      </View>

      <Text style={styles.lastUpdated}>Last updated: {labResult.lastUpdated}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  currentResultCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  trendPercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

export default CurrentResultCard;
