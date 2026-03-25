import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HealthAssistantResponse } from '../../../../../shared/services/ai/healthAssistantService';

interface InsightsTabContentProps {
  insights: HealthAssistantResponse | null;
}

export const InsightsContent: React.FC<InsightsTabContentProps> = ({ insights }) => (
  <View style={styles.contentContainer}>
    {insights?.insights.map((insight, index) => (
      <View key={index} style={styles.insightItem}>
        <View style={styles.insightIcon}>
          <Ionicons name="bulb" size={16} color="#FF9500" />
        </View>
        <Text style={styles.insightText}>{insight}</Text>
      </View>
    ))}
  </View>
);

export const RecommendationsContent: React.FC<InsightsTabContentProps> = ({ insights }) => (
  <View style={styles.contentContainer}>
    {insights?.recommendations.map((recommendation, index) => (
      <View key={index} style={styles.recommendationItem}>
        <View style={styles.recommendationIcon}>
          <Ionicons name="checkmark-circle" size={16} color="#30D158" />
        </View>
        <Text style={styles.recommendationText}>{recommendation}</Text>
      </View>
    ))}
  </View>
);

const getRiskColor = (level: string) => {
  switch (level) {
    case 'low': return '#30D158';
    case 'medium': return '#FF9500';
    case 'high': return '#FF3B30';
    default: return '#8E8E93';
  }
};

export const ActionsContent: React.FC<InsightsTabContentProps> = ({ insights }) => (
  <View style={styles.contentContainer}>
    <View style={styles.riskAssessment}>
      <View style={[styles.riskIndicator, { backgroundColor: getRiskColor(insights?.riskAssessment.level || 'low') }]}>
        <Ionicons
          name={insights?.riskAssessment.level === 'low' ? 'shield-checkmark' : 'warning'}
          size={16}
          color="#fff"
        />
      </View>
      <View style={styles.riskInfo}>
        <Text style={styles.riskLevel}>Risk Level: {insights?.riskAssessment.level?.toUpperCase()}</Text>
        {insights?.riskAssessment.concerns.map((concern, index) => (
          <Text key={index} style={styles.riskConcern}>• {concern}</Text>
        ))}
      </View>
    </View>

    <View style={styles.actionsSection}>
      <Text style={styles.actionsSectionTitle}>Next Actions:</Text>
      {insights?.nextActions.map((action, index) => (
        <View key={index} style={styles.actionItem}>
          <View style={styles.actionNumber}>
            <Text style={styles.actionNumberText}>{index + 1}</Text>
          </View>
          <Text style={styles.actionText}>{action}</Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#1D1D1F',
    lineHeight: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E6F7E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#1D1D1F',
    lineHeight: 20,
  },
  riskAssessment: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  riskIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  riskInfo: {
    flex: 1,
  },
  riskLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  riskConcern: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  actionsSection: {
    marginTop: 8,
  },
  actionsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  actionNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  actionNumberText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    color: '#1D1D1F',
    lineHeight: 20,
  },
});
