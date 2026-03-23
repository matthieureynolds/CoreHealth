import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../shared/types';
import { useHealthData } from '../../../shared/context/HealthDataContext';
import HeroHealthScore from './HeroHealthScore';
import SupportingRings from '../health-metrics/rings/SupportingRings';
import { deriveDashboardScores } from './utils';

type Route = RouteProp<RootStackParamList, 'HealthScoreDetail'>;
type Nav = StackNavigationProp<RootStackParamList, 'HealthScoreDetail'>;

const HealthScoreDetailScreen: React.FC = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { healthScore } = useHealthData();

  const {
    overallHealthScore,
    finalRecoveryScore,
    finalBiomarkersScore,
    finalLifestyleScore,
  } = deriveDashboardScores(healthScore);

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Attention';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#30D158';
    if (score >= 60) return '#FF9500';
    return '#FF3B30';
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Score</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Health Score Display */}
        <View style={styles.heroSection}>
          <HeroHealthScore score={overallHealthScore} />
        </View>

        {/* Overall Score Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Health Score</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(overallHealthScore) }]}>
            {overallHealthScore}
          </Text>
          <Text style={styles.scoreLabel}>{getScoreLabel(overallHealthScore)}</Text>
          <Text style={styles.description}>
            Your overall health score is calculated from three key components: Recovery, Biomarkers, and Lifestyle.
            It provides a comprehensive view of your current health status.
          </Text>
        </View>

        {/* Supporting Rings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score Breakdown</Text>
          <SupportingRings 
            recovery={finalRecoveryScore}
            biomarkers={finalBiomarkersScore}
            lifestyle={finalLifestyleScore}
            onRingPress={(ringId) => {
              // Navigate to individual score details if needed
            }}
          />
        </View>

        {/* What This Means */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What This Means</Text>
          <Text style={styles.description}>
            Your CoreHealth score is a holistic measure of your overall wellness. It combines:
          </Text>
          <View style={styles.factorItem}>
            <Ionicons name="heart" size={20} color="#FF3B30" />
            <View style={styles.factorText}>
              <Text style={styles.factorTitle}>Recovery ({finalRecoveryScore})</Text>
              <Text style={styles.factorDesc}>Sleep quality, heart rate variability, and rest periods</Text>
            </View>
          </View>
          <View style={styles.factorItem}>
            <Ionicons name="flask" size={20} color="#007AFF" />
            <View style={styles.factorText}>
              <Text style={styles.factorTitle}>Biomarkers ({finalBiomarkersScore})</Text>
              <Text style={styles.factorDesc}>Lab results, hormone levels, and internal health indicators</Text>
            </View>
          </View>
          <View style={styles.factorItem}>
            <Ionicons name="fitness" size={20} color="#FF9500" />
            <View style={styles.factorText}>
              <Text style={styles.factorTitle}>Lifestyle ({finalLifestyleScore})</Text>
              <Text style={styles.factorDesc}>Physical activity, nutrition, stress management, and habits</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: '#000000' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  headerButton: { 
    padding: 8, 
    marginRight: 6 
  },
  headerRightSpacer: { 
    width: 32 
  },
  headerTitle: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: '700', 
    flex: 1, 
    textAlign: 'center' 
  },
  content: { 
    flex: 1 
  },
  heroSection: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreLabel: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  description: {
    color: '#EBEBF5',
    fontSize: 15,
    lineHeight: 22,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  factorText: {
    flex: 1,
    marginLeft: 12,
  },
  factorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  factorDesc: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});

export default HealthScoreDetailScreen;

