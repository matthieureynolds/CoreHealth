import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { recentLabResults, LabResult } from './results';
import {
  getStatusColor,
  getTrendIcon,
  getTrendColor,
  getTrendLabel,
  isGoodTrend,
} from './utils';
import { useHealthData } from '../../../shared/context/HealthDataContext';
import { Biomarker } from '../../../shared/types';

function biomarkerToLabResult(b: Biomarker): LabResult {
  const id = b.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const status: LabResult['status'] =
    b.riskLevel === 'high' ? 'high' : b.riskLevel === 'medium' ? 'borderline' : 'normal';
  const lastUpdated = b.lastUpdated instanceof Date
    ? b.lastUpdated.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : String(b.lastUpdated);
  return { id, name: b.name, value: b.value, unit: b.unit, trend: 'stable', trendPercent: 0, status, lastUpdated };
}

interface LabInsightsCardProps {
  onViewAllPress?: () => void;
  onLabResultPress?: (labResult: LabResult) => void;
}

const LabInsightsCard: React.FC<LabInsightsCardProps> = ({
  onViewAllPress,
  onLabResultPress
}) => {
  const [showCount, setShowCount] = useState(3);
  const [viewAll, setViewAll] = useState(false);
  const { biomarkers } = useHealthData();

  const labResults: LabResult[] = biomarkers.length > 0
    ? biomarkers.map(biomarkerToLabResult)
    : recentLabResults;

  const visibleResults = viewAll
    ? labResults
    : labResults.slice(0, showCount);
  const hasMore = !viewAll && showCount < 6 && labResults.length > 3;
  const canShowLess = !viewAll && showCount > 3;
  const canViewAll = !viewAll && showCount >= 6 && labResults.length > 6;
  const canShowLessFromAll = viewAll && labResults.length > 3;

  const renderLabResult = (result: LabResult) => {
    const good = isGoodTrend(result.id, result.trend);
    const trendColor = getTrendColor(result.trend, good);
    const statusColor = getStatusColor(result.status);
    const trendLabel = getTrendLabel(result.trend, good);

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
              {result.trend !== 'stable' && (
                <Text style={[styles.trendPercent, { color: trendColor }]}>{result.trendPercent} </Text>
              )}
              <Text style={[styles.trendLabel, { color: trendColor }]}>{trendLabel}</Text>
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
          <Ionicons name="flask" size={20} color="#3AABF0" />
          <Text style={styles.title}>Recent Lab Results</Text>
        </View>
        {/* View All button top right, like Travel Health */}
        {labResults.length > 6 && !viewAll && (
          <TouchableOpacity onPress={() => setViewAll(true)}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        style={[styles.labResultsList, (showCount > 3 || viewAll) && styles.labResultsListExpanded]}
        showsVerticalScrollIndicator={false}
      >
        {visibleResults.map(renderLabResult)}
      </ScrollView>
      <View style={{ alignItems: 'center', marginTop: 4 }}>
        {hasMore && (
          <TouchableOpacity onPress={() => setShowCount(6)} style={styles.moreTab}>
            <Text style={styles.moreTabText}>+ More</Text>
          </TouchableOpacity>
        )}
        {canShowLess && (
          <TouchableOpacity onPress={() => setShowCount(3)} style={styles.lessTab}>
            <Text style={styles.lessTabText}>Show Less</Text>
          </TouchableOpacity>
        )}
        {canShowLessFromAll && (
          <TouchableOpacity onPress={() => { setShowCount(3); setViewAll(false); }} style={styles.lessTab}>
            <Text style={styles.lessTabText}>Show Less</Text>
          </TouchableOpacity>
        )}
      </View>
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
    color: '#3AABF0',
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
    color: '#3AABF0',
    fontWeight: '600',
    fontSize: 14,
  },
  lessTab: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  lessTabText: {
    color: '#3AABF0',
    fontWeight: '600',
    fontSize: 14,
  },
  moreTabContainer: {
    backgroundColor: '#232323',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  moreTabTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  moreTabList: {
    maxHeight: 220,
  },
  labResultsListExpanded: {
    maxHeight: 400,
  },
});

export default LabInsightsCard; 