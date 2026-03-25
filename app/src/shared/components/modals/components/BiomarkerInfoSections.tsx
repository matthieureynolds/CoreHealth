import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BiomarkerInfo } from '../BiomarkerModal';

interface BiomarkerInfoSectionsProps {
  biomarker: BiomarkerInfo;
  onComparePress: () => void;
}

const BiomarkerInfoSections: React.FC<BiomarkerInfoSectionsProps> = ({ biomarker, onComparePress }) => (
  <>
    {/* Compare to Others */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Compare to Others</Text>
      <View style={styles.comparisonCard}>
        <Text style={styles.comparisonText}>
          You're in the {biomarker.percentile || 72}th percentile vs all adults
        </Text>
        <TouchableOpacity style={styles.fullComparisonButton} onPress={onComparePress}>
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
  </>
);

const styles = StyleSheet.create({
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
});

export default BiomarkerInfoSections;
