import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import BiomarkerComparisonModal from './BiomarkerComparisonModal';

const { width } = Dimensions.get('window');

export interface BiomarkerInfo {
  name: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  explanation: string;
  whatItMeans: string;
  tips: string[];
  category: string;
  organSystem?: string;
  lastTested?: string;
  percentile?: number;
  whyItMatters?: string;
  levelMeaning?: {
    low?: string;
    normal?: string;
    high?: string;
  };
  historyData?: number[];
  comparisonData?: {
    allPopulation: number;
    ageSexGroup: number;
  };
}

interface BiomarkerModalProps {
  visible: boolean;
  biomarker: BiomarkerInfo | null;
  onClose: () => void;
}

const BiomarkerModal: React.FC<BiomarkerModalProps> = ({
  visible,
  biomarker,
  onClose,
}) => {
  const [comparisonModalVisible, setComparisonModalVisible] = useState(false);

  if (!biomarker) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#30D158';
      case 'low':
        return '#FF9500';
      case 'high':
        return '#FF9500';
      case 'critical':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return 'checkmark-circle';
      case 'low':
        return 'arrow-down-circle';
      case 'high':
        return 'arrow-up-circle';
      case 'critical':
        return 'warning';
      default:
        return 'help-circle';
    }
  };

  const getOrganIcon = (organSystem?: string) => {
    switch (organSystem?.toLowerCase()) {
      case 'kidney':
        return 'water';
      case 'liver':
        return 'leaf';
      case 'heart':
        return 'heart';
      case 'thyroid':
        return 'radio';
      case 'bone':
        return 'fitness';
      default:
        return 'medical';
    }
  };

  const getBackgroundColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#1C3A1C';
      case 'low':
        return '#3A2F1C';
      case 'high':
        return '#3A2F1C';
      case 'critical':
        return '#3A1C1C';
      default:
        return '#2C2C2E';
    }
  };

  const renderMiniHistoryGraph = () => {
    const data = biomarker.historyData || [0.8, 0.85, 0.9, 0.88, 0.93, 0.95, 0.92, 0.89, 0.91, 0.93, 0.94, 0.93];
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

    // Generate Y-axis labels
    const yLabels = [];
    const numYLabels = 3;
    for (let i = 0; i <= numYLabels; i++) {
      const value = minValue + (range * i / numYLabels);
      yLabels.push(Math.round(value * 10) / 10);
    }

    // Generate X-axis labels (months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const xLabels = months.slice(-data.length);

    return (
      <View style={styles.historyGraph}>
        <View style={styles.graphHeader}>
          <Text style={styles.graphTitle}>12-Month Trend</Text>
          <TouchableOpacity style={styles.fullHistoryButton}>
            <Text style={styles.fullHistoryText}>Full History</Text>
            <Ionicons name="chevron-forward" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.graphContainer}>
          {/* Y-axis labels */}
          <View style={styles.yAxisContainer}>
            {yLabels.map((label, index) => (
              <Text key={index} style={styles.yAxisLabel}>
                {label}
              </Text>
            ))}
          </View>
          
          {/* Main graph */}
          <View style={styles.graphWrapper}>
            <Svg width={graphWidth} height={graphHeight} style={styles.graph}>
              {/* Normal range band */}
              <Path
                d={`M 0 ${graphHeight * 0.3} L ${graphWidth} ${graphHeight * 0.3} L ${graphWidth} ${graphHeight * 0.7} L 0 ${graphHeight * 0.7} Z`}
                fill="#1C3A1C"
              />
              {/* Data line */}
              <Path
                d={pathData}
                stroke="#007AFF"
                strokeWidth="2"
                fill="none"
              />
              {/* Current value marker */}
              <Circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="4"
                fill="#007AFF"
              />
            </Svg>
            
            {/* X-axis labels */}
            <View style={styles.xAxisContainer}>
              {xLabels.map((label, index) => (
                <Text key={index} style={styles.xAxisLabel}>
                  {label}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderRangeIndicator = () => {
    const rangeParts = biomarker.referenceRange.split('-');
    const minRange = parseFloat(rangeParts[0]);
    const maxRange = parseFloat(rangeParts[1]);
    const currentValue = biomarker.value;
    
    // Create a wider range for better visualization (extend beyond normal range)
    const extendedMin = minRange - (maxRange - minRange) * 0.5;
    const extendedMax = maxRange + (maxRange - minRange) * 0.5;
    const totalExtendedRange = extendedMax - extendedMin;
    
    // Calculate position on the extended range bar
    const position = Math.max(0, Math.min(1, (currentValue - extendedMin) / totalExtendedRange));
    
    // Calculate normal range position on the extended bar
    const normalStart = (minRange - extendedMin) / totalExtendedRange;
    const normalWidth = (maxRange - minRange) / totalExtendedRange;
    
    return (
      <View style={styles.rangeIndicator}>
        <Text style={styles.sectionTitle}>Range Indicator</Text>
        <View style={styles.rangeBarContainer}>
          <View style={styles.rangeBar}>
            {/* Gradient background */}
            <LinearGradient
              colors={['#FF3B30', '#FF9500', '#30D158', '#FF9500', '#FF3B30']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rangeGradient}
            />
            {/* Normal range highlight */}
            <View style={[styles.normalRange, { 
              left: `${normalStart * 100}%`, 
              width: `${normalWidth * 100}%` 
            }]} />
            {/* Current value marker */}
            <View style={[styles.valueMarker, { left: `${position * 100}%` }]}>
              <View style={styles.markerDot} />
              <Text style={styles.markerValue}>{currentValue}</Text>
            </View>
          </View>
          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabel}>{Math.round(extendedMin)}</Text>
            <Text style={styles.rangeLabel}>Normal Range</Text>
            <Text style={styles.rangeLabel}>{Math.round(extendedMax)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
          <Text style={styles.title}>{biomarker.name}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Result Card */}
          <View style={[styles.resultCard, { backgroundColor: getBackgroundColor(biomarker.status) }]}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultValue}>
                    {biomarker.value} {biomarker.unit}
                  </Text>
              <View style={styles.resultInfo}>
                <Text style={styles.resultRange}>
                    Normal: {biomarker.referenceRange}
                </Text>
                {biomarker.lastTested && (
                  <Text style={styles.lastTested}>
                    {biomarker.lastTested}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Range Indicator */}
          {renderRangeIndicator()}

          {/* Mini History Graph */}
          {renderMiniHistoryGraph()}

          {/* Compare to Others */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compare to Others</Text>
            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonText}>
                You're in the {biomarker.percentile || 72}th percentile vs all adults
              </Text>
              <TouchableOpacity 
                style={styles.fullComparisonButton}
                onPress={() => setComparisonModalVisible(true)}
              >
                <Text style={styles.fullComparisonText}>Full Comparison</Text>
                <Ionicons name="chevron-forward" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* What Your Level Means */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What Your Level Means</Text>
            <Text style={styles.sectionText}>
              {biomarker.levelMeaning?.[biomarker.status] || biomarker.whatItMeans}
            </Text>
          </View>

          {/* What is [Biomarker]? */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is {biomarker.name}?</Text>
            <Text style={styles.sectionText}>{biomarker.explanation}</Text>
          </View>

          {/* Why it Matters */}
          {biomarker.whyItMatters && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Why it Matters</Text>
              <Text style={styles.sectionText}>{biomarker.whyItMatters}</Text>
            </View>
          )}

          {/* Tips to Optimize */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips to Optimize</Text>
            {biomarker.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={20} color="#30D158" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Category Tag */}
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{biomarker.category}</Text>
          </View>
        </ScrollView>
      </View>

      {/* Comparison Modal */}
      <BiomarkerComparisonModal
        visible={comparisonModalVisible}
        biomarker={biomarker}
        onClose={() => setComparisonModalVisible(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  closeButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  organIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  organSystem: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultInfo: {
    alignItems: 'flex-end',
  },
  resultRange: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  lastTested: {
    fontSize: 11,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  rangeIndicator: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  rangeBarContainer: {
    marginTop: 16,
  },
  rangeBar: {
    height: 12,
    borderRadius: 6,
    position: 'relative',
    overflow: 'visible',
  },
  rangeGradient: {
    height: '100%',
    borderRadius: 6,
  },
  normalRange: {
    position: 'absolute',
    top: 0,
    height: '100%',
    backgroundColor: '#1C3A1C',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#30D158',
  },
  valueMarker: {
    position: 'absolute',
    top: -8,
    alignItems: 'center',
    transform: [{ translateX: -15 }],
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  markerValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 2,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
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
    color: '#007AFF',
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
  section: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
  },
  comparisonCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  comparisonText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    fontWeight: '500',
  },
  fullComparisonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  fullComparisonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 40,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default BiomarkerModal;
