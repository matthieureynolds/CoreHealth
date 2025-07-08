import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import BiomarkerModal, {
  BiomarkerInfo,
} from '../../components/common/BiomarkerModal';
import { getBiomarkerInfo } from '../../data/biomarkerDatabase';
import HealthInsightsCard from '../../components/dashboard/HealthInsightsCard';
import HealthMetricsDashboard from '../../components/dashboard/HealthMetricsDashboard';
import HealthChatModal from '../../components/dashboard/HealthChatModal';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { healthScore, dailyInsights, biomarkers, generateDailyInsights } = useHealthData();
  const [selectedBiomarker, setSelectedBiomarker] =
    useState<BiomarkerInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await generateDailyInsights();
    } catch (error) {
      console.error('Failed to refresh insights:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBiomarkerPress = (biomarkerName: string, value: number) => {
    // Determine status based on biomarker name and value (simplified logic)
    const getStatus = (
      name: string,
      val: number,
    ): 'normal' | 'low' | 'high' | 'critical' => {
      // This is simplified - in a real app you'd have more sophisticated logic
      const normalRanges: { [key: string]: { min: number; max: number } } = {
        'Heart Rate Variability': { min: 30, max: 60 },
        'Resting Heart Rate': { min: 50, max: 100 },
        'Blood Glucose': { min: 70, max: 99 },
        Creatinine: { min: 0.6, max: 1.2 },
        ALT: { min: 7, max: 56 },
        AST: { min: 10, max: 40 },
      };

      const range = normalRanges[name];
      if (!range) return 'normal';

      if (val < range.min) return 'low';
      if (val > range.max) return 'high';
      return 'normal';
    };

    const status = getStatus(biomarkerName, value);
    const biomarkerInfo = getBiomarkerInfo(biomarkerName, value, status);

    if (biomarkerInfo) {
      setSelectedBiomarker(biomarkerInfo);
      setModalVisible(true);
    }
  };

  const renderHealthScore = () => (
    <View style={styles.scoreCard}>
      <LinearGradient
        colors={['#007AFF', '#5AC8FA']}
        style={styles.scoreGradient}
      >
        <Text style={styles.scoreTitle}>Overall Health Score</Text>
        <Text style={styles.scoreValue}>{healthScore?.overall || 0}</Text>
        <Text style={styles.scoreSubtitle}>Great progress this week!</Text>
      </LinearGradient>
    </View>
  );

  const renderMetricCard = (
    title: string,
    value: number,
    icon: string,
    color: string,
  ) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );

  const renderInsightCard = (insight: any) => (
    <TouchableOpacity key={insight.id} style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <Ionicons
          name={insight.priority === 'high' ? 'warning' : 'information-circle'}
          size={24}
          color={insight.priority === 'high' ? '#FF3B30' : '#007AFF'}
        />
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <Text style={styles.insightDescription}>{insight.description}</Text>
          {insight.actionable && (
            <Text style={styles.insightAction}>{insight.action}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              Good {getTimeOfDay()}, {user?.displayName || 'User'}!
            </Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.aiButton}
            onPress={() => setChatModalVisible(true)}
          >
            <Ionicons name="sparkles" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <HealthMetricsDashboard 
          onMetricPress={(metric) => console.log('Metric pressed:', metric)}
          onBiomarkerPress={(biomarker) => handleBiomarkerPress(biomarker.name, biomarker.value)}
        />

        <HealthInsightsCard 
          onChatPress={() => setChatModalVisible(true)}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Insights</Text>
          {dailyInsights.map(renderInsightCard)}
        </View>
      </ScrollView>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="add-circle" size={32} color="#007AFF" />
            <Text style={styles.actionText}>Log Symptoms</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="camera" size={32} color="#007AFF" />
            <Text style={styles.actionText}>Upload Lab Results</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="sync" size={32} color="#007AFF" />
            <Text style={styles.actionText}>Sync Devices</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="location" size={32} color="#007AFF" />
            <Text style={styles.actionText}>Travel Health</Text>
          </TouchableOpacity>
        </View>
      </View>

      <BiomarkerModal
        visible={modalVisible}
        biomarker={selectedBiomarker}
        onClose={() => {
          setModalVisible(false);
          setSelectedBiomarker(null);
        }}
      />

      <HealthChatModal
        visible={chatModalVisible}
        onClose={() => setChatModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  headerContent: {
    flex: 1,
  },
  aiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  scoreCard: {
    margin: 20,
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  scoreGradient: {
    padding: 24,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  section: {
    margin: 20,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  seeAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  biomarkerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  biomarkerInfo: {
    flex: 1,
  },
  biomarkerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  biomarkerValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  biomarkerIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendIndicator: {
    padding: 8,
    borderRadius: 8,
  },
  insightCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  insightAction: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 8,
  },
  quickActions: {
    margin: 20,
    marginTop: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DashboardScreen;
