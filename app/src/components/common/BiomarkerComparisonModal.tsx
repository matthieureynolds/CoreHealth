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
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface BiomarkerComparisonModalProps {
  visible: boolean;
  biomarker: {
    name: string;
    value: number;
    unit: string;
    percentile?: number;
    comparisonData?: {
      allPopulation: number;
      ageSexGroup: number;
    };
  } | null;
  onClose: () => void;
}

const BiomarkerComparisonModal: React.FC<BiomarkerComparisonModalProps> = ({
  visible,
  biomarker,
  onClose,
}) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'ageSex'>('all');

  if (!biomarker) return null;

  const currentPercentile = selectedTab === 'all' 
    ? biomarker.comparisonData?.allPopulation || biomarker.percentile || 72
    : biomarker.comparisonData?.ageSexGroup || biomarker.percentile || 75;

  const renderBellCurve = () => {
    const graphWidth = width - 60;
    const graphHeight = 200;
    const centerX = graphWidth / 2;
    const centerY = graphHeight / 2;
    
    // Calculate user's position on the curve (percentile to x position)
    const userX = (currentPercentile / 100) * graphWidth;
    
    // Generate bell curve points
    const points = [];
    for (let x = 0; x <= graphWidth; x += 2) {
      const normalizedX = (x - centerX) / (graphWidth * 0.3); // Standard deviation scaling
      const y = centerY - (Math.exp(-normalizedX * normalizedX / 2) * 80);
      points.push(`${x},${y}`);
    }
    
    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point}`
    ).join(' ');

    // Area under curve to user's position
    const areaPoints = [`M 0,${centerY}`];
    for (let x = 0; x <= userX; x += 2) {
      const normalizedX = (x - centerX) / (graphWidth * 0.3);
      const y = centerY - (Math.exp(-normalizedX * normalizedX / 2) * 80);
      areaPoints.push(`L ${x},${y}`);
    }
    areaPoints.push(`L ${userX},${centerY} Z`);
    const areaData = areaPoints.join(' ');

    return (
      <View style={styles.graphContainer}>
        <Svg width={graphWidth} height={graphHeight} style={styles.bellCurve}>
          {/* Area under curve */}
          <Path
            d={areaData}
            fill="#30D158"
            fillOpacity="0.3"
          />
          {/* Bell curve line */}
          <Path
            d={pathData}
            stroke="#8E8E93"
            strokeWidth="2"
            fill="none"
          />
          {/* User's position line */}
          <Line
            x1={userX}
            y1={0}
            x2={userX}
            y2={graphHeight}
            stroke="#30D158"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          {/* User's position marker */}
          <Circle
            cx={userX}
            cy={centerY - (Math.exp(-Math.pow((userX - centerX) / (graphWidth * 0.3), 2) / 2) * 80)}
            r="6"
            fill="#30D158"
          />
          {/* User's level label */}
          <SvgText
            x={userX}
            y={graphHeight - 10}
            fontSize="12"
            fill="#30D158"
            textAnchor="middle"
            fontWeight="bold"
          >
            Your level!
          </SvgText>
        </Svg>
      </View>
    );
  };

  const getInterpretation = (percentile: number) => {
    if (percentile < 25) {
      return "Your level is significantly lower than average, which may indicate excellent health in this area or could warrant further investigation.";
    } else if (percentile < 40) {
      return "Your level is below average, which is generally positive and indicates good health in this biomarker.";
    } else if (percentile < 60) {
      return "Your level is slightly below average, which is typically within the healthy range and indicates good health.";
    } else if (percentile < 75) {
      return "Your level is slightly higher than average, but still within the healthy range for most people.";
    } else if (percentile < 90) {
      return "Your level is higher than average, which may require monitoring or lifestyle adjustments to optimize your health.";
    } else {
      return "Your level is significantly higher than average, which may require medical attention and lifestyle modifications.";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>How You Compare</Text>
            <Text style={styles.subtitle}>Based on latest available medical population data</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Comparison Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
              onPress={() => setSelectedTab('all')}
            >
              <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
                All Population
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'ageSex' && styles.activeTab]}
              onPress={() => setSelectedTab('ageSex')}
            >
              <Text style={[styles.tabText, selectedTab === 'ageSex' && styles.activeTabText]}>
                My Age & Sex Group
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bell Curve Graph */}
          {renderBellCurve()}

          {/* X-axis label */}
          <Text style={styles.axisLabel}>{biomarker.name} ({biomarker.unit})</Text>

          {/* Percentile Result */}
          <View style={styles.resultContainer}>
            <Text style={styles.percentileText}>
              You are in the {currentPercentile}th percentile
            </Text>
            <Text style={styles.percentileSubtext}>
              Higher than {currentPercentile}% of people in your {selectedTab === 'all' ? 'population' : 'demographic group'}
            </Text>
          </View>

          {/* Interpretation */}
          <View style={styles.interpretationContainer}>
            <Text style={styles.interpretationText}>
              {getInterpretation(currentPercentile)}
            </Text>
          </View>

          {/* Data Source */}
          <View style={styles.dataSourceContainer}>
            <Text style={styles.dataSourceText}>
              Data source: National Health and Nutrition Examination Survey (NHANES) 2017-2020
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  graphContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bellCurve: {
    marginVertical: 8,
  },
  axisLabel: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  resultContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  percentileText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  percentileSubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  interpretationContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  interpretationText: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
  },
  dataSourceContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dataSourceText: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default BiomarkerComparisonModal;
