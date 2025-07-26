import React, { useState, useEffect } from 'react';
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
  const { 
    healthScore, 
    dailyInsights, 
    biomarkers, 
    generateDailyInsights,
    getUpcomingJetLagEvents,
    addJetLagPlanningEvent 
  } = useHealthData();
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLabResult, setSelectedLabResult] = useState<any>(null);
  const [labResultModalVisible, setLabResultModalVisible] = useState(false);

  useEffect(() => {
    if (getUpcomingJetLagEvents().length === 0) {
      const thailandEvent = {
        destination: 'Bangkok, Thailand',
        destinationTimezone: 'Asia/Bangkok',
        departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        timeZoneDifference: 5, // 5 hours ahead
        preparationStartDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        daysToAdjust: 4, // 4 days to adjust
        sleepAdjustment: {
          totalTimeZoneDifference: 5,
          direction: 'eastward' as const,
          daysToAdjust: 4,
          maxDailyAdjustment: 1.5,
          dailySchedule: [
            { day: 1, bedtime: '21:30', wakeTime: '06:30', adjustment: 1.5 },
            { day: 2, bedtime: '21:00', wakeTime: '06:00', adjustment: 1.5 },
            { day: 3, bedtime: '20:30', wakeTime: '05:30', adjustment: 1.5 },
            { day: 4, bedtime: '20:00', wakeTime: '05:00', adjustment: 0.5 },
          ],
          strategy: 'Advance bedtime gradually each day before travel',
          recommendations: ['Start adjusting 4 days before departure', 'Use bright light in early morning'],
        },
        lightExposureSchedule: {
          direction: 'eastward' as const,
          strategy: 'Advance circadian rhythm with early bright light',
          schedule: [
            { day: 1, morningLight: '06:00-08:00', eveningAvoidance: '20:00-22:00', duration: 30, notes: 'Bright light exposure in early morning, avoid evening light' },
            { day: 2, morningLight: '06:00-08:00', eveningAvoidance: '20:00-22:00', duration: 30, notes: 'Bright light exposure in early morning, avoid evening light' },
            { day: 3, morningLight: '06:00-08:00', eveningAvoidance: '20:00-22:00', duration: 30, notes: 'Bright light exposure in early morning, avoid evening light' },
            { day: 4, morningLight: '06:00-08:00', eveningAvoidance: '20:00-22:00', duration: 30, notes: 'Bright light exposure in early morning, avoid evening light' },
          ],
          generalTips: ['Use bright light therapy lamp if natural sunlight unavailable', 'Wear sunglasses during light avoidance periods'],
        },
        status: 'upcoming' as const,
      };
      addJetLagPlanningEvent(thailandEvent);
    }
  }, []);

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

  const handleJetLagEventPress = (event: any) => {
    console.log('Jet lag event pressed:', event);
    // TODO: Navigate to detailed jet lag planning view
  };

  // Temporary test function to add a Thailand trip
  const addTestThailandTrip = async () => {
    try {
      const thailandEvent = {
        destination: 'Bangkok, Thailand',
        destinationTimezone: 'Asia/Bangkok',
        departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        timeZoneDifference: 5, // 5 hours ahead
        preparationStartDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        daysToAdjust: 4, // 4 days to adjust (5 hours / 1.5 hours per day = 4 days)
        sleepAdjustment: {
          totalTimeZoneDifference: 5,
          direction: 'eastward' as const,
          daysToAdjust: 4,
          maxDailyAdjustment: 1.5,
          dailySchedule: [
            { day: 1, bedtime: '21:30', wakeTime: '06:30', adjustment: 1.5 },
            { day: 2, bedtime: '21:00', wakeTime: '06:00', adjustment: 1.5 },
            { day: 3, bedtime: '20:30', wakeTime: '05:30', adjustment: 1.5 },
            { day: 4, bedtime: '20:00', wakeTime: '05:00', adjustment: 0.5 },
          ],
          strategy: 'Advance bedtime gradually each day before travel',
          recommendations: ['Start adjusting 4 days before departure', 'Use bright light in early morning'],
        },
        lightExposureSchedule: {
          direction: 'eastward' as const,
          strategy: 'Advance circadian rhythm with early bright light',
          schedule: [
            { day: 1, morningLight: '06:00-08:00', eveningAvoidance: '20:00-22:00', duration: 30, notes: 'Bright light exposure in early morning, avoid evening light' },
            { day: 2, morningLight: '06:00-08:00', eveningAvoidance: '20:00-22:00', duration: 30, notes: 'Bright light exposure in early morning, avoid evening light' },
            { day: 3, morningLight: '06:00-08:00', eveningAvoidance: '20:00-22:00', duration: 30, notes: 'Bright light exposure in early morning, avoid evening light' },
            { day: 4, morningLight: '06:00-08:00', eveningAvoidance: '20:00-22:00', duration: 30, notes: 'Bright light exposure in early morning, avoid evening light' },
          ],
          generalTips: ['Use bright light therapy lamp if natural sunlight unavailable', 'Wear sunglasses during light avoidance periods'],
        },
        status: 'upcoming' as const,
      };
      
      await addJetLagPlanningEvent(thailandEvent);
      console.log('Thailand trip added successfully!');
    } catch (error) {
      console.error('Failed to add Thailand trip:', error);
    }
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
            {`Good ${getTimeOfDay()},${user?.displayName ? ' ' + user.displayName.split(' ')[0] : ''}`}
        </Text>
      </View>
        {/* Removed headerRight icons and buttons */}
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
          jetLagPlanningEvents={getUpcomingJetLagEvents()}
          onJetLagEventPress={handleJetLagEventPress}
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
    alignItems: 'flex-start', // Keep greeting at the top
    paddingHorizontal: 20,
    paddingTop: 32, // Lower greeting more
    paddingBottom: 2, // Tighter fit
    backgroundColor: '#000000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF950030',
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 26, // Slightly smaller for balance
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16, // Even more space below greeting
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
