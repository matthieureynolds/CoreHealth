import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useHealthData } from '../../context/HealthDataContext';
import { HealthAssistantService, HealthAssistantResponse } from '../../services/healthAssistantService';

interface HealthInsightsCardProps {
  onChatPress?: () => void;
}

const HealthInsightsCard: React.FC<HealthInsightsCardProps> = ({ onChatPress }) => {
  const { profile, biomarkers, healthScore, dailyInsights } = useHealthData();
  const [insights, setInsights] = useState<HealthAssistantResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'recommendations' | 'actions'>('insights');
  
  // Modern loading animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    loadHealthInsights();
  }, [profile, biomarkers, healthScore]);

  // Start loading animation when isLoading changes
  useEffect(() => {
    if (isLoading) {
      const startAnimation = () => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(pulseAnim, {
                toValue: 1.2,
                duration: 1000,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: true,
              }),
              Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 2000,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 800,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: true,
              }),
            ]),
          ])
        ).start();
      };
      startAnimation();
    } else {
      // Reset animations when loading stops
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  }, [isLoading]);

  const loadHealthInsights = async () => {
    try {
      setIsLoading(true);
      const response = await HealthAssistantService.generateHealthInsights(
        profile,
        biomarkers,
        healthScore,
        dailyInsights
      );
      setInsights(response);
    } catch (error) {
      console.error('Failed to load health insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return '#30D158';
      case 'medium': return '#FF9500';
      case 'high': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const renderTab = (tab: 'insights' | 'recommendations' | 'actions', icon: string, label: string) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons 
        name={icon as any} 
        size={16} 
        color={activeTab === tab ? '#007AFF' : '#8E8E93'} 
      />
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderInsights = () => (
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

  const renderRecommendations = () => (
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

  const renderActions = () => (
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

  const renderContent = () => {
    switch (activeTab) {
      case 'insights':
        return renderInsights();
      case 'recommendations':
        return renderRecommendations();
      case 'actions':
        return renderActions();
      default:
        return renderInsights();
    }
  };

  // Modern loading component
  const ModernLoadingIndicator = () => {
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.modernLoadingContainer}>
        <Animated.View 
          style={[
            styles.loadingIconContainer,
            {
              transform: [
                { scale: pulseAnim },
                { rotate: spin },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['#007AFF', '#5AC8FA', '#007AFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.loadingGradient}
          >
            <Ionicons name="sparkles" size={32} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.modernLoadingText}>Analyzing your health data...</Text>
        <View style={styles.loadingDots}>
          <Animated.View style={[styles.loadingDot, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.loadingDot, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.loadingDot, { opacity: pulseAnim }]} />
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="sparkles" size={24} color="#007AFF" />
          <Text style={styles.title}>AI Health Insights</Text>
        </View>
        <ModernLoadingIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Ionicons name="sparkles" size={24} color="#007AFF" />
          <Text style={styles.title}>AI Health Insights</Text>
        </View>
        <TouchableOpacity style={styles.chatButton} onPress={onChatPress}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#007AFF" />
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {renderTab('insights', 'bulb', 'Insights')}
        {renderTab('recommendations', 'checkmark-circle', 'Tips')}
        {renderTab('actions', 'flash', 'Actions')}
      </View>

      <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>

      <TouchableOpacity style={styles.refreshButton} onPress={loadHealthInsights}>
        <Ionicons name="refresh" size={16} color="#007AFF" />
        <Text style={styles.refreshText}>Refresh Insights</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginLeft: 8,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chatButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 12,
  },
  // Modern loading styles
  modernLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernLoadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#007AFF',
  },
  contentScrollView: {
    maxHeight: 200,
  },
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
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  refreshText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default HealthInsightsCard; 