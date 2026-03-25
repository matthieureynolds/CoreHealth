import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MetricDetailSectionsProps {
  whatItMeans: string;
  healthImpacts: string[];
  recommendations: string[];
  riskFactors: string[];
  statusColor: string;
}

const MetricDetailSections: React.FC<MetricDetailSectionsProps> = ({
  whatItMeans,
  healthImpacts,
  recommendations,
  riskFactors,
  statusColor,
}) => (
  <>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>What this means</Text>
      <Text style={styles.sectionText}>{whatItMeans}</Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Potential Health Impacts</Text>
      {healthImpacts.map((impact, i) => (
        <View style={styles.row} key={i}>
          <Ionicons name="checkmark-circle" size={16} color={statusColor} />
          <Text style={styles.rowText}>{impact}</Text>
        </View>
      ))}
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recommendations</Text>
      {recommendations.map((rec, i) => (
        <View style={styles.row} key={i}>
          <Ionicons name="arrow-forward" size={16} color="#007AFF" />
          <Text style={styles.rowText}>{rec}</Text>
        </View>
      ))}
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Risk Factors</Text>
      {riskFactors.map((risk, i) => (
        <View style={styles.row} key={i}>
          <Ionicons name="warning" size={16} color="#FF9500" />
          <Text style={styles.rowText}>{risk}</Text>
        </View>
      ))}
    </View>
  </>
);

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    backgroundColor: '#0E0E0F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  sectionText: {
    color: '#E5E5EA',
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  rowText: {
    color: '#E5E5EA',
    marginLeft: 8,
    lineHeight: 20,
    fontSize: 14,
    flex: 1,
  },
});

export default MetricDetailSections;
