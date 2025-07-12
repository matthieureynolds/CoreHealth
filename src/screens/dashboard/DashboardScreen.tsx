import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import BiomarkerModal, {
  BiomarkerInfo,
} from '../../components/common/BiomarkerModal';
import { getBiomarkerInfo } from '../../data/biomarkerDatabase';
import HealthChatModal from '../../components/dashboard/HealthChatModal';
import LabResultDetailModal from '../../components/dashboard/LabResultDetailModal';

// New redesigned components
import HeroHealthScore from '../../components/dashboard/HeroHealthScore';
import SupportingRings from '../../components/dashboard/SupportingRings';
import LabInsightsCard from '../../components/dashboard/LabInsightsCard';
import TravelHealthSummary from '../../components/dashboard/TravelHealthSummary';
import MedicalTimeline from '../../components/dashboard/MedicalTimeline';

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { healthScore, dailyInsights, biomarkers, generateDailyInsights } = useHealthData();
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLabResult, setSelectedLabResult] = useState<any>(null);
  const [labResultModalVisible, setLabResultModalVisible] = useState(false);

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
    const getStatus = (
      name: string,
      val: number,
    ): 'normal' | 'low' | 'high' | 'critical' => {
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

  const handleRingPress = (ringId: string) => {
    console.log('Ring pressed:', ringId);
    // TODO: Navigate to detailed view for this metric
  };

  const handleLabResultPress = (labResult: any) => {
    setSelectedLabResult(labResult);
    setLabResultModalVisible(true);
  };

  const handleTravelPress = () => {
    console.log('Travel pressed');
    // TODO: Navigate to travel health screen
  };

  const handleMedicalEventPress = (event: any) => {
    console.log('Medical event pressed:', event);
    // TODO: Navigate to calendar or event details
  };

  // Calculate mock values for demo
  const overallHealthScore = healthScore?.overall || 82;
  const recoveryScore = healthScore?.recovery || 85;
  const biomarkersScore = Math.round((healthScore?.overall || 80) * 0.9);
  const lifestyleScore = healthScore?.activity || 75;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            Good {getTimeOfDay()}, {user?.displayName ? user.displayName.split(' ')[0] : 'User'}!
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.aiButton}
          onPress={() => setChatModalVisible(true)}
        >
          <Ionicons name="sparkles" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

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
        {/* Hero Health Score */}
        <View style={styles.firstComponent}>
          <HeroHealthScore 
            score={overallHealthScore}
            onPress={() => console.log('Health score pressed')}
          />
        </View>

        {/* Supporting Rings */}
        <SupportingRings 
          recovery={recoveryScore}
          biomarkers={biomarkersScore}
          lifestyle={lifestyleScore}
          onRingPress={handleRingPress}
        />

        {/* Lab Insights */}
        <LabInsightsCard 
          onViewAllPress={() => console.log('View all labs pressed')}
          onLabResultPress={handleLabResultPress}
        />

        {/* Travel Health Summary */}
        <TravelHealthSummary 
          currentLocation="New York, NY"
          jetLagHours={0}
          onTravelPress={handleTravelPress}
        />

        {/* Medical Timeline */}
        <MedicalTimeline 
          onEventPress={handleMedicalEventPress}
        />

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modals */}
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

      <LabResultDetailModal
        visible={labResultModalVisible}
        labResult={selectedLabResult}
        onClose={() => {
          setLabResultModalVisible(false);
          setSelectedLabResult(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  aiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF30',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  bottomSpacing: {
    height: 40,
  },
  firstComponent: {
    marginTop: 20, // Added top spacing
  },
});

export default DashboardScreen;
