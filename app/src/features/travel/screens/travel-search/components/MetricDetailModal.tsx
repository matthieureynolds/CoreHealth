import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../TravelScreen.styles';
import {
  getStatusColor,
  getStatusLabel,
  getMetricScore,
  getMetricDetails,
} from '../travelMetricHelpers';

// NOTE: renderRangeIndicatorDetailed is a pre-existing undefined reference preserved from the original file.
declare function renderRangeIndicatorDetailed(id: string, status: string, score: any): React.ReactNode;

interface MetricDetailModalProps {
  visible: boolean;
  metric: any | null;
  onClose: () => void;
}

const MetricDetailModal: React.FC<MetricDetailModalProps> = ({ visible, metric, onClose }) => {
  if (!visible || !metric) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainerDetailed}>
        <View style={styles.modalHeaderDetailed}>
          <View style={[styles.modalIconCircleDetailed, { backgroundColor: `${getStatusColor(metric.status)}20` }]}>
            <Ionicons
              name={
                metric.id === 'pollen' ? 'flower-outline' :
                metric.id === 'uv_index' ? 'sunny' :
                metric.id === 'air_quality' ? 'cloud-outline' :
                metric.id === 'water_safety' ? 'water-outline' :
                metric.id === 'outbreaks' ? 'bug-outline' :
                metric.id === 'altitude' ? 'trending-up-outline' :
                'information-circle'
              }
              size={32}
              color={getStatusColor(metric.status)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.modalTitleDetailed}>{metric.label}</Text>
            <Text style={[styles.modalStatusDetailed, { color: getStatusColor(metric.status) }]}>
              {getStatusLabel(metric.status)} • Score: {metric.score ?? getMetricScore(metric.label)}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
            <Ionicons name="close" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={styles.modalSectionDetailed}>
            <Text style={styles.sectionTitleDetailed}>What is this?</Text>
            <Text style={styles.sectionContentDetailed}>
              {getMetricDetails(metric.id, metric.status).description}
            </Text>
          </View>

          <View style={styles.modalSectionDetailed}>
            <Text style={styles.sectionTitleDetailed}>Range Indicator</Text>
            {renderRangeIndicatorDetailed(metric.id, metric.status, metric.score)}
          </View>

          {(getMetricDetails(metric.id, metric.status).normalRange || getMetricDetails(metric.id, metric.status).optimalRange) && (
            <View style={styles.modalSectionDetailed}>
              {getMetricDetails(metric.id, metric.status).normalRange && (
                <Text style={styles.sectionContentDetailed}>
                  Normal ranges: {getMetricDetails(metric.id, metric.status).normalRange}
                </Text>
              )}
              {getMetricDetails(metric.id, metric.status).optimalRange && (
                <Text style={[styles.sectionContentDetailed, { marginTop: 6 }]}>
                  Optimal: {getMetricDetails(metric.id, metric.status).optimalRange}
                </Text>
              )}
            </View>
          )}

          <View style={styles.modalSectionDetailed}>
            <Text style={styles.sectionTitleDetailed}>What this means for you</Text>
            <Text style={styles.sectionContentDetailed}>
              {getMetricDetails(metric.id, metric.status).whatItMeans}
            </Text>
          </View>

          {getMetricDetails(metric.id, metric.status).healthImpacts.length > 0 && (
            <View style={styles.modalSectionDetailed}>
              <Text style={styles.sectionTitleDetailed}>Potential Health Impacts</Text>
              {getMetricDetails(metric.id, metric.status).healthImpacts.map((impact: string, idx: number) => (
                <View key={idx} style={styles.impactItemDetailed}>
                  <Ionicons name="checkmark-circle" size={16} color={getStatusColor(metric.status)} />
                  <Text style={styles.impactTextDetailed}>{impact}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.modalSectionDetailed}>
            <Text style={styles.sectionTitleDetailed}>Recommendations</Text>
            {getMetricDetails(metric.id, metric.status).recommendations.map((r: string, idx: number) => (
              <View key={idx} style={styles.recommendationItemDetailed}>
                <Ionicons name="arrow-forward" size={16} color="#007AFF" />
                <Text style={styles.recommendationTextDetailed}>{r}</Text>
              </View>
            ))}
          </View>

          {getMetricDetails(metric.id, metric.status).riskFactors.length > 0 && (
            <View style={[styles.modalSectionDetailed, { borderBottomWidth: 0 }]}>
              <Text style={styles.sectionTitleDetailed}>Risk Factors</Text>
              {getMetricDetails(metric.id, metric.status).riskFactors.map((risk: string, idx: number) => (
                <View key={idx} style={styles.riskItemDetailed}>
                  <Ionicons name="warning" size={16} color="#FF9500" />
                  <Text style={styles.riskTextDetailed}>{risk}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default MetricDetailModal;
