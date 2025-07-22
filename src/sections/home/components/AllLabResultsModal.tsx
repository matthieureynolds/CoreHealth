import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
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

interface AllLabResultsModalProps {
  visible: boolean;
  labResults: LabResult[];
  onClose: () => void;
  onLabResultPress?: (labResult: LabResult) => void;
}

const AllLabResultsModal: React.FC<AllLabResultsModalProps> = ({ visible, labResults, onClose, onLabResultPress }) => {
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

  const renderLabResult = (result: LabResult) => {
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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>All Lab Results</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          {labResults.map(renderLabResult)}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'left',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  labResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  labResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  labResultContent: {
    flex: 1,
  },
  labResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  labResultDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  trendPercent: {
    fontSize: 12,
    fontWeight: '500',
  },
  trendLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AllLabResultsModal; 