import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface RingMetric {
  id: string;
  title: string;
  value: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
}

interface SupportingRingsProps {
  recovery: number;
  biomarkers: number;
  lifestyle: number;
  onRingPress?: (ringId: string) => void;
}

const SupportingRings: React.FC<SupportingRingsProps> = ({ 
  recovery, 
  biomarkers, 
  lifestyle, 
  onRingPress 
}) => {
  const [selectedMetric, setSelectedMetric] = useState<RingMetric | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Animation values for each ring
  const animatedRecovery = useRef(new Animated.Value(0)).current;
  const animatedBiomarkers = useRef(new Animated.Value(0)).current;
  const animatedLifestyle = useRef(new Animated.Value(0)).current;
  
  const ringSize = (width - 48) / 3 - 16; // Responsive sizing
  const strokeWidth = 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Ensure we never have 0 values when we should have actual scores
  const safeRecovery = recovery ?? 85;
  const safeBiomarkers = biomarkers ?? 75;
  const safeLifestyle = lifestyle ?? 75;

  // Debug logging
  console.log('🔄 SupportingRings render:', { 
    recovery, 
    safeRecovery, 
    biomarkers, 
    safeBiomarkers, 
    lifestyle, 
    safeLifestyle 
  });

  // Set animation values directly - no complex state management
  useEffect(() => {
    animatedRecovery.setValue(safeRecovery);
    animatedBiomarkers.setValue(safeBiomarkers);
    animatedLifestyle.setValue(safeLifestyle);
  }, [safeRecovery, safeBiomarkers, safeLifestyle]);

  const metrics: RingMetric[] = [
    {
      id: 'recovery',
      title: 'RECOVERY',
      value: safeRecovery,
      color: '#30D158',
      icon: 'refresh',
      subtitle: 'Sleep & HRV'
    },
    {
      id: 'biomarkers',
      title: 'BIOMARKERS',
      value: safeBiomarkers,
      color: '#007AFF',
      icon: 'water',
      subtitle: 'Lab Results'
    },
    {
      id: 'lifestyle',
      title: 'LIFESTYLE',
      value: safeLifestyle,
      color: '#FF9F0A',
      icon: 'fitness',
      subtitle: 'Activity & Habits'
    }
  ];

  const getMetricDescription = (metric: RingMetric): string => {
    switch (metric.id) {
      case 'recovery':
        return 'Recovery score measures your body\'s ability to recover from stress and physical activity. It\'s based on sleep quality, heart rate variability, and rest periods.';
      case 'biomarkers':
        return 'Biomarker score reflects the health of your internal systems based on lab results, including blood work, hormone levels, and other health indicators.';
      case 'lifestyle':
        return 'Lifestyle score evaluates your daily habits including physical activity, nutrition, stress management, and overall health behaviors.';
      default:
        return '';
    }
  };

  const getComparisonText = (value: number): string => {
    if (value >= 80) return 'Top 20%';
    if (value >= 65) return 'Top 40%';
    if (value >= 50) return 'Top 60%';
    if (value >= 35) return 'Top 80%';
    return 'Top 90%';
  };

  const getMetricDetails = (metric: RingMetric) => {
    switch (metric.id) {
      case 'recovery':
        return [
          { title: 'Sleep Quality (40%)', desc: 'Sleep duration, consistency, and deep sleep cycles', icon: 'moon', color: '#9013FE' },
          { title: 'Heart Rate Variability (35%)', desc: 'Autonomic nervous system balance and recovery', icon: 'heart', color: '#FF3B30' },
          { title: 'Rest Periods (25%)', desc: 'Active recovery and stress management', icon: 'leaf', color: '#30D158' }
        ];
      case 'biomarkers':
        return [
          { title: 'Blood Work (40%)', desc: 'Complete blood count, metabolic panel, and lipids', icon: 'water', color: '#007AFF' },
          { title: 'Hormone Levels (35%)', desc: 'Thyroid, cortisol, testosterone, and other hormones', icon: 'flask', color: '#FF9F0A' },
          { title: 'Inflammation Markers (25%)', desc: 'CRP, ESR, and other inflammatory indicators', icon: 'thermometer', color: '#FF3B30' }
        ];
      case 'lifestyle':
        return [
          { title: 'Physical Activity (35%)', desc: 'Daily steps, exercise frequency, and intensity', icon: 'fitness', color: '#FF6B35' },
          { title: 'Nutrition (30%)', desc: 'Diet quality, hydration, and meal timing', icon: 'nutrition', color: '#30D158' },
          { title: 'Stress Management (20%)', desc: 'Mindfulness, relaxation, and work-life balance', icon: 'leaf', color: '#9013FE' },
          { title: 'Sleep Hygiene (15%)', desc: 'Bedtime routine and sleep environment', icon: 'moon', color: '#007AFF' }
        ];
      default:
        return [];
    }
  };

  const getPrettyMetricName = (metric?: RingMetric | null): string => {
    if (!metric) return '';
    switch (metric.id) {
      case 'recovery':
        return 'Recovery';
      case 'biomarkers':
        return 'Biomarkers';
      case 'lifestyle':
        return 'Lifestyle';
      default: {
        const lower = metric.title?.toLowerCase?.() || '';
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      }
    }
  };

  const renderMetricDistributionCurve = (metric: RingMetric) => {
    const chartWidth = 380; // keep width within modal maxWidth
    const chartHeight = 74; // ~additional 15% shorter
    const padding = 20;
    const curveWidth = chartWidth - (padding * 2);
    const curveHeight = chartHeight - (padding * 2);

    const mean = 50;
    const stdDev = 28; // ~additional 15% wider than before
    const amplitude = 0.245; // ~additional 15% flatter (0.288 * 0.85)

    // Build bell curve points across 0..100
    const points: { x: number; y: number }[] = [];
    for (let x = 0; x <= curveWidth; x += 2) {
      const normalizedX = (x / curveWidth) * 100;
      const yVal = Math.exp(-0.5 * Math.pow((normalizedX - mean) / stdDev, 2));
      const chartY = curveHeight - (yVal * curveHeight * amplitude) - 10;
      points.push({ x: x + padding, y: chartY });
    }

    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

    // User marker position by value (0-100)
    const userPosition = (Math.max(0, Math.min(metric.value, 100)) / 100) * curveWidth;
    const userNormalizedX = (userPosition / curveWidth) * 100;
    const userYVal = Math.exp(-0.5 * Math.pow((userNormalizedX - mean) / stdDev, 2));
    const userChartY = curveHeight - (userYVal * curveHeight * amplitude) - 10;

    // Build tail path (from user x to end)
    const tailPoints = points.filter(p => p.x >= userPosition + padding);
    const tailPathData = tailPoints.length > 0
      ? `M ${[ { x: userPosition + padding, y: userChartY }, ...tailPoints ].map(p => `${p.x},${p.y}`).join(' L ')}`
      : '';

    return (
      <Svg width={chartWidth} height={chartHeight}>
        {/* Main curve in white */}
        <Path d={pathData} stroke="#FFFFFF" strokeWidth="2" fill="none" />

        {/* Mean dashed line at 50 */}
        <Path
          d={`M ${padding + curveWidth/2},${padding} L ${padding + curveWidth/2},${curveHeight - 10}`}
          stroke="#8E8E93"
          strokeWidth="1"
          strokeDasharray="4,6"
          opacity="0.6"
        />

        {/* Colored tail after user's position */}
        {tailPathData !== '' && (
          <Path d={tailPathData} stroke={metric.color} strokeWidth="2" fill="none" />
        )}

        {/* User marker */}
        <Circle
          cx={userPosition + padding}
          cy={userChartY}
          r="5"
          fill="#FFFFFF"
          stroke={metric.color}
          strokeWidth="2"
        />

        {/* X-axis labels */}
        <SvgText x={padding} y={chartHeight - 5} fontSize="10" fill="#8E8E93" textAnchor="start">0</SvgText>
        <SvgText x={padding + curveWidth/2} y={chartHeight - 5} fontSize="10" fill="#8E8E93" textAnchor="middle">50</SvgText>
        <SvgText x={padding + curveWidth} y={chartHeight - 5} fontSize="10" fill="#8E8E93" textAnchor="end">100</SvgText>
      </Svg>
    );
  };

  // Create animated ring component
  const AnimatedRing = ({ metric, animatedValue }: { metric: RingMetric, animatedValue: Animated.Value }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [strokeDashoffset, setStrokeDashoffset] = useState(circumference);
    
    useEffect(() => {
      const listener = animatedValue.addListener(({ value }) => {
        const roundedValue = Math.round(value);
        setDisplayValue(roundedValue);
        setStrokeDashoffset(circumference - (roundedValue / 100) * circumference);
      });
      
      return () => {
        animatedValue.removeListener(listener);
      };
    }, []);

    const strokeDasharray = `${circumference} ${circumference}`;

    return (
      <TouchableOpacity
        style={styles.ringContainer}
        onPress={() => {
          setSelectedMetric(metric);
          setModalVisible(true);
          onRingPress?.(metric.id);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.ringContent}>
          <Svg width={ringSize} height={ringSize} style={styles.svg}>
            {/* Background circle */}
            <Circle
              stroke="#2C2C2E"
              fill="none"
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <Circle
              stroke={metric.color}
              fill="none"
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            />
          </Svg>
          
          <View style={styles.ringCenter}>
            <Ionicons name={metric.icon} size={20} color={metric.color} />
            <Text style={[styles.ringValue, { color: metric.color }]}>
              {displayValue}
            </Text>
          </View>
        </View>
        
        {/* Labels below the circle */}
        <View style={styles.ringLabels}>
          <Text style={styles.ringTitle}>{metric.title}</Text>
          {metric.subtitle && (
            <Text style={styles.ringSubtitle}>{metric.subtitle}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderRing = (metric: RingMetric) => {
    // Use animated component for each metric
    switch (metric.id) {
      case 'recovery':
        return <AnimatedRing key={metric.id} metric={metric} animatedValue={animatedRecovery} />;
      case 'biomarkers':
        return <AnimatedRing key={metric.id} metric={metric} animatedValue={animatedBiomarkers} />;
      case 'lifestyle':
        return <AnimatedRing key={metric.id} metric={metric} animatedValue={animatedLifestyle} />;
      default:
        return null;
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Health Metrics</Text>
        <View style={styles.ringsRow}>
          {metrics.map(renderRing)}
        </View>
      </View>

      {/* Metric Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButtonLeft}
              >
                <Ionicons name="close" size={24} color="#FF3B30" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{getPrettyMetricName(selectedMetric)} Score Details</Text>
            </View>
            
            {selectedMetric && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Score Display */}
                <View style={styles.scoreDisplay}>
                  <View style={[styles.scoreCircle, { borderColor: selectedMetric.color }]}>
                    <Text style={[styles.modalScoreValue, { color: selectedMetric.color }]}>
                      {selectedMetric.value}
                    </Text>
                    <Text style={styles.modalScoreLabel}>{selectedMetric.subtitle}</Text>
                  </View>
                </View>

                {/* Distribution Curve Section */}
                <View style={styles.section}>
                  <Text style={styles.modalSectionTitle}>Distribution</Text>
                  <View style={styles.distributionContainer}>
                    {renderMetricDistributionCurve(selectedMetric)}
                    <Text style={styles.distributionText}>
                      {Math.round(selectedMetric.value)}th percentile
                    </Text>
                  </View>
                </View>

                {/* Description Section */}
                <View style={styles.section}>
                  <Text style={styles.modalSectionTitle}>What This Means:</Text>
                  <Text style={styles.descriptionTextJustified}>
                    {getMetricDescription(selectedMetric)}
                  </Text>
                </View>

                {/* How It's Measured Section */}
                <View style={styles.section}>
                  <Text style={styles.modalSectionTitle}>How It's Measured:</Text>
                  {getMetricDetails(selectedMetric).map((detail, index) => (
                    <View key={index} style={styles.measurementItem}>
                      <Ionicons name={detail.icon as any} size={20} color={detail.color} />
                      <View style={styles.measurementText}>
                        <Text style={styles.measurementTitle}>{detail.title}</Text>
                        <Text style={styles.measurementDesc}>{detail.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Evenly distribute circles
    alignItems: 'flex-start',
    paddingHorizontal: 0, // Remove side padding
  },
  ringContainer: {
    alignItems: 'center',
    maxWidth: (width - 48) / 3,
    marginHorizontal: 0,
  },
  ringContent: {
    position: 'relative',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: (width - 48) / 3 - 16,
    height: (width - 48) / 3 - 16,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabels: {
    alignItems: 'center',
    marginTop: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  ringValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ringTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ringSubtitle: {
    fontSize: 9,
    color: '#8E8E93',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonLeft: {
    position: 'absolute',
    left: 16,
    top: 16,
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#2C2C2E',
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalScoreLabel: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  comparisonCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  comparisonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  comparisonSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  descriptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  descriptionTextJustified: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    textAlign: 'justify',
  },
  measurementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  measurementText: {
    flex: 1,
    marginLeft: 12,
  },
  measurementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  measurementDesc: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  distributionContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  distributionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default SupportingRings; 