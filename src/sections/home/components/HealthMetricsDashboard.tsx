import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ColorValue,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useHealthData } from '../../context/HealthDataContext';
import { Biomarker, HealthScore } from '../../types';

const { width } = Dimensions.get('window');

interface HealthMetricsDashboardProps {
  onMetricPress?: (metric: string) => void;
  onBiomarkerPress?: (biomarker: Biomarker) => void;
}

const HealthMetricsDashboard: React.FC<HealthMetricsDashboardProps> = ({
  onMetricPress,
  onBiomarkerPress,
}) => {
  const { healthScore, biomarkers } = useHealthData();

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#30D158';
    if (score >= 60) return '#FF9500';
    return '#FF3B30';
  };

  const getScoreGradient = (score: number): [ColorValue, ColorValue] => {
    if (score >= 80) return ['#30D158', '#34C759'];
    if (score >= 60) return ['#FF9500', '#FF9F0A'];
    return ['#FF3B30', '#FF453A'];
  };

  const renderHealthScoreCard = () => {
    if (!healthScore) return null;

    const overallScore = healthScore.overall;
    const scoreColor = getScoreColor(overallScore);
    const gradientColors = getScoreGradient(overallScore);

    return (
      <LinearGradient
        colors={gradientColors}
        style={styles.mainScoreCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.scoreContent}>
          <View style={styles.scoreHeader}>
            <Ionicons name="heart" size={24} color="#fff" />
            <Text style={styles.scoreTitle}>Health Score</Text>
          </View>
          <Text style={styles.mainScore}>{overallScore}</Text>
          <Text style={styles.scoreSubtitle}>
            {overallScore >= 80 ? 'Excellent Health' : 
             overallScore >= 60 ? 'Good Health' : 'Needs Attention'}
          </Text>
          <View style={styles.scoreProgress}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${overallScore}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderMetricCard = (
    title: string,
    value: number,
    icon: string,
    color: string,
    category: keyof HealthScore
  ) => (
    <TouchableOpacity
      style={styles.metricCard}
      onPress={() => onMetricPress?.(category)}
    >
      <View style={[styles.metricIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <View style={styles.metricProgress}>
        <View style={styles.metricProgressBackground}>
          <View 
            style={[
              styles.metricProgressFill, 
              { width: `${value}%`, backgroundColor: color }
            ]} 
          />
        </View>
      </View>
      <Text style={styles.metricStatus}>
        {value >= 80 ? 'Excellent' : value >= 60 ? 'Good' : 'Fair'}
      </Text>
    </TouchableOpacity>
  );

  const renderBiomarkerCard = (biomarker: Biomarker) => {
    const getRiskColor = (riskLevel: string) => {
      switch (riskLevel) {
        case 'low': return '#30D158';
        case 'medium': return '#FF9500';
        case 'high': return '#FF3B30';
        default: return '#8E8E93';
      }
    };

    const getTrendIcon = (trend: string) => {
      switch (trend) {
        case 'improving': return 'trending-up';
        case 'declining': return 'trending-down';
        default: return 'remove';
      }
    };

    return (
      <TouchableOpacity
        key={biomarker.id}
        style={styles.biomarkerCard}
        onPress={() => onBiomarkerPress?.(biomarker)}
      >
        <View style={styles.biomarkerHeader}>
          <Text style={styles.biomarkerName}>{biomarker.name}</Text>
          <View style={styles.biomarkerIndicators}>
            <View
              style={[
                styles.riskIndicator,
                { backgroundColor: getRiskColor(biomarker.riskLevel) }
              ]}
            >
              <Ionicons
                name={
                  biomarker.riskLevel === 'low' ? 'checkmark' :
                  biomarker.riskLevel === 'medium' ? 'warning' : 'alert'
                }
                size={10}
                color="#fff"
              />
            </View>
            <Ionicons
              name={getTrendIcon(biomarker.trend) as any}
              size={16}
              color={
                biomarker.trend === 'improving' ? '#30D158' :
                biomarker.trend === 'declining' ? '#FF3B30' : '#8E8E93'
              }
            />
          </View>
        </View>
        <View style={styles.biomarkerContent}>
          <Text style={styles.biomarkerValue} numberOfLines={1} ellipsizeMode="tail">
            {`${biomarker.value} ${biomarker.unit}`}
          </Text>
          <Text style={styles.biomarkerCategory}>
            {biomarker.category.charAt(0).toUpperCase() + biomarker.category.slice(1)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
        <TouchableOpacity style={styles.quickActionCard}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="add" size={20} color="#1976D2" />
          </View>
          <Text style={styles.quickActionText}>Log Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#F3E5F5' }]}>
            <Ionicons name="camera" size={20} color="#7B1FA2" />
          </View>
          <Text style={styles.quickActionText}>Scan Report</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E8' }]}>
            <Ionicons name="fitness" size={20} color="#388E3C" />
          </View>
          <Text style={styles.quickActionText}>Track Activity</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="moon" size={20} color="#F57C00" />
          </View>
          <Text style={styles.quickActionText}>Log Sleep</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHealthScoreCard()}
      
      {healthScore && (
        <View style={styles.metricsGrid}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          <View style={styles.metricsRow}>
            {renderMetricCard('Sleep', healthScore.sleep, 'moon', '#9013FE', 'sleep')}
            {renderMetricCard('Activity', healthScore.activity, 'fitness', '#FF6B35', 'activity')}
          </View>
          <View style={styles.metricsRow}>
            {renderMetricCard('Stress', healthScore.stress, 'heart-outline', '#FF3B30', 'stress')}
            {renderMetricCard('Recovery', healthScore.recovery, 'refresh', '#30D158', 'recovery')}
          </View>
        </View>
      )}

      {renderQuickActions()}

      {biomarkers.length > 0 && (
        <View style={styles.biomarkersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Biomarkers</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.biomarkersContainer}>
              {biomarkers.slice(0, 4).map(renderBiomarkerCard)}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainScoreCard: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  scoreContent: {
    padding: 24,
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  mainScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  scoreSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 16,
  },
  scoreProgress: {
    width: '100%',
    alignItems: 'center',
  },
  progressBackground: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  metricsGrid: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 12,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metricProgress: {
    marginBottom: 8,
  },
  metricProgressBackground: {
    height: 4,
    backgroundColor: '#F2F2F7',
    borderRadius: 2,
    overflow: 'hidden',
  },
  metricProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  metricStatus: {
    fontSize: 12,
    color: '#8E8E93',
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  quickActionsScroll: {
    marginTop: 8,
  },
  quickActionCard: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 80,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#1D1D1F',
    textAlign: 'center',
  },
  biomarkersSection: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  biomarkersContainer: {
    flexDirection: 'row',
  },
  biomarkerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  biomarkerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  biomarkerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    flex: 1,
  },
  biomarkerIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  biomarkerContent: {
    alignItems: 'flex-start',
  },
  biomarkerValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  biomarkerCategory: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'capitalize',
  },
});

export default HealthMetricsDashboard; 