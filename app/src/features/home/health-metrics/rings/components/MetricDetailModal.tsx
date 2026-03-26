import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RingMetric } from './AnimatedRing';
import MetricDistributionCurve from './MetricDistributionCurve';

interface MetricDetailModalProps {
  visible: boolean;
  metric: RingMetric | null;
  onClose: () => void;
}

const getMetricDescription = (metric: RingMetric): string => {
  switch (metric.id) {
    case 'recovery':
      return "Recovery score measures your body's ability to recover from stress and physical activity. It's based on sleep quality, heart rate variability, and rest periods.";
    case 'biomarkers':
      return 'Biomarker score reflects the health of your internal systems based on lab results, including blood work, hormone levels, and other health indicators.';
    case 'lifestyle':
      return 'Lifestyle score evaluates your daily habits including physical activity, nutrition, stress management, and overall health behaviors.';
    default:
      return '';
  }
};

const getMetricDetails = (metric: RingMetric) => {
  switch (metric.id) {
    case 'recovery':
      return [
        { title: 'Sleep Quality (40%)', desc: 'Sleep duration, consistency, and deep sleep cycles', icon: 'moon', color: '#9013FE' },
        { title: 'Heart Rate Variability (35%)', desc: 'Autonomic nervous system balance and recovery', icon: 'heart', color: '#FF3B30' },
        { title: 'Rest Periods (25%)', desc: 'Active recovery and stress management', icon: 'leaf', color: '#30D158' },
      ];
    case 'biomarkers':
      return [
        { title: 'Blood Work (40%)', desc: 'Complete blood count, metabolic panel, and lipids', icon: 'water', color: '#3AABF0' },
        { title: 'Hormone Levels (35%)', desc: 'Thyroid, cortisol, testosterone, and other hormones', icon: 'flask', color: '#FF9F0A' },
        { title: 'Inflammation Markers (25%)', desc: 'CRP, ESR, and other inflammatory indicators', icon: 'thermometer', color: '#FF3B30' },
      ];
    case 'lifestyle':
      return [
        { title: 'Physical Activity (35%)', desc: 'Daily steps, exercise frequency, and intensity', icon: 'fitness', color: '#FF6B35' },
        { title: 'Nutrition (30%)', desc: 'Diet quality, hydration, and meal timing', icon: 'nutrition', color: '#30D158' },
        { title: 'Stress Management (20%)', desc: 'Mindfulness, relaxation, and work-life balance', icon: 'leaf', color: '#9013FE' },
        { title: 'Sleep Hygiene (15%)', desc: 'Bedtime routine and sleep environment', icon: 'moon', color: '#3AABF0' },
      ];
    default:
      return [];
  }
};

const getPrettyMetricName = (metric: RingMetric | null): string => {
  if (!metric) return '';
  switch (metric.id) {
    case 'recovery': return 'Recovery';
    case 'biomarkers': return 'Biomarkers';
    case 'lifestyle': return 'Lifestyle';
    default: {
      const lower = metric.title?.toLowerCase?.() || '';
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }
  }
};

const MetricDetailModal: React.FC<MetricDetailModalProps> = ({ visible, metric, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButtonLeft}>
              <Ionicons name="close" size={24} color="#FF3B30" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{getPrettyMetricName(metric)} Score Details</Text>
          </View>

          {metric && (
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Score Display */}
              <View style={styles.scoreDisplay}>
                <View style={[styles.scoreCircle, { borderColor: metric.color }]}>
                  <Text style={[styles.modalScoreValue, { color: metric.color }]}>
                    {metric.value}
                  </Text>
                  <Text style={styles.modalScoreLabel}>{metric.subtitle}</Text>
                </View>
              </View>

              {/* Distribution Curve */}
              <View style={styles.section}>
                <Text style={styles.modalSectionTitle}>Distribution</Text>
                <View style={styles.distributionContainer}>
                  <MetricDistributionCurve metric={metric} />
                  <Text style={styles.distributionText}>
                    {Math.round(metric.value)}th percentile
                  </Text>
                </View>
              </View>

              {/* Description */}
              <View style={styles.section}>
                <Text style={styles.modalSectionTitle}>What This Means:</Text>
                <Text style={styles.descriptionTextJustified}>
                  {getMetricDescription(metric)}
                </Text>
              </View>

              {/* How It's Measured */}
              <View style={styles.section}>
                <Text style={styles.modalSectionTitle}>How It's Measured:</Text>
                {getMetricDetails(metric).map((detail, index) => (
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
  );
};

const styles = StyleSheet.create({
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
});

export default MetricDetailModal;
