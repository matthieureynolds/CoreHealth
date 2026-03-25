import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Polygon, Text as SvgText, G } from 'react-native-svg';
import { getMetricDetails } from '../travelHealthMetricDetails';
import { EnvironmentalMetric } from './EnvironmentalMetricCard';

interface Props {
  visible: boolean;
  metric: EnvironmentalMetric | null;
  getStatusColor: (status: string) => string;
  onClose: () => void;
}

const RANGE_DATA = {
  air_quality: {
    segments: [
      { label: 'Good', color: '#30D158', range: '0-50' },
      { label: 'Moderate', color: '#FF9F0A', range: '51-100', isBold: true },
      { label: 'Unhealthy for Sensitive', color: '#FF6B35', range: '101-150' },
      { label: 'Unhealthy', color: '#FF3B30', range: '151-200' },
      { label: 'Hazardous', color: '#8B0000', range: '201+' },
    ],
    currentValue: 75,
    currentLabel: 'Moderate',
    scale: 300,
  },
  pollen: {
    segments: [
      { label: 'Very Low', color: '#30D158', range: '0-4' },
      { label: 'Low', color: '#32D74B', range: '5-9' },
      { label: 'Moderate', color: '#FF9F0A', range: '10-49' },
      { label: 'High', color: '#FF6B35', range: '50-149' },
      { label: 'Very High', color: '#FF3B30', range: '150+' },
    ],
    currentValue: 25,
    currentLabel: 'Moderate',
    scale: 200,
  },
  water_quality: {
    segments: [
      { label: 'Poor', color: '#FF3B30', range: '0-44' },
      { label: 'Marginal', color: '#FF6B35', range: '45-64' },
      { label: 'Good', color: '#FF9F0A', range: '65-79', isBold: true },
      { label: 'Very Good', color: '#32D74B', range: '80-94' },
      { label: 'Excellent', color: '#30D158', range: '95-100' },
    ],
    currentValue: 87,
    currentLabel: 'Very Good',
    scale: 100,
  },
};

const RangeIndicator: React.FC<{ metric: EnvironmentalMetric }> = ({ metric }) => {
  const rangeData = RANGE_DATA[metric.id as keyof typeof RANGE_DATA];
  if (!rangeData) return null;

  const barWidth = 300;
  const barHeight = 20;
  const pointerPosition = Math.min((rangeData.currentValue / rangeData.scale) * barWidth, barWidth - 10);

  return (
    <View style={styles.rangeIndicatorContainer}>
      {Svg ? (
        <Svg width={barWidth} height={45}>
          {rangeData.segments.map((segment, index) => {
            const gap = 2;
            const totalGaps = (rangeData.segments.length - 1) * gap;
            const availableWidth = barWidth - totalGaps;
            const segW = availableWidth / rangeData.segments.length;
            const x = index * (segW + gap);
            return (
              <Rect
                key={index}
                x={x}
                y={2}
                width={segW}
                height={barHeight}
                fill={segment.color}
                rx={index === 0 ? 8 : index === rangeData.segments.length - 1 ? 8 : 0}
                ry={index === 0 ? 8 : index === rangeData.segments.length - 1 ? 8 : 0}
              />
            );
          })}
          <Polygon
            points={`${Math.min(Math.max(pointerPosition, 10), barWidth - 10)},0 ${Math.min(Math.max(pointerPosition - 6, 4), barWidth - 16)},15 ${Math.min(Math.max(pointerPosition + 6, 16), barWidth - 4)},15`}
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
          {rangeData.segments.map((segment, index) => {
            const gap = 2;
            const totalGaps = (rangeData.segments.length - 1) * gap;
            const availableWidth = barWidth - totalGaps;
            const segW = availableWidth / rangeData.segments.length;
            const x = index * (segW + gap);
            const centerX = x + segW / 2;
            return (
              <G key={index}>
                <SvgText
                  x={centerX}
                  y={32}
                  fontSize="10"
                  fill="#FFFFFF"
                  fontWeight={(segment as any).isBold ? 'bold' : '600'}
                  textAnchor="middle"
                >
                  {segment.label}
                </SvgText>
                <SvgText
                  x={centerX}
                  y={42}
                  fontSize="10"
                  fill="#8E8E93"
                  textAnchor="middle"
                >
                  {segment.range}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      ) : (
        <Text style={styles.currentScoreText}>Range indicator not available</Text>
      )}
      <View style={styles.currentScoreContainer}>
        <Text style={styles.currentScoreText}>
          Your score is in the {rangeData.currentLabel} range ({rangeData.currentValue}).
        </Text>
      </View>
    </View>
  );
};

const MetricDetailModal: React.FC<Props> = ({ visible, metric, getStatusColor, onClose }) => {
  if (!metric) return null;

  const details = getMetricDetails(metric.id, metric.status);
  const statusColor = getStatusColor(metric.status);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={[styles.modalIconContainer, { backgroundColor: `${statusColor}20` }]}>
              <Ionicons name={metric.icon} size={32} color={statusColor} />
            </View>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>{metric.label}</Text>
              <Text style={[styles.modalStatus, { color: statusColor }]}>
                {metric.value} • Score: {metric.score}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollContent}>
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>What is this?</Text>
              <Text style={styles.sectionContent}>{details.description}</Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Range Indicator</Text>
              <RangeIndicator metric={metric} />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>What this means for you</Text>
              <Text style={styles.sectionContent}>{details.whatItMeans}</Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Potential Health Impacts</Text>
              {details.healthImpacts.map((impact: string, index: number) => (
                <View key={index} style={styles.impactItem}>
                  <Ionicons name="checkmark-circle" size={16} color={statusColor} />
                  <Text style={styles.impactText}>{impact}</Text>
                </View>
              ))}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Recommendations</Text>
              {details.recommendations.map((recommendation: string, index: number) => (
                <View key={index} style={styles.recommendationItem}>
                  <Ionicons name="arrow-forward" size={16} color="#007AFF" />
                  <Text style={styles.recommendationText}>{recommendation}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.modalSection, { borderBottomWidth: 0 }]}>
              <Text style={styles.sectionTitle}>Risk Factors</Text>
              {details.riskFactors?.map((risk: string, index: number) => (
                <View key={index} style={styles.riskItem}>
                  <Ionicons name="warning" size={16} color="#FF9500" />
                  <Text style={styles.riskText}>{risk}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    width: '100%',
    maxHeight: '90%',
    maxWidth: 400,
    flex: 1,
  },
  modalScrollContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  modalSection: {
    padding: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    color: '#EBEBF5',
    lineHeight: 22,
    textAlign: 'justify',
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  impactText: {
    fontSize: 14,
    color: '#EBEBF5',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#EBEBF5',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  riskText: {
    fontSize: 14,
    color: '#EBEBF5',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  rangeIndicatorContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  currentScoreContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  currentScoreText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default MetricDetailModal;
