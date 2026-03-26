import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHealthData } from '../../../../shared/context/HealthDataContext';
import { HealthAssistantService, HealthAssistantResponse } from '../../../../shared/services/ai/healthAssistantService';
import InsightsLoadingIndicator from './components/InsightsLoadingIndicator';
import InsightsTabBar, { InsightsTab } from './components/InsightsTabBar';
import { InsightsContent, RecommendationsContent, ActionsContent } from './components/InsightsTabContent';

interface HealthInsightsCardProps {
  onChatPress?: () => void;
}

const HealthInsightsCard: React.FC<HealthInsightsCardProps> = ({ onChatPress }) => {
  const { profile, biomarkers, healthScore, dailyInsights } = useHealthData();
  const [insights, setInsights] = useState<HealthAssistantResponse | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [activeTab, setActiveTab]   = useState<InsightsTab>('insights');

  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.8)).current;

  useEffect(() => { loadHealthInsights(); }, [profile, biomarkers, healthScore]);

  useEffect(() => {
    if (!isLoading) {
      pulseAnim.setValue(1); rotateAnim.setValue(0); scaleAnim.setValue(1);
      return;
    }
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,   duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
        ]),
        Animated.timing(rotateAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1,   duration: 800, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 0.8, duration: 800, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [isLoading]);

  const loadHealthInsights = async () => {
    try {
      setIsLoading(true);
      const response = await HealthAssistantService.generateHealthInsights(profile, biomarkers, healthScore, dailyInsights);
      setInsights(response);
    } catch (error) {
      console.error('Failed to load health insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'insights':        return <InsightsContent insights={insights} />;
      case 'recommendations': return <RecommendationsContent insights={insights} />;
      case 'actions':         return <ActionsContent insights={insights} />;
      default:                return <InsightsContent insights={insights} />;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="sparkles" size={24} color="#3AABF0" />
          <Text style={styles.title}>AI Health Insights</Text>
        </View>
        <InsightsLoadingIndicator pulseAnim={pulseAnim} rotateAnim={rotateAnim} scaleAnim={scaleAnim} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Ionicons name="sparkles" size={24} color="#3AABF0" />
          <Text style={styles.title}>AI Health Insights</Text>
        </View>
        <TouchableOpacity style={styles.chatButton} onPress={onChatPress}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#3AABF0" />
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>
      </View>

      <InsightsTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>

      <TouchableOpacity style={styles.refreshButton} onPress={loadHealthInsights}>
        <Ionicons name="refresh" size={16} color="#3AABF0" />
        <Text style={styles.refreshText}>Refresh Insights</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titleSection: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '600', color: '#1D1D1F', marginLeft: 8 },
  chatButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F2F2F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  chatButtonText: { fontSize: 14, color: '#3AABF0', fontWeight: '500', marginLeft: 4 },
  contentScrollView: { maxHeight: 200 },
  refreshButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingVertical: 8 },
  refreshText: { fontSize: 14, color: '#3AABF0', fontWeight: '500', marginLeft: 4 },
});

export default HealthInsightsCard;
